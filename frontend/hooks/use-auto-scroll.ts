"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STICK_THRESHOLD = 96;

/**
 * Keeps a scroll container pinned to the bottom while new content arrives,
 * unless the reader has scrolled up — then it stays put and reports it, so the
 * UI can offer a "Jump to latest" affordance instead of yanking the view.
 */
export function useAutoScroll<T extends HTMLElement>(dependency: unknown) {
  const ref = useRef<T | null>(null);
  const [pinned, setPinned] = useState(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    setPinned(true);
  }, []);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setPinned(distance < STICK_THRESHOLD);
  }, []);

  useEffect(() => {
    if (!pinned) return;
    const el = ref.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
    });
    return () => cancelAnimationFrame(id);
  }, [dependency, pinned]);

  return { ref, pinned, onScroll, scrollToBottom };
}
