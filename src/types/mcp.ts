export interface MCPServer {
  id: string;
  name: string;
  url: string;
  transport: 'http' | 'websocket';
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  tools?: MCPTool[];
  error?: string;
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  serverId?: string;
  toolCall?: {
    name: string;
    arguments?: Record<string, unknown>;
    result?: string;
  };
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  serverId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
