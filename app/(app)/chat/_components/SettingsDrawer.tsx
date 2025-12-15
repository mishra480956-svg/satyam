"use client";

import { useEffect, useMemo, useState } from "react";
import { useChatApp } from "./ChatProvider";
import { useToast } from "./ToastProvider";
import type { UiDensity } from "./types";

export default function SettingsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { preferences, updatePreferences, availableModels } = useChatApp();
  const { pushToast } = useToast();

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const modelOptions = useMemo(() => {
    if (availableModels.length > 0) return availableModels;
    return [
      { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
      { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "openai" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "google" },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "google" },
    ];
  }, [availableModels]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Preferences</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            Close
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Default model
            </span>
            <select
              value={preferences.defaultModel}
              className="h-9 rounded-md border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-800 dark:bg-black"
              onChange={async (e) => {
                setSaving(true);
                try {
                  await updatePreferences({ defaultModel: e.target.value });
                  pushToast("success", "Model updated");
                } catch {
                  pushToast("error", "Failed to update model");
                } finally {
                  setSaving(false);
                }
              }}
            >
              {modelOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Temperature: {preferences.temperature.toFixed(1)}
            </span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={preferences.temperature}
              onChange={async (e) => {
                const next = Number.parseFloat(e.target.value);
                setSaving(true);
                try {
                  await updatePreferences({ temperature: next });
                } catch {
                  pushToast("error", "Failed to update temperature");
                } finally {
                  setSaving(false);
                }
              }}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              UI density
            </span>
            <select
              value={preferences.uiDensity}
              className="h-9 rounded-md border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-800 dark:bg-black"
              onChange={async (e) => {
                const next = e.target.value as UiDensity;
                setSaving(true);
                try {
                  await updatePreferences({ uiDensity: next });
                  pushToast("success", "Density updated");
                } catch {
                  pushToast("error", "Failed to update density");
                } finally {
                  setSaving(false);
                }
              }}
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </label>

          {saving ? (
            <div className="text-xs text-zinc-500">Saving…</div>
          ) : (
            <div className="text-xs text-zinc-500">
              Changes apply immediately to new generations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
