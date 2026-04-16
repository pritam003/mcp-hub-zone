import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { invokeTool } from '@/services/mcpClient';
import { ChatMessageBubble } from './ChatMessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { EmptyState } from './EmptyState';

export function ChatArea() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const conversations = useAppStore((s) => s.conversations);
  const servers = useAppStore((s) => s.servers);
  const addMessage = useAppStore((s) => s.addMessage);

  const conversation = conversations.find((c) => c.id === activeConversationId);
  const server = servers.find((s) => s.id === conversation?.serverId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversation || !server || isProcessing) return;

    const text = input.trim();
    setInput('');
    addMessage(conversation.id, { role: 'user', content: text });

    setIsProcessing(true);
    try {
      // Check if the message references a tool
      const tools = server.tools || [];
      const mentionedTool = tools.find(
        (t) => text.toLowerCase().includes(t.name.toLowerCase())
      );

      if (mentionedTool) {
        addMessage(conversation.id, {
          role: 'system',
          content: `Invoking tool: **${mentionedTool.name}**`,
          toolCall: { name: mentionedTool.name, arguments: {} },
        });

        const result = await invokeTool(server, mentionedTool.name, {});
        addMessage(conversation.id, {
          role: 'tool',
          content: result,
          toolCall: { name: mentionedTool.name, result },
        });
      } else {
        // Echo response for demo; in production this would go through an LLM
        addMessage(conversation.id, {
          role: 'assistant',
          content: `Connected to **${server.name}**. ${
            tools.length > 0
              ? `Available tools: ${tools.map((t) => `\`${t.name}\``).join(', ')}. Mention a tool name to invoke it.`
              : 'No tools discovered on this server.'
          }\n\nYour message: "${text}"`,
        });
      }
    } catch (err) {
      addMessage(conversation.id, {
        role: 'system',
        content: `⚠️ Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!conversation) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            server?.status === 'connected'
              ? 'bg-success'
              : server?.status === 'connecting'
              ? 'bg-warning animate-pulse'
              : 'bg-muted-foreground'
          }`}
        />
        <div>
          <h2 className="text-sm font-semibold">{server?.name || 'Unknown Server'}</h2>
          <p className="text-xs text-muted-foreground">
            {server?.tools?.length || 0} tools available
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4 space-y-1">
        {conversation.messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}
        {isProcessing && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border">
        <div className="flex items-end gap-3 bg-secondary rounded-xl px-4 py-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Message ${server?.name || 'server'}...`}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
