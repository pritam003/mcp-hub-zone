import { useState } from 'react';
import { Plus, MessageSquare, Trash2, ChevronLeft, Plug, Settings, LogOut } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useMsal } from '@azure/msal-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  const { instance, accounts } = useMsal();
  const account = accounts[0];
  const userInitials = account?.name
    ? account.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const handleSignOut = () => {
    instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin });
  };

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
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center hover:opacity-80 transition-opacity">
                    {userInitials}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{account?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{account?.username}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive gap-2">
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Server selector */}
          <div className="px-3 py-3 border-b border-sidebar-border space-y-1.5">
            {/* Per-server rows */}
            {servers.map((sv) => (
              <div key={sv.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground text-sm">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  sv.status === 'connected' ? 'bg-green-400' :
                  sv.status === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                  sv.status === 'error' ? 'bg-red-400' : 'bg-muted-foreground'
                }`} />
                <span className="flex-1 truncate">{sv.name}</span>
                <button
                  onClick={() => createConversation(sv.id)}
                  className="shrink-0 p-1 rounded hover:bg-sidebar-border transition-colors"
                  title="New chat"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {/* Add server button */}
            <button
              onClick={() => setConnectionPanelOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-sidebar-border text-sidebar-foreground/60 text-sm hover:bg-sidebar-accent transition-colors"
            >
              <Plug className="w-4 h-4" />
              <span className="flex-1 text-left">Add server</span>
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* New chat — shown when at least one server exists */}
          {servers.length > 0 && (
            <div className="px-3 py-2">
              <button
                onClick={() => {
                  const sid = activeServerId || connectedServers[0]?.id || servers[0]?.id;
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
