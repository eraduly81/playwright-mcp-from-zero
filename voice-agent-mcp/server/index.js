import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5174);

app.use(express.json({ limit: "2mb" }));
app.use(express.static(new URL("../web", import.meta.url).pathname));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_MCP_SERVER_URL =
  process.env.MCP_SERVER_URL || "https://developers.openai.com/mcp";

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/realtime/session", async (req, res) => {
  if (!OPENAI_API_KEY) {
    res.status(400).json({ error: "Missing OPENAI_API_KEY in env." });
    return;
  }

  const {
    model = "gpt-realtime",
    modalities = ["audio", "text"],
    instructions = "You are a concise voice assistant.",
    voice,
  } = req.body ?? {};

  const payload = {
    model,
    modalities,
    instructions,
    ...(voice ? { voice } : {}),
  };

  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).json({ error: text });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

async function callMcpServer({ serverUrl, method, params }) {
  const payload = {
    jsonrpc: "2.0",
    id: Math.random().toString(16).slice(2),
    method,
    params,
  };

  const response = await fetch(serverUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

app.post("/api/mcp/tools-list", async (req, res) => {
  const serverUrl = req.body?.serverUrl || DEFAULT_MCP_SERVER_URL;
  try {
    const data = await callMcpServer({
      serverUrl,
      method: "tools/list",
      params: {},
    });
    res.json({ serverUrl, data });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post("/api/mcp/resources-list", async (req, res) => {
  const serverUrl = req.body?.serverUrl || DEFAULT_MCP_SERVER_URL;
  try {
    const data = await callMcpServer({
      serverUrl,
      method: "resources/list",
      params: {},
    });
    res.json({ serverUrl, data });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post("/api/mcp/tools-call", async (req, res) => {
  const serverUrl = req.body?.serverUrl || DEFAULT_MCP_SERVER_URL;
  const { name, arguments: args } = req.body ?? {};

  if (!name) {
    res.status(400).json({ error: "Missing tool name." });
    return;
  }

  try {
    const data = await callMcpServer({
      serverUrl,
      method: "tools/call",
      params: {
        name,
        arguments: args ?? {},
      },
    });
    res.json({ serverUrl, data });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Voice MCP server listening on http://localhost:${port}`);
});
