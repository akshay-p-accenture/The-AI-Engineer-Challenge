export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </div>
  )
}
