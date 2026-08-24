"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="eyebrow">Interface error</p>
      <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground">
        The session stopped short.
      </h1>
      <p className="max-w-sm text-pretty text-[14px] leading-relaxed text-muted-foreground">
        Something in the interface failed to render. Reloading the view usually
        clears it — your conversations are stored locally and stay put.
      </p>
      <Button onClick={reset}>Reload the view</Button>
    </main>
  );
}
