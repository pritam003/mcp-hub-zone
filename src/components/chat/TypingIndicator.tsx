interface TypingIndicatorProps {
  status?: string;
}

export function TypingIndicator({ status }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 mb-4 animate-fade-in">
      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
        <div className="flex gap-1">
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
      </div>
      <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
        {status ? (
          <p className="text-xs text-muted-foreground italic">{status}</p>
        ) : (
          <div className="flex gap-1.5">
            <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground" />
            <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground" />
            <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
