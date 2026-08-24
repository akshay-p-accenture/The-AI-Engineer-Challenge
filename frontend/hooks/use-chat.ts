"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ChatApiError, describeError, sendChat } from "@/lib/api";
import {
  loadActiveId,
  loadConversations,
  saveActiveId,
  saveConversations,
} from "@/lib/storage";
import type {
  Conversation,
  Message,
  RequestMetric,
  SessionInfo,
} from "@/lib/types";
import { estimateTokens, titleFrom, uid } from "@/lib/utils";

export type ChatStatus = "idle" | "sending" | "streaming";

function emptyConversation(): Conversation {
  const now = Date.now();
  return {
    id: uid("conv"),
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [metrics, setMetrics] = useState<RequestMetric[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Generated after mount: uid() and Date.now() differ between the server
  // render and the client render, which is exactly what trips hydration.
  const [session, setSession] = useState<SessionInfo>({ id: "", startedAt: 0 });

  useEffect(() => {
    setSession({ id: uid("sess"), startedAt: Date.now() });
  }, []);

  const abortRef = useRef<AbortController | null>(null);

  /* ── hydration ─────────────────────────────────────────────────────────*/

  useEffect(() => {
    const stored = loadConversations();
    const storedActive = loadActiveId();
    if (stored.length > 0) {
      setConversations(stored);
      setActiveId(
        storedActive && stored.some((c) => c.id === storedActive)
          ? storedActive
          : stored[0].id,
      );
    } else {
      const fresh = emptyConversation();
      setConversations([fresh]);
      setActiveId(fresh.id);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveConversations(conversations);
  }, [conversations, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveActiveId(activeId);
  }, [activeId, hydrated]);

  // Keeps the selection valid after a delete or a storage rehydrate.
  useEffect(() => {
    if (!hydrated || conversations.length === 0) return;
    if (!conversations.some((c) => c.id === activeId)) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId, hydrated]);

  useEffect(() => () => abortRef.current?.abort(), []);

  /* ── selectors ─────────────────────────────────────────────────────────*/

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const messages = activeConversation?.messages ?? [];
  const isBusy = status !== "idle";

  /* ── mutation helpers ──────────────────────────────────────────────────*/

  const patchConversation = useCallback(
    (id: string, patch: (conv: Conversation) => Conversation) => {
      setConversations((prev) =>
        prev.map((conv) => (conv.id === id ? patch(conv) : conv)),
      );
    },
    [],
  );

  const patchMessage = useCallback(
    (convId: string, msgId: string, patch: Partial<Message>) => {
      patchConversation(convId, (conv) => ({
        ...conv,
        updatedAt: Date.now(),
        messages: conv.messages.map((m) =>
          m.id === msgId ? { ...m, ...patch } : m,
        ),
      }));
    },
    [patchConversation],
  );

  /* ── the request ───────────────────────────────────────────────────────*/

  const run = useCallback(
    async (convId: string, prompt: string, assistantId: string) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setStatus("sending");
      setNotice(null);

      let buffered = "";
      let flushHandle: ReturnType<typeof setTimeout> | null = null;

      const flush = () => {
        flushHandle = null;
        patchMessage(convId, assistantId, { content: buffered });
      };

      try {
        const result = await sendChat({
          message: prompt,
          signal: controller.signal,
          onToken: (chunk) => {
            buffered += chunk;
            setStatus((s) => (s === "sending" ? "streaming" : s));
            // Coalesce paints so long answers stay at 60fps.
            if (flushHandle === null) flushHandle = setTimeout(flush, 32);
          },
          onRetry: (attempt) => {
            setNotice(`Connection hiccup — retrying (attempt ${attempt + 1})…`);
          },
        });

        if (flushHandle) clearTimeout(flushHandle);
        patchMessage(convId, assistantId, {
          content: result.reply,
          status: "complete",
          latencyMs: result.latencyMs,
          error: undefined,
        });
        setMetrics((prev) => [
          ...prev.slice(-49),
          {
            id: uid("req"),
            at: Date.now(),
            ok: true,
            latencyMs: result.latencyMs,
            promptTokens: estimateTokens(prompt),
            replyTokens: estimateTokens(result.reply),
            attempts: result.attempts,
            streamed: result.streamed,
          },
        ]);
      } catch (error) {
        if (flushHandle) clearTimeout(flushHandle);
        const cancelled =
          error instanceof ChatApiError && error.kind === "aborted";

        if (cancelled) {
          patchMessage(convId, assistantId, {
            content: buffered,
            status: buffered ? "complete" : "error",
            error: buffered ? undefined : "Stopped before the reply arrived.",
          });
        } else {
          patchMessage(convId, assistantId, {
            content: buffered,
            status: "error",
            error: describeError(error),
          });
          setMetrics((prev) => [
            ...prev.slice(-49),
            {
              id: uid("req"),
              at: Date.now(),
              ok: false,
              latencyMs: 0,
              promptTokens: estimateTokens(prompt),
              replyTokens: 0,
              attempts: error instanceof ChatApiError ? error.attempts : 1,
              streamed: false,
              status: error instanceof ChatApiError ? error.status : undefined,
            },
          ]);
        }
      } finally {
        abortRef.current = null;
        setNotice(null);
        setStatus("idle");
      }
    },
    [patchMessage],
  );

  /* ── public actions ────────────────────────────────────────────────────*/

  const send = useCallback(
    (text: string) => {
      const prompt = text.trim();
      if (!prompt || isBusy) return;

      let convId = activeId;
      if (!convId) {
        const fresh = emptyConversation();
        convId = fresh.id;
        setConversations((prev) => [fresh, ...prev]);
        setActiveId(fresh.id);
      }

      const now = Date.now();
      const userMessage: Message = {
        id: uid("msg"),
        role: "user",
        content: prompt,
        createdAt: now,
        status: "complete",
      };
      const assistantMessage: Message = {
        id: uid("msg"),
        role: "assistant",
        content: "",
        createdAt: now,
        status: "streaming",
      };

      patchConversation(convId, (conv) => ({
        ...conv,
        title: conv.messages.length === 0 ? titleFrom(prompt) : conv.title,
        updatedAt: now,
        messages: [...conv.messages, userMessage, assistantMessage],
      }));

      void run(convId, prompt, assistantMessage.id);
    },
    [activeId, isBusy, patchConversation, run],
  );

  /** Re-asks the last user message and replaces the answer in place. */
  const regenerate = useCallback(() => {
    if (isBusy || !activeConversation) return;
    const conv = activeConversation;
    const lastUser = [...conv.messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;

    const assistantId = uid("msg");
    const upToUser = conv.messages.slice(
      0,
      conv.messages.findIndex((m) => m.id === lastUser.id) + 1,
    );

    patchConversation(conv.id, (c) => ({
      ...c,
      updatedAt: Date.now(),
      messages: [
        ...upToUser,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          createdAt: Date.now(),
          status: "streaming",
        },
      ],
    }));

    void run(conv.id, lastUser.content, assistantId);
  }, [activeConversation, isBusy, patchConversation, run]);

  const stop = useCallback(() => {
    abortRef.current?.abort(new DOMException("Stopped", "AbortError"));
  }, []);

  const newConversation = useCallback(() => {
    const firstEmpty = conversations.find((c) => c.messages.length === 0);
    if (firstEmpty) {
      setActiveId(firstEmpty.id);
      return;
    }
    const fresh = emptyConversation();
    setConversations((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
  }, [conversations]);

  const selectConversation = useCallback(
    (id: string) => {
      if (id === activeId) return;
      stop();
      setActiveId(id);
    },
    [activeId, stop],
  );

  const deleteConversation = useCallback(
    (id: string) => {
      if (id === activeId) stop();
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        return next.length > 0 ? next : [emptyConversation()];
      });
    },
    [activeId, stop],
  );

  const renameConversation = useCallback(
    (id: string, title: string) => {
      patchConversation(id, (conv) => ({
        ...conv,
        title: title.trim() || conv.title,
      }));
    },
    [patchConversation],
  );

  const clearAll = useCallback(() => {
    stop();
    const fresh = emptyConversation();
    setConversations([fresh]);
    setActiveId(fresh.id);
    setMetrics([]);
  }, [stop]);

  return {
    hydrated,
    session,
    conversations,
    activeConversation,
    activeId,
    messages,
    status,
    isBusy,
    notice,
    metrics,
    send,
    regenerate,
    stop,
    newConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    clearAll,
  };
}

export type ChatController = ReturnType<typeof useChat>;
