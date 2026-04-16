import { useState } from 'react';
import { Plus, MessageSquare, Trash2, ChevronLeft, Plug, Settings } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { motion, AnimatePresence } from 'framer-motion';

export function Sidebar() {
  const {
    servers,
    conversations,
    activeConversationId,
    sidebarOpen,
    setSidebarOpen,
    setActiveConversation,
    createConversation,
    activeServerId,
    setActiveServer,
    setConnectionPanelOpen,
  } = useAppStore();

  const connectedServers = servers.filter((s) => s.status === 'connected');

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
            <h1 className="text-sm font-semibold text-sidebar-foreground">MCP Chat</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Server selector */}
          <div className="px-3 py-3 border-b border-sidebar-border">
            <button
              onClick={() => setConnectionPanelOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground text-sm hover:opacity-80 transition-opacity"
            >
              <Plug className="w-4 h-4" />
              <span className="flex-1 text-left truncate">
                {connectedServers.length > 0
                  ? `${connectedServers.length} server${connectedServers.length > 1 ? 's' : ''}`
                  : 'Connect server'}
              </span>
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* New chat */}
          {connectedServers.length > 0 && (
            <div className="px-3 py-2">
              <button
                onClick={() => {
                  const sid = activeServerId || connectedServers[0]?.id;
                  if (sid) createConversation(sid);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-sidebar-border text-sidebar-foreground text-sm hover:bg-sidebar-accent transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>
          )}

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 space-y-1">
            {conversations.map((conv) => {
              const server = servers.find((s) => s.id === conv.serverId);
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                    activeConversationId === conv.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{conv.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {server?.name || 'Unknown'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
