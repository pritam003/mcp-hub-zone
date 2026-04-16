import { useState } from 'react';
import { X, Plus, Trash2, Wifi, WifiOff, Loader2, Globe, Radio, Zap, ChevronDown, ExternalLink } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { connectToServer } from '@/services/mcpClient';
import { motion, AnimatePresence } from 'framer-motion';
import { MCP_PRESETS, type MCPPreset } from '@/data/presets';

export function ConnectionPanel() {
  const { servers, connectionPanelOpen, setConnectionPanelOpen, addServer, removeServer, updateServer } =
    useAppStore();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [transport, setTransport] = useState<'http' | 'websocket'>('http');
  const [presetsOpen, setPresetsOpen] = useState(true);
  const [connectingPreset, setConnectingPreset] = useState<string | null>(null);

  const doConnect = async (serverName: string, serverUrl: string, serverTransport: 'http' | 'websocket') => {
    const id = addServer({ name: serverName, url: serverUrl, transport: serverTransport });
    updateServer(id, { status: 'connecting' });
    try {
      const tools = await connectToServer({ url: serverUrl, transport: serverTransport });
      updateServer(id, { status: 'connected', tools });
    } catch (err) {
      updateServer(id, {
        status: 'error',
        error: err instanceof Error ? err.message : 'Connection failed',
      });
    }
    return id;
  };

  const handleConnect = async () => {
    if (!url.trim() || !name.trim()) return;
    await doConnect(name.trim(), url.trim(), transport);
    setUrl('');
    setName('');
  };

  const handlePresetConnect = async (preset: MCPPreset) => {
    setConnectingPreset(preset.id);
    try {
      await doConnect(preset.name, preset.url, preset.transport);
    } finally {
      setConnectingPreset(null);
    }
  };

  const handlePresetFill = (preset: MCPPreset) => {
    setName(preset.name);
    setUrl(preset.url);
    setTransport(preset.transport);
    setPresetsOpen(false);
  };

  const handleReconnect = async (id: string) => {
    const server = servers.find((s) => s.id === id);
    if (!server) return;
    updateServer(id, { status: 'connecting', error: undefined });
    try {
      const tools = await connectToServer({ url: server.url, transport: server.transport });
      updateServer(id, { status: 'connected', tools });
    } catch (err) {
      updateServer(id, {
        status: 'error',
        error: err instanceof Error ? err.message : 'Connection failed',
      });
    }
  };

  return (
    <AnimatePresence>
      {connectionPanelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            onClick={() => setConnectionPanelOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold">MCP Servers</h2>
              <button
                onClick={() => setConnectionPanelOpen(false)}
                className="p-1.5 rounded-md hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Popular servers presets */}
            <div className="border-b border-border">
              <button
                onClick={() => setPresetsOpen((o) => !o)}
                className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Popular Servers
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${presetsOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {presetsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {MCP_PRESETS.map((preset) => {
                        const alreadyAdded = servers.some((s) => s.url === preset.url);
                        const isConnecting = connectingPreset === preset.id;
                        return (
                          <div
                            key={preset.id}
                            className="rounded-xl border border-border bg-secondary/40 p-3 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-xl leading-none">{preset.emoji}</span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-semibold truncate">{preset.name}</span>
                                    {preset.hostedReady && (
                                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 shrink-0">
                                        Hosted
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    {preset.tags.map((tag) => (
                                      <span key={tag} className="text-[10px] text-muted-foreground">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              {preset.docsUrl && (
                                <a
                                  href={preset.docsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{preset.description}</p>
                            <p className="text-[10px] font-mono text-muted-foreground truncate">{preset.url}</p>
                            <div className="flex gap-2 pt-0.5">
                              {preset.hostedReady ? (
                                <button
                                  onClick={() => handlePresetConnect(preset)}
                                  disabled={alreadyAdded || isConnecting}
                                  className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                                >
                                  {isConnecting ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Zap className="w-3 h-3" />
                                  )}
                                  {alreadyAdded ? 'Added' : isConnecting ? 'Connecting…' : 'Quick Connect'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePresetFill(preset)}
                                  className="flex items-center gap-1.5 text-xs bg-secondary text-foreground border border-border px-3 py-1.5 rounded-lg font-medium hover:bg-accent transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                  Use as template
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Add server form */}
            <div className="px-6 py-4 border-b border-border space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Server name"
                className="w-full bg-secondary rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/50 text-foreground placeholder:text-muted-foreground"
              />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-mcp-server.com/mcp"
                className="w-full bg-secondary rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/50 font-mono text-foreground placeholder:text-muted-foreground"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTransport('http')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    transport === 'http'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  HTTP
                </button>
                <button
                  onClick={() => setTransport('websocket')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    transport === 'websocket'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Radio className="w-3 h-3" />
                  WebSocket
                </button>
                <div className="flex-1" />
                <button
                  onClick={handleConnect}
                  disabled={!url.trim() || !name.trim()}
                  className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  <Plus className="w-3 h-3" />
                  Connect
                </button>
              </div>
            </div>

            {/* Server list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4 space-y-3">
              {servers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No servers connected yet
                </p>
              )}
              {servers.map((server) => (
                <div
                  key={server.id}
                  className="bg-secondary rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {server.status === 'connected' ? (
                          <Wifi className="w-4 h-4 text-success" />
                        ) : server.status === 'connecting' ? (
                          <Loader2 className="w-4 h-4 text-warning animate-spin" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-destructive" />
                        )}
                        <span className="font-medium text-sm">{server.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-1 truncate max-w-[280px]">
                        {server.url}
                      </p>
                    </div>
                    <button
                      onClick={() => removeServer(server.id)}
                      className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {server.error && (
                    <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
                      {server.error}
                    </p>
                  )}

                  {server.status === 'connected' && server.tools && server.tools.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">
                        {server.tools.length} tools:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {server.tools.map((tool) => (
                          <span
                            key={tool.name}
                            className="text-xs bg-accent/40 text-accent-foreground px-2 py-1 rounded-md font-mono"
                          >
                            {tool.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(server.status === 'error' || server.status === 'disconnected') && (
                    <button
                      onClick={() => handleReconnect(server.id)}
                      className="text-xs text-primary hover:underline"
                    >
                      Retry connection
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
