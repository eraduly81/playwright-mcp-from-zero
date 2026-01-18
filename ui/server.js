import { createServer } from 'http';
import { readdir } from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const uiRoot = path.resolve(__dirname);
const testsDir = path.resolve(repoRoot, 'tests');
const port = process.env.UI_PORT ? Number(process.env.UI_PORT) : 5174;
const defaultMcpUrl = process.env.MCP_SERVER_URL || 'https://developers.openai.com/mcp';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

async function listTests() {
  const files = await readdir(testsDir);
  return files
    .filter(file => file.endsWith('.spec.ts'))
    .map(file => `tests/${file}`)
    .sort((a, b) => a.localeCompare(b));
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function callMcpServer({ serverUrl, method, params }) {
  const payload = {
    jsonrpc: '2.0',
    id: Math.random().toString(16).slice(2),
    method,
    params,
  };

  const response = await fetch(serverUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
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

async function handleApi(req, res) {
  if (req.method === 'GET' && req.url === '/api/tests') {
    try {
      const tests = await listTests();
      sendJson(res, 200, { tests });
    } catch (error) {
      sendJson(res, 500, { error: `Failed to list tests: ${error.message}` });
    }
    return true;
  }

  if (req.method === 'POST' && req.url === '/api/run') {
    try {
      const data = await readJsonBody(req);
      const tests = await listTests();
      if (!data.test || !tests.includes(data.test)) {
        sendJson(res, 400, { error: 'Invalid test selection.' });
        return;
      }

      const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
      const args = ['playwright', 'test', data.test];
      const command = `${npxCmd} ${args.join(' ')}`;

      const child = spawn(command, {
        cwd: repoRoot,
        shell: true,
      });
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', chunk => {
        stdout += chunk.toString();
      });
      child.stderr.on('data', chunk => {
        stderr += chunk.toString();
      });

      child.on('close', code => {
        sendJson(res, 200, {
          command,
          code,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        });
      });
    } catch (error) {
      sendJson(res, 500, { error: `Failed to run test: ${error.message}` });
    }
    return true;
  }

  if (req.method === 'POST' && req.url === '/api/realtime/session') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      sendJson(res, 400, { error: 'Missing OPENAI_API_KEY in env.' });
      return true;
    }

    try {
      const data = await readJsonBody(req);
      const payload = {
        model: data.model || 'gpt-realtime',
        modalities: data.modalities || ['audio', 'text'],
        instructions: data.instructions || 'You are a concise voice assistant.',
      };
      if (data.voice) {
        payload.voice = data.voice;
      }

      const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        sendJson(res, response.status, { error: text });
        return true;
      }

      const session = await response.json();
      sendJson(res, 200, session);
    } catch (error) {
      sendJson(res, 500, { error: `Failed to create session: ${error.message}` });
    }
    return true;
  }

  if (req.method === 'POST' && req.url === '/api/mcp/tools-list') {
    try {
      const data = await readJsonBody(req);
      const serverUrl = data.serverUrl || defaultMcpUrl;
      const result = await callMcpServer({
        serverUrl,
        method: 'tools/list',
        params: {},
      });
      sendJson(res, 200, { serverUrl, data: result });
    } catch (error) {
      sendJson(res, 500, { error: `Failed to list tools: ${error.message}` });
    }
    return true;
  }

  if (req.method === 'POST' && req.url === '/api/mcp/resources-list') {
    try {
      const data = await readJsonBody(req);
      const serverUrl = data.serverUrl || defaultMcpUrl;
      const result = await callMcpServer({
        serverUrl,
        method: 'resources/list',
        params: {},
      });
      sendJson(res, 200, { serverUrl, data: result });
    } catch (error) {
      sendJson(res, 500, { error: `Failed to list resources: ${error.message}` });
    }
    return true;
  }

  return false;
}

function safePath(urlPath) {
  const cleaned = urlPath.split('?')[0];
  if (cleaned === '/') return path.join(uiRoot, 'index.html');
  if (cleaned.startsWith('/node_modules/')) {
    return path.join(repoRoot, cleaned);
  }
  return path.join(uiRoot, cleaned);
}

const server = createServer(async (req, res) => {
  if (await handleApi(req, res)) return;

  const filePath = safePath(req.url || '/');
  if (!filePath.startsWith(uiRoot) && !filePath.startsWith(repoRoot)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
  createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`UI server running at http://localhost:${port}`);
});
