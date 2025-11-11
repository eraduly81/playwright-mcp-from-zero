import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

export default async function globalSetup() {
  const repoRoot = path.resolve(__dirname, '..');
  const envPath = path.join(repoRoot, '.env');
  const examplePath = path.join(repoRoot, '.env.example');

  // If .env doesn't exist, copy example if present
  if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log('Copied .env.example to .env');
  }

  // Load environment variables for tests
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.warn('No .env loaded (this is optional):', result.error.message);
  } else {
    console.log('Loaded .env variables');
  }
}
