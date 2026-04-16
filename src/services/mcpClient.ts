import type { MCPServer, MCPTool } from '@/types/mcp';

const CONNECT_TIMEOUT = 10000;

/** Validate URL before connecting - basic SSRF prevention */
function validateMCPUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:', 'ws:', 'wss:'].includes(parsed.protocol)) {
      throw new Error('Only HTTP(S) and WS(S) protocols are allowed');
    }
    // Block private IPs (basic check)
    const hostname = parsed.hostname.toLowerCase();
    const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]'];
    if (blocked.includes(hostname) && import.meta.env.PROD) {
      throw new Error('Connection to localhost is not allowed in production');
    }
    return parsed.toString();
  } catch (e) {
    if (e instanceof Error && e.message.includes('allowed')) throw e;
    throw new Error('Invalid URL');
  }
}

/** Discover tools from an MCP server via HTTP */
async function discoverToolsHTTP(url: string): Promise<MCPTool[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONNECT_TIMEOUT);

  try {
    // MCP Streamable HTTP - send initialize then tools/list
    const initResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'MCP Universal Chat', version: '1.0.0' },
        },
      }),
      signal: controller.signal,
    });

    if (!initResponse.ok) {
      throw new Error(`Server returned ${initResponse.status}`);
    }

    // Now list tools
    const toolsResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      }),
      signal: controller.signal,
    });

    if (!toolsResponse.ok) {
      return [];
    }

    const data = await toolsResponse.json();
    return (data.result?.tools || []).map((t: any) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }));
  } finally {
    clearTimeout(timeout);
  }
}

/** Invoke a tool on an MCP server */
export async function invokeTool(
  server: MCPServer,
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<string> {
  const url = validateMCPUrl(server.url);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: { name: toolName, arguments: args },
    }),
  });

  if (!response.ok) {
    throw new Error(`Tool invocation failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || 'Tool invocation error');
  }

  const content = data.result?.content;
  if (Array.isArray(content)) {
    return content.map((c: any) => c.text || JSON.stringify(c)).join('\n');
  }
  return JSON.stringify(data.result);
}

/** Connect to an MCP server and discover its tools */
export async function connectToServer(
  server: Pick<MCPServer, 'url' | 'transport'>
): Promise<MCPTool[]> {
  const url = validateMCPUrl(server.url);

  if (server.transport === 'http') {
    return discoverToolsHTTP(url);
  }

  // WebSocket transport - basic implementation
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Connection timeout'));
    }, CONNECT_TIMEOUT);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'MCP Universal Chat', version: '1.0.0' },
          },
        })
      );
    };

    let initialized = false;
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!initialized) {
        initialized = true;
        ws.send(
          JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
        );
      } else {
        clearTimeout(timeout);
        const tools = (data.result?.tools || []).map((t: any) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        }));
        ws.close();
        resolve(tools);
      }
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('WebSocket connection failed'));
    };
  });
}
