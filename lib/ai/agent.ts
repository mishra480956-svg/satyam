import { providerManager, type ModelProvider } from "./providers";
import { getConversationForUser } from "@/lib/server/conversations";
import { type MessageRole } from "@prisma/client";
import OpenAI from "openai";
import { GoogleGenerativeAI, type Content, type Part } from "@google/generative-ai";
import type { ModelMetadata } from "./providers";
type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface ConversationContext {
  messages: Array<{
    id: string;
    role: MessageRole;
    content: string;
    createdAt: Date;
  }>;
  totalTokens: number;
  needsSummarization: boolean;
}

export interface OrchestratorOptions {
  temperature?: number;
  maxTokens?: number;
  systemPromptOverrides?: string;
  maxContextMessages?: number;
  summarizationThreshold?: number;
}

export interface QuickActionSuggestion {
  title: string;
  prompt: string;
  description?: string;
}

export interface OrchestratorResponse {
  stream: ReadableStream<Uint8Array>;
  messageId?: string;
  suggestions: QuickActionSuggestion[];
  metadata: {
    model: string;
    provider: ModelProvider;
    totalTokens: number;
    contextUsed: number;
    finishReason?: string;
  };
}

export class AgentOrchestrator {
  private openai: OpenAI | null;
  private google: GoogleGenerativeAI | null;

  constructor() {
    this.openai = providerManager.getOpenAI();
    this.google = providerManager.getGoogle();
  }

  async processMessage(
    userId: string,
    conversationId: string | null,
    message: string,
    model: string,
    options: OrchestratorOptions = {}
  ): Promise<OrchestratorResponse> {
    const provider = providerManager.getProviderForModel(model);
    if (!provider) {
      throw new Error(`Unsupported model: ${model}`);
    }

    const metadata = providerManager.getModelMetadata(model);
    if (!metadata) {
      throw new Error(`Model metadata not found for: ${model}`);
    }

    // Load conversation context
    let conversationContext: ConversationContext;
    if (conversationId) {
      conversationContext = await this.loadConversationContext(
        userId,
        conversationId,
        model,
        options
      );
    } else {
      conversationContext = { messages: [], totalTokens: 0, needsSummarization: false };
    }

    // Prepare messages for the AI provider
    const aiMessages = this.prepareMessages(conversationContext, message, options.systemPromptOverrides);

    // Create streaming response based on provider
    if (provider === "openai") {
      return this.handleOpenAIStream(userId, conversationId, model, aiMessages, options, metadata);
    } else if (provider === "google") {
      return this.handleGoogleStream(userId, conversationId, model, aiMessages, options, metadata);
    }

    throw new Error(`Unsupported provider: ${provider}`);
  }

  private async loadConversationContext(
    userId: string,
    conversationId: string,
    model: string,
    options: OrchestratorOptions
  ): Promise<ConversationContext> {
    const conversation = await getConversationForUser(userId, conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const modelMetadata = providerManager.getModelMetadata(model);
    if (!modelMetadata) {
      throw new Error(`Model metadata not found for: ${model}`);
    }

    const maxContextMessages = options.maxContextMessages || 20;
    const summarizationThreshold = options.summarizationThreshold || (modelMetadata.contextWindow * 0.8);

    // Take the most recent messages
    const recentMessages = conversation.messages.slice(-maxContextMessages);
    
    // Simple token estimation (rough approximation)
    const estimatedTokens = this.estimateTokens(recentMessages);
    const needsSummarization = estimatedTokens > summarizationThreshold;

    let processedMessages = recentMessages;
    if (needsSummarization && recentMessages.length > 6) {
      // Keep system message (if any), last few messages, and summarize the middle
      const systemMessages = recentMessages.filter(m => m.role === "SYSTEM");
      const lastMessages = recentMessages.slice(-4);
      const middleMessages = recentMessages.slice(1, -4);
      
      if (middleMessages.length > 0) {
        const summary = await this.summarizeMessages(middleMessages, model);
        processedMessages = [
          ...systemMessages,
          {
            id: "summary",
            role: "SYSTEM" as MessageRole,
            content: `Previous conversation summary: ${summary}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          ...lastMessages,
        ];
      }
    }

    return {
      messages: processedMessages,
      totalTokens: this.estimateTokens(processedMessages),
      needsSummarization,
    };
  }

  private prepareMessages(
    context: ConversationContext,
    newMessage: string,
    systemPromptOverrides?: string
  ): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [];

    // Add system prompt
    const systemPrompt = systemPromptOverrides || 
      "You are SATYNX, a helpful AI assistant. Provide clear, helpful responses.";
    messages.push({ role: "system", content: systemPrompt });

    // Add conversation context
    context.messages.forEach(msg => {
      if (msg.role !== "SYSTEM") {
        messages.push({
          role: msg.role.toLowerCase(),
          content: msg.content,
        });
      }
    });

    // Add the new user message
    messages.push({ role: "user", content: newMessage });

    return messages;
  }

  private estimateTokens(messages: Array<{ content: string; role: MessageRole }>): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return messages.reduce((total, msg) => {
      return total + Math.ceil(msg.content.length / 4);
    }, 0);
  }

  private async summarizeMessages(messages: Array<{ role: MessageRole; content: string }>, model: string): Promise<string> {
    try {
      const provider = providerManager.getProviderForModel(model);
      if (provider === "openai" && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Summarize the following conversation messages in 2-3 sentences, focusing on key points and decisions made.",
            },
            {
              role: "user",
              content: messages.map(m => `${m.role}: ${m.content}`).join("\n"),
            },
          ],
          max_tokens: 150,
        });

        return response.choices[0]?.message?.content || "Summary not available";
      }
    } catch (error) {
      console.error("Failed to summarize messages:", error);
    }

    // Fallback: simple truncation
    return messages.slice(0, 3).map(m => m.content.substring(0, 100)).join(" ");
  }

  private handleOpenAIStream = async (
    userId: string,
    conversationId: string | null,
    model: string,
    messages: Array<{ role: string; content: string }>,
    options: OrchestratorOptions,
    metadata: ModelMetadata
  ): Promise<OrchestratorResponse> => {
    if (!this.openai) {
      throw new Error("OpenAI provider not configured");
    }

    return new Promise((resolve) => {
      const stream = new ReadableStream<Uint8Array>({
        start: (controller) => {
          this.handleOpenAIStreamExecution(
            userId, conversationId, model, messages, options, metadata, controller
          ).catch(error => {
            console.error("OpenAI streaming error:", error);
            controller.error(error);
          });
        },
      });

      // Generate suggestions asynchronously
      this.generateQuickActions("", model).then(suggestions => {
        resolve({
          stream,
          messageId: undefined,
          suggestions,
          metadata: {
            model,
            provider: "openai" as const,
            totalTokens: 0,
            contextUsed: messages.length,
          },
        });
      }).catch(() => {
        resolve({
          stream,
          messageId: undefined,
          suggestions: [],
          metadata: {
            model,
            provider: "openai" as const,
            totalTokens: 0,
            contextUsed: messages.length,
          },
        });
      });
    });
  }

  private async handleOpenAIStreamExecution(
    userId: string,
    conversationId: string | null,
    model: string,
    messages: Array<{ role: string; content: string }>,
    options: OrchestratorOptions,
    metadata: ModelMetadata,
    controller: ReadableStreamDefaultController<Uint8Array>
  ): Promise<void> {
    try {
      if (!this.openai) {
        throw new Error("OpenAI provider not available");
      }

      let fullResponse = "";

      // Convert messages to proper OpenAI format
      const openaiMessages: OpenAIMessage[] = messages.map(msg => ({
        role: msg.role as "system" | "user" | "assistant",
        content: msg.content,
      }));

      const openai = this.openai!;
      const completion = await openai.chat.completions.create({
        model,
        messages: openaiMessages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || metadata.contextWindow,
        stream: true,
      });

      for await (const chunk of completion) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) {
          fullResponse += delta;
          
          // Stream the delta to the client
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(delta));
        }
      }

      // Save the complete message to database if we have a conversation
      if (conversationId && fullResponse) {
        const { addMessageToConversationForUser } = await import("@/lib/server/conversations");
        await addMessageToConversationForUser(userId, conversationId, {
          role: "ASSISTANT",
          content: fullResponse,
        });
      }

      controller.close();
    } catch (error) {
      console.error("OpenAI streaming error:", error);
      throw error;
    }
  }

  private handleGoogleStream = async (
    userId: string,
    conversationId: string | null,
    model: string,
    messages: Array<{ role: string; content: string }>,
    options: OrchestratorOptions,
    metadata: ModelMetadata
  ): Promise<OrchestratorResponse> => {
    if (!this.google) {
      throw new Error("Google provider not configured");
    }

    return new Promise((resolve) => {
      const stream = new ReadableStream<Uint8Array>({
        start: (controller) => {
          this.handleGoogleStreamExecution(
            userId, conversationId, model, messages, options, metadata, controller
          ).catch(error => {
            console.error("Google streaming error:", error);
            controller.error(error);
          });
        },
      });

      // Generate suggestions asynchronously
      this.generateQuickActions("", model).then(suggestions => {
        resolve({
          stream,
          messageId: undefined,
          suggestions,
          metadata: {
            model,
            provider: "google" as const,
            totalTokens: 0,
            contextUsed: messages.length,
          },
        });
      }).catch(() => {
        resolve({
          stream,
          messageId: undefined,
          suggestions: [],
          metadata: {
            model,
            provider: "google" as const,
            totalTokens: 0,
            contextUsed: messages.length,
          },
        });
      });
    });
  }

  private async handleGoogleStreamExecution(
    userId: string,
    conversationId: string | null,
    model: string,
    messages: Array<{ role: string; content: string }>,
    options: OrchestratorOptions,
    metadata: ModelMetadata,
    controller: ReadableStreamDefaultController<Uint8Array>
  ): Promise<void> {
    try {
      if (!this.google) {
        throw new Error("Google provider not available");
      }

      let fullResponse = "";

      // Convert messages to Google format
      const contents: Content[] = messages
        .filter(m => m.role !== "system")
        .map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }] as Part[],
        }));

      // Add system instruction
      const systemInstruction = messages.find(m => m.role === "system")?.content;

      const google = this.google!;
      const genModel = google.getGenerativeModel({
        model,
        systemInstruction,
      });

      const result = await genModel.generateContentStream({
        contents,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || metadata.contextWindow,
        },
      });

      for await (const chunk of result.stream) {
        const delta = chunk.text();
        if (delta) {
          fullResponse += delta;
          
          // Stream the delta to the client
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(delta));
        }
      }

      // Save the complete message to database if we have a conversation
      if (conversationId && fullResponse) {
        const { addMessageToConversationForUser } = await import("@/lib/server/conversations");
        await addMessageToConversationForUser(userId, conversationId, {
          role: "ASSISTANT",
          content: fullResponse,
        });
      }

      controller.close();
    } catch (error) {
      console.error("Google streaming error:", error);
      throw error;
    }
  }

  private async generateQuickActions(response: string, model: string): Promise<QuickActionSuggestion[]> {
    try {
      const provider = providerManager.getProviderForModel(model);
      
      if (!response.trim()) {
        // Default suggestions when no response yet
        return [
          {
            title: "Explain more",
            prompt: "Can you explain that in more detail?",
            description: "Get a deeper explanation of the topic",
          },
          {
            title: "Give examples",
            prompt: "Can you provide some examples?",
            description: "See practical examples of what was discussed",
          },
          {
            title: "Alternative approach",
            prompt: "What's another way to think about this?",
            description: "Explore different perspectives",
          },
        ];
      }

      // Generate contextual suggestions based on the response
      if (provider === "openai" && this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Based on the assistant's response, generate 3 suggested follow-up questions that would help the user explore the topic further. Return as JSON array with title, prompt, and description fields.",
            },
            {
              role: "user",
              content: `Assistant response: ${response}`,
            },
          ],
          max_tokens: 200,
          temperature: 0.7,
        });

        try {
          const suggestions = JSON.parse(completion.choices[0]?.message?.content || "[]");
          return suggestions.slice(0, 3);
        } catch {
          // Fallback to default suggestions
        }
      }
    } catch (error) {
      console.error("Failed to generate quick actions:", error);
    }

    // Default suggestions
    return [
      {
        title: "Tell me more",
        prompt: "Can you tell me more about that?",
        description: "Get additional information on the topic",
      },
      {
        title: "How does this work?",
        prompt: "How does that work in practice?",
        description: "Understand the practical implementation",
      },
      {
        title: "What are the implications?",
        prompt: "What are the broader implications of this?",
        description: "Explore the bigger picture",
      },
    ];
  }
}

export const agentOrchestrator = new AgentOrchestrator();