"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChatApp } from "./ChatProvider";
import { useToast } from "./ToastProvider";
import type {
  ConversationMessage,
  QuickActionSuggestion,
  UiDensity,
} from "./types";

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? String(Date.now());
}

function parseSSEBlock(block: string): { event: string; data: string } {
  const lines = block.split("\n");
  let event = "message";
  let data = "";

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim();
    }
    if (line.startsWith("data:")) {
      const chunk = line.replace(/^data:\s?/, "");
      data += chunk;
    }
  }

  return { event, data };
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

function HighlightedText({
  text,
  ranges,
}: {
  text: string;
  ranges?: Array<[number, number]>;
}) {
  const merged = useMemo(() => mergeRanges(ranges ?? []), [ranges]);
  if (merged.length === 0) return <>{text}</>;

  const parts: Array<{ text: string; highlighted: boolean }> = [];
  let cursor = 0;

  for (const [start, end] of merged) {
    if (start > cursor) {
      parts.push({ text: text.slice(cursor, start), highlighted: false });
    }
    parts.push({ text: text.slice(start, end + 1), highlighted: true });
    cursor = end + 1;
  }

  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), highlighted: false });
  }

  return (
    <>
      {parts.map((p, idx) =>
        p.highlighted ? (
          <mark
            key={idx}
            className="rounded bg-amber-200 px-0.5 text-zinc-900 dark:bg-amber-300"
          >
            {p.text}
          </mark>
        ) : (
          <span key={idx}>{p.text}</span>
        ),
      )}
    </>
  );
}

function MessageBubble({
  message,
  density,
  highlightRanges,
}: {
  message: ConversationMessage;
  density: UiDensity;
  highlightRanges?: Array<[number, number]>;
}) {
  const isUser = message.role === "USER";
  const padding = density === "compact" ? "px-3 py-2" : "px-4 py-3";
  const textSize = density === "compact" ? "text-[13px]" : "text-sm";

  return (
    <article
      id={`message-${message.id}`}
      className={"flex w-full " + (isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={
          "max-w-[44rem] rounded-lg border " +
          padding +
          " " +
          textSize +
          " " +
          (isUser
            ? "border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            : "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-black dark:text-zinc-100")
        }
      >
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          {isUser ? "User" : "Assistant"}
        </div>
        <pre className="whitespace-pre-wrap font-sans leading-6">
          <HighlightedText text={message.content} ranges={highlightRanges} />
        </pre>
      </div>
    </article>
  );
}

function PromptChips({
  title,
  prompts,
  onPick,
  disabled,
}: {
  title: string;
  prompts: Array<{ title: string; prompt: string; description?: string | null }>;
  onPick: (prompt: string) => void;
  disabled: boolean;
}) {
  if (prompts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {prompts.map((p) => (
          <button
            key={p.title}
            type="button"
            disabled={disabled}
            title={p.description ?? p.prompt}
            onClick={() => onPick(p.prompt)}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-black dark:hover:bg-zinc-900"
          >
            {p.title}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ConversationView() {
  const {
    activeConversation,
    updateActiveConversation,
    quickPrompts,
    aiSuggestions,
    setAiSuggestions,
    preferences,
    matchRangesByMessageId,
    searchQuery,
  } = useChatApp();
  const { pushToast } = useToast();

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [activeConversation?.messages.length]);

  const send = async () => {
    if (!activeConversation) return;
    const content = input.trim();
    if (!content) return;

    const now = new Date().toISOString();
    const userMessage: ConversationMessage = {
      id: makeId(),
      role: "USER",
      content,
      createdAt: now,
      updatedAt: now,
    };

    const assistantId = makeId();
    const assistantMessage: ConversationMessage = {
      id: assistantId,
      role: "ASSISTANT",
      content: "",
      createdAt: now,
      updatedAt: now,
    };

    setInput("");
    setAiSuggestions([]);

    updateActiveConversation((c) => ({
      ...c,
      updatedAt: now,
      messages: [...c.messages, userMessage, assistantMessage],
    }));

    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          conversationId: activeConversation.id,
          message: content,
          model: preferences.defaultModel,
          temperature: preferences.temperature,
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        pushToast("error", err?.error ?? "Request failed");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        pushToast("error", "No response body");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const { event, data } = parseSSEBlock(part);

          if (event === "token") {
            const parsed = JSON.parse(data) as { delta?: string };
            const delta = parsed.delta ?? "";

            if (delta) {
              updateActiveConversation((c) => ({
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + delta, updatedAt: new Date().toISOString() }
                    : m,
                ),
              }));
              bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            }
          }

          if (event === "suggestions") {
            const suggestions = JSON.parse(data) as QuickActionSuggestion[];
            if (Array.isArray(suggestions)) {
              setAiSuggestions(suggestions.slice(0, 3));
            }
          }

          if (event === "done") {
            setIsStreaming(false);
          }
        }
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        pushToast("success", "Generation cancelled");
      } else {
        pushToast("error", "Something went wrong");
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const abort = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  };

  if (!activeConversation) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Select a conversation
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-auto px-4 py-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {activeConversation.messages.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-sm text-zinc-500 dark:border-zinc-800">
              Start by sending a message or choosing a quick prompt.
            </div>
          ) : null}

          {activeConversation.messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              density={preferences.uiDensity}
              highlightRanges={
                searchQuery.trim() ? matchRangesByMessageId[m.id] : undefined
              }
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
          <PromptChips
            title="Quick prompts"
            prompts={quickPrompts}
            disabled={isStreaming}
            onPick={(p) => setInput(p)}
          />

          <PromptChips
            title="Suggested"
            prompts={aiSuggestions}
            disabled={isStreaming}
            onPick={(p) => setInput(p)}
          />

          <div className="flex flex-col gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!isStreaming) void send();
                }
              }}
              placeholder="Ask SATYNX…"
              className="min-h-[84px] w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 disabled:opacity-50 dark:border-zinc-800 dark:bg-black dark:focus:ring-zinc-800"
              disabled={isStreaming}
            />

            <div className="flex items-center justify-between">
              <div className="text-xs text-zinc-500">
                Enter to send, Shift+Enter for newline
              </div>

              <div className="flex items-center gap-2">
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={abort}
                    className="rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    Abort
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={isStreaming || !input.trim()}
                  onClick={() => void send()}
                  className="rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
