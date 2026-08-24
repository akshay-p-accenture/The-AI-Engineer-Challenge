# Meridian

A production-ready Next.js 15 chat front end for the FastAPI backend in `index.py`.
Dark-only, three panels, built around one signature element: a line that breathes
at rest and quickens while the coach thinks.

```
┌──────────────┬─────────────────────────────┬──────────────┐
│ Conversations│  Chat                       │  Insights    │
│  New chat    │   hero → messages → composer│  requests    │
│  Search      │                             │  tokens      │
│  History     │                             │  model       │
│  Profile     │                             │  session     │
└──────────────┴─────────────────────────────┴──────────────┘
```

## Run it

```bash
npm install
cp .env.example .env.local   # already copied for you
npm run dev                  # http://localhost:3000
```

Start the backend alongside it:

```bash
uvicorn index:app --reload --port 8000
```

## Environment

| Variable                 | Required | Default                 | Purpose                                     |
| ------------------------ | -------- | ----------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_API_URL`    | yes      | `http://localhost:8000` | Backend base URL. Calls go to `${NEXT_PUBLIC_API_URL}/api/chat`. |
| `NEXT_PUBLIC_MODEL_NAME` | no       | `gpt-5`                 | Label shown in the header and insights panel. |
| `NEXT_PUBLIC_APP_NAME`   | no       | `Meridian`              | Wordmark and page title.                    |

`NEXT_PUBLIC_*` values are inlined at build time — set them in Vercel before
deploying, and redeploy after changing them.

## Deploy to Vercel

Push the folder as-is and import it. No restructuring needed: the App Router
layout, `vercel.json`, and build scripts are already in place. Add
`NEXT_PUBLIC_API_URL` under **Settings → Environment Variables**, pointing at
your deployed FastAPI host over HTTPS (a browser on an HTTPS page will block
calls to an `http://` backend).

## Structure

```
app/
  layout.tsx          fonts, metadata, dark shell
  page.tsx            renders <AppShell />
  loading.tsx         skeleton for the first paint
  error.tsx           in-app recovery screen
  globals.css         tokens, glass surfaces, markdown styles
components/
  layout/app-shell    three-panel composition, drawers, shortcuts
  layout/sidebar      new chat, search, grouped history, profile
  layout/insights-panel  metrics, token estimates, model, session
  chat/chat-panel     header, message stream, jump-to-latest
  chat/composer       auto-growing input, send/stop
  chat/message-item   bubbles, actions, timestamps, error state
  chat/markdown       react-markdown + GFM
  chat/code-block     Prism highlighting with a themed palette
  chat/meridian-pulse the signature line
  chat/welcome        empty-state hero and starter prompts
  ui/                 shadcn/ui primitives
hooks/
  use-chat            conversations, send, regenerate, stop, metrics
  use-auto-scroll     stick-to-bottom that yields when you scroll up
  use-copy, use-media-query
lib/
  api.ts              transport: retries, timeouts, typed errors
  storage.ts          localStorage persistence
  types.ts, utils.ts
```

## How requests work

`lib/api.ts` is the only file that talks to the network.

- **Retries** — up to three attempts on network failures, timeouts, `429`, and
  `5xx`, with exponential backoff and jitter. `4xx` fails immediately.
- **Timeout** — 60s per attempt via `AbortController`.
- **Cancellation** — the stop button aborts in flight; partial text is kept.
- **Errors** — `describeError()` turns every failure into one plain sentence,
  including FastAPI's `{ "detail": ... }` payloads.

## Switching on real streaming

The UI already renders progressively. `sendChat` picks its path from the
response content type:

- `application/json` → parses `{ reply }`, then replays it through `onToken` at
  a readable pace.
- `text/event-stream`, `application/x-ndjson`, or `text/plain` → reads the body
  incrementally and emits chunks as they arrive.

So the front end needs **no changes** when the backend starts streaming. On the
Python side, return a `StreamingResponse` from the same route with
`stream=True` on the OpenAI call. The insights panel will flip its transport
row from `JSON` to `Streaming` on its own.

## Two notes on the backend

1. `def chat(...)` is synchronous, so each request occupies a worker thread for
   the whole model call. `async def` with `AsyncOpenAI` scales much better under
   concurrency.
2. `allow_origins=["*"]` is fine locally; narrow it to your deployed origin
   before going live.

## Keyboard

| Shortcut | Action |
| -------- | ------ |
| `Enter` / `Shift + Enter` | Send / new line |
| `⌘ B` | Conversations |
| `⌘ I` | Insights |
| `⌘ ⇧ O` | New chat |

## Design notes

- **Palette** — ink `#08090D`, iris `#7A7CFF` (primary), sand `#E8C39E`
  (accent, used only where warmth earns its place), mint for healthy signals.
- **Type** — Instrument Serif for display, Geist Sans for interface, Geist Mono
  for anything numeric. Metrics are always tabular.
- **Motion** — one orchestrated entrance, blur-in message arrivals, layout
  transitions on the panels. `prefers-reduced-motion` disables all of it.
- **Accessibility** — visible focus rings, labelled controls, live regions on
  the thinking state, and a full keyboard path through the app.

Conversations persist in `localStorage` (40 most recent). Nothing is sent
anywhere except your backend.
