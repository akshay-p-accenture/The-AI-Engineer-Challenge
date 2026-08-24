"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Square } from "lucide-react";

import type { ChatStatus } from "@/hooks/use-chat";
import { APP_NAME } from "@/lib/api";
import { cn } from "@/lib/utils";

const MAX_HEIGHT = 200;

interface ComposerProps {
  status: ChatStatus;
  notice: string | null;
  onSend: (text: string) => void;
  onStop: () => void;
}

export interface ComposerHandle {
  focus: () => void;
  setValue: (text: string) => void;
}

export const Composer = React.forwardRef<ComposerHandle, ComposerProps>(
  function Composer({ status, notice, onSend, onStop }, ref) {
    const [value, setValue] = React.useState("");
    const areaRef = React.useRef<HTMLTextAreaElement>(null);
    const busy = status !== "idle";

    const resize = React.useCallback(() => {
      const el = areaRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
      el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
    }, []);

    React.useImperativeHandle(ref, () => ({
      focus: () => areaRef.current?.focus(),
      setValue: (text: string) => {
        setValue(text);
        requestAnimationFrame(() => {
          resize();
          areaRef.current?.focus();
          const len = text.length;
          areaRef.current?.setSelectionRange(len, len);
        });
      },
    }));

    React.useEffect(() => resize(), [value, resize]);

    const submit = () => {
      const text = value.trim();
      if (!text || busy) return;
      onSend(text);
      setValue("");
      requestAnimationFrame(resize);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.nativeEvent.isComposing
      ) {
        event.preventDefault();
        submit();
      }
    };

    return (
      <div className="px-6 pb-6 pt-2">
        <div className="mx-auto w-full max-w-3xl">
          <AnimatePresence>
            {notice && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="mb-2.5 text-center text-[12.5px] text-accent/90"
              >
                {notice}
              </motion.p>
            )}
          </AnimatePresence>

          <div
            className={cn(
              "surface flex items-end gap-2 rounded-[26px] py-2 pl-5 pr-2 transition-all duration-200",
              "focus-within:border-primary/35 focus-within:shadow-glow",
            )}
          >
            <label htmlFor="composer" className="sr-only">
              Message {APP_NAME}
            </label>
            <textarea
              id="composer"
              ref={areaRef}
              rows={1}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={`Message ${APP_NAME}…`}
              spellCheck
              className="scroll-slim block max-h-[200px] w-full resize-none bg-transparent py-2.5 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
            />

            {busy ? (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop generating"
                className="mb-0.5 grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-foreground transition-colors hover:bg-white/[0.1]"
              >
                <Square className="size-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={value.trim().length === 0}
                aria-label="Send message"
                className={cn(
                  "mb-0.5 grid size-9 shrink-0 place-items-center rounded-full transition-all duration-200",
                  value.trim().length === 0
                    ? "border border-white/[0.08] bg-white/[0.04] text-muted-foreground/60"
                    : "bg-gradient-to-br from-primary to-accent text-white shadow-glow hover:brightness-110 active:scale-95",
                )}
              >
                <ArrowUp className="size-4" />
              </button>
            )}
          </div>

          <p className="mt-3 text-center text-[12px] text-muted-foreground/80">
            {APP_NAME} can make mistakes. It&apos;s a thinking aid, not a
            clinician — if something feels urgent, reach out to someone you
            trust.
          </p>
        </div>
      </div>
    );
  },
);
