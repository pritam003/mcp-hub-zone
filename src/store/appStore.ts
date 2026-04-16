import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MCPServer, ChatMessage, Conversation } from '@/types/mcp';

interface AppState {
  // Servers
  servers: MCPServer[];
  activeServerId: string | null;
  addServer: (server: Omit<MCPServer, 'id' | 'status'>) => string;
  removeServer: (id: string) => void;
  updateServer: (id: string, updates: Partial<MCPServer>) => void;
  setActiveServer: (id: string | null) => void;

  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  createConversation: (serverId: string) => string;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => void;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  connectionPanelOpen: boolean;
  setConnectionPanelOpen: (open: boolean) => void;
}

let counter = 0;
const uid = () => `${Date.now()}-${++counter}`;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  servers: [],
  activeServerId: null,
  conversations: [],
  activeConversationId: null,
  sidebarOpen: true,
  connectionPanelOpen: false,

  addServer: (server) => {
    const id = uid();
    set((s) => ({
      servers: [...s.servers, { ...server, id, status: 'disconnected', tools: [] }],
    }));
    return id;
  },

  removeServer: (id) =>
    set((s) => ({
      servers: s.servers.filter((sv) => sv.id !== id),
      activeServerId: s.activeServerId === id ? null : s.activeServerId,
      conversations: s.conversations.filter((c) => c.serverId !== id),
    })),

  updateServer: (id, updates) =>
    set((s) => ({
      servers: s.servers.map((sv) => (sv.id === id ? { ...sv, ...updates } : sv)),
    })),

  setActiveServer: (id) => set({ activeServerId: id }),

  createConversation: (serverId) => {
    const id = uid();
    const server = get().servers.find((s) => s.id === serverId);
    const conv: Conversation = {
      id,
      title: `Chat with ${server?.name || 'Server'}`,
      serverId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((s) => ({
      conversations: [...s.conversations, conv],
      activeConversationId: id,
    }));
    return id;
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addMessage: (conversationId, message) => {
    const id = uid();
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...c.messages, { ...message, id, timestamp: new Date() }],
              updatedAt: new Date(),
            }
          : c
      ),
    }));
  },

  updateMessage: (conversationId, messageId, updates) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...updates } : m)),
            }
          : c
      ),
    })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setConnectionPanelOpen: (open) => set({ connectionPanelOpen: open }),
}),
    {
      name: 'mcp-hub-store',
      // Only persist servers and conversations; reset UI state
      partialize: (s) => ({
        servers: s.servers.map((sv) => ({ ...sv, status: 'disconnected' as const, tools: [] })),
        conversations: s.conversations,
        activeConversationId: s.activeConversationId,
      }),
    }
  )
);
