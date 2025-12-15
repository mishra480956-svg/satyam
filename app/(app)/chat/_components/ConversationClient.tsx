"use client";

import { useEffect } from "react";
import { useChatApp } from "./ChatProvider";
import type { Conversation } from "./types";
import ConversationView from "./ConversationView";

export default function ConversationClient({
  initialConversation,
}: {
  initialConversation: Conversation;
}) {
  const { setActiveConversation, setAiSuggestions, setSearchQuery } = useChatApp();

  useEffect(() => {
    setActiveConversation(initialConversation);
    setAiSuggestions([]);
    setSearchQuery("");
  }, [initialConversation, setActiveConversation, setAiSuggestions, setSearchQuery]);

  return <ConversationView />;
}
