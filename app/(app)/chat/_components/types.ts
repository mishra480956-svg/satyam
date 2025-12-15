export type MessageRole = "SYSTEM" | "USER" | "ASSISTANT" | "TOOL";

export type ConversationSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type ConversationMessage = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type Conversation = ConversationSummary & {
  messages: ConversationMessage[];
};

export type QuickPrompt = {
  id: string;
  key: string;
  title: string;
  prompt: string;
  description?: string | null;
};

export type UiDensity = "comfortable" | "compact";

export type UserPreferences = {
  defaultModel: string;
  temperature: number;
  uiDensity: UiDensity;
};

export type ModelOption = {
  id: string;
  name: string;
  provider: string;
  description?: string;
};

export type QuickActionSuggestion = {
  title: string;
  prompt: string;
  description?: string;
};
