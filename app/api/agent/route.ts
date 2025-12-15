import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { agentOrchestrator } from "@/lib/ai/agent";
import { providerManager, validateEnvironment } from "@/lib/ai/providers";
import { addMessageToConversationForUser } from "@/lib/server/conversations";

// Node.js runtime for OpenAI SDK compatibility
export const runtime = "nodejs";

const AgentRequestSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1, "Message cannot be empty"),
  model: z.string().optional(),
  systemPromptOverrides: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
});

export interface AgentErrorResponse {
  error: string;
  code: string;
  details?: unknown;
  supportedModels?: string[];
}


type SSEMeta = {
  conversationId?: string;
  model: string;
};

// Utility function to create SSE stream
function createSSEStream(
  readableStream: ReadableStream<Uint8Array>,
  options: {
    meta: SSEMeta;
    getSuggestions: (fullText: string) => Promise<unknown>;
  },
) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      const reader = readableStream.getReader();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      let fullText = "";

      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      const pump = async () => {
        try {
          send("meta", options.meta);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const delta = decoder.decode(value, { stream: true });
            if (!delta) continue;

            fullText += delta;
            send("token", { delta });
          }

          send("done", { done: true });

          const suggestions = await options.getSuggestions(fullText);
          send("suggestions", suggestions);
          controller.close();
        } catch (error) {
          console.error("SSE stream error:", error);
          controller.error(error);
        }
      };

      pump();
    },
  });
}

// Utility function to redact secrets from logs
function sanitizeForLogging(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) return obj;
  
  const sanitized = { ...obj };
  const secretKeys = ["OPENAI_API_KEY", "GOOGLE_GENAI_API_KEY", "apiKey", "token"];
  
  for (const key in sanitized) {
    if (secretKeys.some(secretKey => key.toLowerCase().includes(secretKey.toLowerCase()))) {
      (sanitized as Record<string, unknown>)[key] = "[REDACTED]";
    } else if (typeof (sanitized as Record<string, unknown>)[key] === "object") {
      (sanitized as Record<string, unknown>)[key] = sanitizeForLogging((sanitized as Record<string, unknown>)[key]);
    }
  }
  
  return sanitized;
}

// Utility function for retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (error instanceof Error && (
        error.message.includes("Invalid API key") ||
        error.message.includes("Unsupported model") ||
        error.message.includes("Model not found")
      )) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json<AgentErrorResponse>(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json().catch(() => ({}));
    const validated = AgentRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json<AgentErrorResponse>(
        {
          error: "Invalid request data",
          code: "VALIDATION_ERROR",
          details: validated.error.errors,
        },
        { status: 400 }
      );
    }

    const { conversationId, message, model, systemPromptOverrides, temperature, maxTokens } = validated.data;

    // Validate environment
    const envValidation = validateEnvironment();
    if (!envValidation.valid) {
      return NextResponse.json<AgentErrorResponse>(
        {
          error: "Server configuration error",
          code: "CONFIGURATION_ERROR",
          details: envValidation.errors,
        },
        { status: 500 }
      );
    }

    // Use default model if not specified
    const targetModel = model || "gpt-4o-mini";
    
    // Validate model is supported
    if (!providerManager.isModelSupported(targetModel)) {
      return NextResponse.json<AgentErrorResponse>(
        {
          error: `Model '${targetModel}' is not supported`,
          code: "UNSUPPORTED_MODEL",
          supportedModels: providerManager.listAvailableModels().map(m => m.id),
        },
        { status: 400 }
      );
    }

    // Save user message first if conversation exists
    if (conversationId) {
      const userMessage = await addMessageToConversationForUser(userId, conversationId, {
        role: "USER",
        content: message,
      });

      if (!userMessage) {
        return NextResponse.json<AgentErrorResponse>(
          { error: "Conversation not found", code: "CONVERSATION_NOT_FOUND" },
          { status: 404 }
        );
      }
    }

    // Process the message with retries
    const result = await retryWithBackoff(async () => {
      return await agentOrchestrator.processMessage(
        userId,
        conversationId || null,
        message,
        targetModel,
        {
          temperature,
          maxTokens,
          systemPromptOverrides,
        }
      );
    });

    // Create SSE stream from the response
    const sseStream = createSSEStream(result.stream, {
      meta: {
        conversationId,
        model: targetModel,
      },
      getSuggestions: async (fullText) => {
        try {
          return await agentOrchestrator.getQuickActionSuggestions(
            fullText,
            targetModel,
          );
        } catch {
          return [];
        }
      },
    });

    // Return streaming response with proper headers
    return new NextResponse(sseStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // Disable buffering on nginx
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });

  } catch (error) {
    console.error("Agent endpoint error:", sanitizeForLogging(error));

    // Handle specific error types
    if (error instanceof Error) {
      const errorMessage = error.message;
      
      if (errorMessage.includes("Invalid API key")) {
        return NextResponse.json<AgentErrorResponse>(
          { error: "Invalid API key configuration", code: "INVALID_API_KEY" },
          { status: 500 }
        );
      }
      
      if (errorMessage.includes("Rate limit")) {
        return NextResponse.json<AgentErrorResponse>(
          { error: "Rate limit exceeded", code: "RATE_LIMITED" },
          { status: 429 }
        );
      }
      
      if (errorMessage.includes("Unsupported model")) {
        return NextResponse.json<AgentErrorResponse>(
          { error: "Model not supported", code: "UNSUPPORTED_MODEL" },
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json<AgentErrorResponse>(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        details: process.env.NODE_ENV === "development" ? (error as Error)?.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}