Local MCP Agent (OpenAI-compatible proxy)

What this is
- Small Node.js proxy that exposes OpenAI-style endpoints (`/v1/chat/completions`, `/v1/completions`) and forwards requests to your local MCP server.

Quick start

1. Copy `.env.example` to `.env` and set `MCP_URL` and `MCP_API_KEY` if needed.

2. Install dependencies and start:

```bash
cd mcp-agent
npm install
npm start
```

3. Test with curl (chat-style):

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"my-model","messages":[{"role":"user","content":"Hello MCP"}]}'
```

Notes and mapping
- The proxy flattens `messages` into a simple `input` string sent to MCP. Adjust `mcpClient.generate` or `index.js` if your MCP expects a different request shape or streaming.
- By default the proxy posts to `${MCP_URL}/generate`. Change `mcpClient.js` if your MCP exposes a different path (e.g., `/v1/generate`).
- Response mapping is minimal: the proxy tries common fields (`output`, `text`, `choices[0].text`) and returns an OpenAI-like `choices` array. Customize as needed.

Next steps I can do for you
- Adapt this proxy to the exact MCP request/response schema you run locally.
- Add streaming proxy support (SSE / websockets) if your MCP streams tokens.
- Add authentication and rate-limiting.

Tell me which MCP server/version you run and I will adapt the mapping and add tests.
