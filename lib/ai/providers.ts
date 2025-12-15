import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type ModelProvider = "openai" | "google";

export interface ModelMetadata {
  id: string;
  name: string;
  provider: ModelProvider;
  contextWindow: number;
  supportsStreaming: boolean;
  description?: string;
}

export const SUPPORTED_MODELS: ModelMetadata[] = [
  // OpenAI Models
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    contextWindow: 128000,
    supportsStreaming: true,
    description: "Latest GPT-4o model with multimodal capabilities",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    contextWindow: 128000,
    supportsStreaming: true,
    description: "Fast and efficient GPT-4o Mini model",
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
    contextWindow: 16385,
    supportsStreaming: true,
    description: "Fast and cost-effective chat model",
  },
  // Google Models
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    contextWindow: 1048576,
    supportsStreaming: true,
    description: "Google's most capable multimodal model",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "google",
    contextWindow: 1048576,
    supportsStreaming: true,
    description: "Fast and efficient Google model",
  },
];

export interface ProviderConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export class ProviderManager {
  private openai?: OpenAI;
  private google?: GoogleGenerativeAI;

  constructor() {
    const openaiKey = process.env.OPENAI_API_KEY;
    const googleKey = process.env.GOOGLE_GENAI_API_KEY;

    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }

    if (googleKey) {
      this.google = new GoogleGenerativeAI(googleKey);
    }
  }

  getProviderForModel(modelId: string): ModelProvider | null {
    const model = SUPPORTED_MODELS.find(m => m.id === modelId);
    return model?.provider || null;
  }

  getModelMetadata(modelId: string): ModelMetadata | null {
    return SUPPORTED_MODELS.find(m => m.id === modelId) || null;
  }

  getOpenAI(): OpenAI | null {
    return this.openai || null;
  }

  getGoogle(): GoogleGenerativeAI | null {
    return this.google || null;
  }

  isModelSupported(modelId: string): boolean {
    return SUPPORTED_MODELS.some(m => m.id === modelId);
  }

  listAvailableModels(): ModelMetadata[] {
    return SUPPORTED_MODELS.filter(model => {
      if (model.provider === "openai") {
        return !!this.openai;
      }
      if (model.provider === "google") {
        return !!this.google;
      }
      return false;
    });
  }

  validateModelForProvider(modelId: string, provider: ModelProvider): boolean {
    const model = this.getModelMetadata(modelId);
    return model?.provider === provider;
  }
}

export const providerManager = new ProviderManager();

// Utility functions for environment validation
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.OPENAI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
    errors.push("At least one API key must be provided (OPENAI_API_KEY or GOOGLE_GENAI_API_KEY)");
  }

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith("sk-")) {
    errors.push("OPENAI_API_KEY must start with 'sk-'");
  }

  if (process.env.GOOGLE_GENAI_API_KEY && process.env.GOOGLE_GENAI_API_KEY.length < 20) {
    errors.push("GOOGLE_GENAI_API_KEY appears to be invalid");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}