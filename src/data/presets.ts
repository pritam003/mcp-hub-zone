export interface MCPPreset {
  id: string;
  name: string;
  description: string;
  url: string;
  transport: 'http' | 'websocket';
  tags: string[];
  /** If true, we can one-click connect without any extra config */
  hostedReady: boolean;
  /** Docs or homepage URL */
  docsUrl?: string;
  /** Accent color for the card badge */
  color: string;
  emoji: string;
}

export const MCP_PRESETS: MCPPreset[] = [
  {
    id: 'zerodha-kite',
    name: 'Zerodha Kite',
    description:
      'Official Zerodha Kite MCP server. Trade stocks, view portfolio, market data and orders via AI.',
    url: 'https://mcp.kite.trade/mcp',
    transport: 'http',
    tags: ['Trading', 'Portfolio', 'Market Data'],
    hostedReady: true,
    docsUrl: 'https://github.com/zerodha/kite-mcp-server',
    color: '#387ED1',
    emoji: '📈',
  },
  {
    id: 'mcp-fetch',
    name: 'MCP Fetch',
    description:
      'Fetch web pages and convert to Markdown. Connect a self-hosted instance for web browsing inside AI chat.',
    url: 'http://localhost:8080/mcp',
    transport: 'http',
    tags: ['Web', 'Scraping', 'Markdown'],
    hostedReady: false,
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch',
    color: '#6366f1',
    emoji: '🌐',
  },
  {
    id: 'mcp-filesystem',
    name: 'Filesystem',
    description:
      'Read, write and navigate files on a local or remote server. Run a self-hosted MCP filesystem instance.',
    url: 'http://localhost:8080/mcp',
    transport: 'http',
    tags: ['Files', 'Storage', 'Local'],
    hostedReady: false,
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    color: '#10b981',
    emoji: '📁',
  },
  {
    id: 'mcp-memory',
    name: 'MCP Memory',
    description:
      'Knowledge graph-based persistent memory system for AI assistants. Requires a self-hosted instance.',
    url: 'http://localhost:8080/mcp',
    transport: 'http',
    tags: ['Memory', 'Knowledge Graph'],
    hostedReady: false,
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory',
    color: '#f59e0b',
    emoji: '🧠',
  },
];
