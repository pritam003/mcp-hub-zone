import express from 'express';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import { AzureOpenAI } from 'openai';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 80;

// Azure OpenAI client (initialised lazily so missing env vars don't crash on startup)
function getClient() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_KEY;
  if (!endpoint || !apiKey) {
    throw new Error('AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY must be set');
  }
  return new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion: '2024-10-21',
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
  });
}

function buildSystemPrompt(serverName) {
  return (
    `You are a helpful AI assistant connected to the "${serverName}" MCP server. ` +
    `You have access to tools from this server — use them when the user's request requires it. ` +
    `Keep responses concise, well-formatted and actionable. ` +
    `When calling a tool, explain briefly what you're doing and why.`
  );
}

// ── POST /api/chat ────────────────────────────────────────────────────────────
// Single-turn: takes messages + MCP tools, returns either a tool_call or final text.
// The frontend is responsible for the agentic loop.
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, tools, serverName } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    const client = getClient();
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';

    // Convert MCP tool schemas to OpenAI function format
    const openaiTools = tools?.length
      ? tools.map((t) => ({
          type: 'function',
          function: {
            name: t.name,
            description: t.description || `Tool: ${t.name}`,
            parameters:
              t.inputSchema &&
              typeof t.inputSchema === 'object' &&
              'properties' in t.inputSchema
                ? t.inputSchema
                : { type: 'object', properties: {}, required: [] },
          },
        }))
      : undefined;

    const response = await client.chat.completions.create({
      model: deployment,
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(serverName || 'MCP'),
        },
        ...messages,
      ],
      tools: openaiTools,
      tool_choice: openaiTools?.length ? 'auto' : undefined,
      temperature: 0.3,
      max_tokens: 2048,
    });

    const choice = response.choices[0];
    const msg = choice.message;

    if (msg.tool_calls?.length) {
      const tc = msg.tool_calls[0];
      let toolArgs = {};
      try {
        toolArgs = JSON.parse(tc.function.arguments || '{}');
      } catch {
        toolArgs = {};
      }
      return res.json({
        type: 'tool_call',
        toolCall: {
          name: tc.function.name,
          arguments: toolArgs,
          callId: tc.id,
        },
        assistantMessage: msg,
      });
    }

    return res.json({
      type: 'message',
      content: msg.content || '',
      model: deployment,
    });
  } catch (err) {
    console.error('/api/chat error:', err);
    const message = err instanceof Error ? err.message : 'AI service error';
    return res.status(500).json({ error: message });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    model: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
    endpoint: process.env.AZURE_OPENAI_ENDPOINT ? 'configured' : 'missing',
  });
});

// ── Serve React SPA for everything else ──────────────────────────────────────
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MCP Hub Zone server running on port ${PORT}`);
  console.log(`Model: ${process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o'}`);
});
