import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Wrench, Bot, User } from 'lucide-react';
import type { ChatMessage } from '@/types/mcp';

interface Props {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const isTool = message.role === 'tool' || message.toolCall;
  const isSystem = message.role === 'system';

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'justify-end' : ''} mb-4`}>
      {!isUser && (
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isTool
              ? 'bg-accent'
              : isSystem
              ? 'bg-secondary'
              : 'bg-primary/20'
          }`}
        >
          {isTool ? (
            <Wrench className="w-4 h-4 text-primary" />
          ) : (
            <Bot className="w-4 h-4 text-primary" />
          )}
        </div>
      )}

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : isTool
            ? 'bg-accent/30 border border-accent/50 rounded-bl-md'
            : 'bg-secondary text-secondary-foreground rounded-bl-md'
        }`}
      >
        {isTool && message.toolCall && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 pb-2 border-b border-border">
            <Wrench className="w-3 h-3" />
            <span className="font-mono">{message.toolCall.name}</span>
          </div>
        )}
        <div className="prose-chat">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}
