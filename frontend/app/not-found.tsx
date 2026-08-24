import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="eyebrow">404</p>
      <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground">
        Nothing lives at this address.
      </h1>
      <Button asChild variant="secondary">
        <Link href="/">Back to the chat</Link>
      </Button>
    </main>
  );
}
