import { Plug, Zap } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

export function EmptyState() {
  const setConnectionPanelOpen = useAppStore((s) => s.setConnectionPanelOpen);
  const servers = useAppStore((s) => s.servers);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Zap className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold mb-3">MCP Universal Chat</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Connect to any Model Context Protocol server and interact with its tools through a clean chat interface.
        </p>
        <button
          onClick={() => setConnectionPanelOpen(true)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <Plug className="w-4 h-4" />
          {servers.length > 0 ? 'Manage Servers' : 'Connect a Server'}
        </button>
      </div>
    </div>
  );
}
