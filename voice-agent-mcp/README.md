# Realtime Voice + MCP (Standalone)

This is a small, standalone Node app that lives alongside the Playwright suite.
It creates Realtime sessions and proxies basic MCP discovery calls so you can
plug those results into a voice agent.

## What this provides

- `/api/realtime/session` creates a Realtime session via `POST /v1/realtime/sessions`
  (returns a `client_secret` for browser use).
- `/api/mcp/tools-list` and `/api/mcp/resources-list` proxy MCP `tools/list` and
  `resources/list` calls.

## Setup

```bash
cd voice-agent-mcp
npm install
```

Set environment variables (PowerShell example):

```powershell
$env:OPENAI_API_KEY="YOUR_KEY"
$env:MCP_SERVER_URL="https://developers.openai.com/mcp"
```

Run the server:

```bash
npm run dev
```

Open `http://localhost:5174` in your browser.

## Wiring up the voice agent

The UI currently creates a Realtime session and shows the response. To actually
stream audio, connect the session `client_secret` to a Realtime client in the
browser (WebRTC). OpenAI recommends the TypeScript Agents SDK for voice agents,
which uses WebRTC in the browser and WebSockets on the server.

The Realtime session creation endpoint and payload are documented here:
`https://platform.openai.com/docs/api-reference/realtime/create-session`.

## MCP notes

This server uses a JSON-RPC style POST for MCP calls (`tools/list`, `resources/list`,
`tools/call`). If your MCP server uses SSE or another transport, you may need to
swap the transport in `server/index.js`.
