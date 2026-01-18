import { createServer } from 'http';
import { readFile, readdir } from 'fs/promises';
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
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
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
    });
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
