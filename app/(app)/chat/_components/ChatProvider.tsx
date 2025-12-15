"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Conversation,
  ConversationSummary,
  ModelOption,
  QuickActionSuggestion,
  QuickPrompt,
  UiDensity,
  UserPreferences,
} from "./types";

export type SearchResult = {
  messageId: string;
  role: string;
  score: number;
  ranges: Array<[number, number]>;
  snippet: string;
};

type ChatContextValue = {
  user: { name?: string | null; email?: string | null; image?: string | null };
  conversations: ConversationSummary[];
  setConversations: (conversations: ConversationSummary[]) => void;
  refreshConversations: () => Promise<void>;

  activeConversation: Conversation | null;
  setActiveConversation: (conversation: Conversation) => void;
  updateActiveConversation: (
    updater: (conversation: Conversation) => Conversation,
  ) => void;

  quickPrompts: QuickPrompt[];

  aiSuggestions: QuickActionSuggestion[];
  setAiSuggestions: (suggestions: QuickActionSuggestion[]) => void;

  availableModels: ModelOption[];
  preferences: UserPreferences;
  updatePreferences: (input: Partial<UserPreferences>) => Promise<void>;

  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: SearchResult[];
  matchRangesByMessageId: Record<string, Array<[number, number]>>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

function toPreferences(input: unknown): UserPreferences {
  const obj = (input ?? {}) as Partial<UserPreferences>;
  return {
    defaultModel: obj.defaultModel ?? "gpt-4o-mini",
    temperature: typeof obj.temperature === "number" ? obj.temperature : 0.7,
    uiDensity: (obj.uiDensity as UiDensity) ?? "comfortable",
  };
}

function mergeRanges(ranges: Array<[number, number]>) {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const [start, end] = sorted[i];
    const last = merged[merged.length - 1];

    if (start <= last[1] + 1) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }

  return merged;
}

function fuzzyMatch(text: string, query: string) {
  const t = text.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return null;

  const positions: number[] = [];
  let ti = 0;
  let score = 0;

  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    const foundAt = t.indexOf(ch, ti);
    if (foundAt === -1) return null;

    positions.push(foundAt);

    // Basic scoring: consecutive matches and word-start bonus
    const prev = positions[positions.length - 2];
    if (prev != null && foundAt === prev + 1) score += 4;
    score += 1;

    if (foundAt === 0 || /\s/.test(t[foundAt - 1] ?? "")) score += 2;

    ti = foundAt + 1;
  }

  const ranges = mergeRanges(
    positions.map((p) => [p, p] as [number, number]),
  );

  const first = ranges[0]?.[0] ?? 0;
  const start = Math.max(0, first - 40);
  const end = Math.min(text.length, first + 140);
  const snippet =
    (start > 0 ? "…" : "") +
    text.slice(start, end).trim() +
    (end < text.length ? "…" : "");

  return { score, ranges, snippet };
}

export function ChatProvider({
  children,
  initialConversations,
  initialPreferences,
  initialQuickPrompts,
  availableModels,
  user,
}: {
  children: ReactNode;
  initialConversations: ConversationSummary[];
  initialPreferences: UserPreferences;
  initialQuickPrompts: QuickPrompt[];
  availableModels: ModelOption[];
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const [conversations, setConversations] = useState<ConversationSummary[]>(
    initialConversations,
  );
  const [activeConversation, setActiveConversationState] = useState<
    Conversation | null
  >(null);

  const setActiveConversation = useCallback((conversation: Conversation) => {
    setActiveConversationState(conversation);
    setConversations((list) => {
      const idx = list.findIndex((c) => c.id === conversation.id);
      const summary: ConversationSummary = {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      };

      if (idx === -1) return [summary, ...list];

      const updated = [...list];
      updated[idx] = summary;
      return updated;
    });
  }, []);

  const [preferences, setPreferences] = useState<UserPreferences>(
    toPreferences(initialPreferences),
  );
  const [aiSuggestions, setAiSuggestions] = useState<QuickActionSuggestion[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const refreshConversations = useCallback(async () => {
    const res = await fetch("/api/conversations", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json().catch(() => null)) as
      | { conversations: ConversationSummary[] }
      | null;

    if (data?.conversations) {
      setConversations(data.conversations);
    }
  }, []);

  const updateActiveConversation = useCallback(
    (updater: (conversation: Conversation) => Conversation) => {
      setActiveConversationState((prev) => {
        if (!prev) return prev;
        const next = updater(prev);

        setConversations((list) => {
          const idx = list.findIndex((c) => c.id === next.id);
          const summary: ConversationSummary = {
            id: next.id,
            title: next.title,
            createdAt: next.createdAt,
            updatedAt: next.updatedAt,
          };

          if (idx === -1) return [summary, ...list];

          const updated = [...list];
          updated[idx] = summary;
          return updated;
        });

        return next;
      });
    },
    [],
  );

  const updatePreferences = useCallback(async (input: Partial<UserPreferences>) => {
    let previous: UserPreferences | null = null;

    setPreferences((prev) => {
      previous = prev;
      return { ...prev, ...input };
    });

    const res = await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      if (previous) {
        setPreferences(previous);
      }
      throw new Error("Failed to update preferences");
    }

    const data = (await res.json().catch(() => null)) as
      | { preferences?: Partial<UserPreferences> }
      | null;

    if (data?.preferences) {
      setPreferences(toPreferences(data.preferences));
    }
  }, []);

  const { searchResults, matchRangesByMessageId } = useMemo(() => {
    if (!activeConversation || !searchQuery.trim()) {
      return {
        searchResults: [] as SearchResult[],
        matchRangesByMessageId: {} as Record<string, Array<[number, number]>>,
      };
    }

    const results: SearchResult[] = [];
    const matchMap: Record<string, Array<[number, number]>> = {};

    for (const msg of activeConversation.messages) {
      const match = fuzzyMatch(msg.content, searchQuery);
      if (!match) continue;

      const entry: SearchResult = {
        messageId: msg.id,
        role: msg.role,
        score: match.score,
        ranges: match.ranges,
        snippet: match.snippet,
      };
      results.push(entry);
      matchMap[msg.id] = match.ranges;
    }

    results.sort((a, b) => b.score - a.score);

    return {
      searchResults: results.slice(0, 25),
      matchRangesByMessageId: matchMap,
    };
  }, [activeConversation, searchQuery]);

  const value = useMemo<ChatContextValue>(
    () => ({
      user,
      conversations,
      setConversations,
      refreshConversations,
      activeConversation,
      setActiveConversation,
      updateActiveConversation,
      quickPrompts: initialQuickPrompts,
      aiSuggestions,
      setAiSuggestions,
      availableModels,
      preferences,
      updatePreferences,
      searchQuery,
      setSearchQuery,
      searchResults,
      matchRangesByMessageId,
    }),
    [
      user,
      conversations,
      refreshConversations,
      activeConversation,
      setActiveConversation,
      updateActiveConversation,
      initialQuickPrompts,
      aiSuggestions,
      availableModels,
      preferences,
      updatePreferences,
      searchQuery,
      searchResults,
      matchRangesByMessageId,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatApp() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatApp must be used within ChatProvider");
  }
  return ctx;
}
