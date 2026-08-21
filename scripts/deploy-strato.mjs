import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { readdir, stat, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Client from 'ssh2-sftp-client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const HTACCESS = path.join(ROOT, '.htaccess');
const DEPLOY_ENV = path.join(ROOT, 'deploy.env');

const BUILD = !process.argv.includes('--no-build');
const CLEAN = !process.argv.includes('--no-clean');

function loadEnv(file) {
  const env = {};
  if (existsSync(file)) {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
  return env;
}

function log(msg) { console.log(`[deploy] ${msg}`); }
function fail(msg) { console.error(`[deploy] ERROR: ${msg}`); process.exit(1); }

async function run(cmd, args) {
  await new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: true });
    p.on('close', code => code === 0 ? resolve() : reject(new Error(`${cmd} exited with ${code}`)));
    p.on('error', reject);
  });
}

async function walk(dir, base = '') {
  const entries = [];
  for (const name of await readdir(dir)) {
    const full = path.join(dir, name);
    const rel = path.posix.join(base, name);
    const info = await stat(full);
    if (info.isDirectory()) entries.push(...await walk(full, rel));
    else entries.push({ rel, full });
  }
  return entries;
}

async function removeRemote(sftp, remotePath) {
  const items = await sftp.list(remotePath);
  for (const item of items) {
    const child = path.posix.join(remotePath, item.name);
    if (item.type === 'd') await removeRemote(sftp, child);
    else await sftp.delete(child, true);
  }
  await sftp.rmdir(remotePath, true);
}

const env = loadEnv(DEPLOY_ENV);
const HOST = env.STRATO_HOST;
const PORT = Number(env.STRATO_PORT || 22);
const USER = env.STRATO_USER;
const PASS = env.STRATO_PASS;
const KEY = env.STRATO_KEY_PATH;
const REMOTE_DIR = env.STRATO_REMOTE_DIR || 'html';
if (!HOST || !USER || (!PASS && !KEY)) {
  fail('deploy.env missing STRATO_HOST/STRATO_USER/STRATO_PASS (or STRATO_KEY_PATH). See deploy.env.example.');
}

if (BUILD) {
  log('building (npm run build:seo)...');
  await run('npm', ['run', 'build:seo']);
}
if (!existsSync(DIST)) fail('dist/ not found (run with build or --no-build after a build)');

const files = await walk(DIST);
log(`uploading ${files.length} files from dist/ to ${USER}@${HOST}:${PORT}${REMOTE_DIR}/`);

const sftp = new Client();
try {
  const conn = PASS ? { host: HOST, port: PORT, username: USER, password: PASS } : { host: HOST, port: PORT, username: USER, privateKey: readFileSync(KEY, 'utf8') };
  await sftp.connect(conn);
  await sftp.mkdir(REMOTE_DIR, true);

  if (CLEAN) {
    const remote = await sftp.list(REMOTE_DIR);
    const localSet = new Set([...files.map(f => f.rel), '.htaccess']);
    for (const item of remote) {
      const key = item.name;
      if (!localSet.has(key) && !['.', '..'].includes(key)) {
        log(`removing stale ${REMOTE_DIR}/${key}`);
        await removeRemote(sftp, path.posix.join(REMOTE_DIR, key));
      }
    }
  }

  for (const f of files) {
    const remotePath = path.posix.join(REMOTE_DIR, f.rel);
    await sftp.mkdir(path.posix.dirname(remotePath), true);
    await sftp.put(f.full, remotePath);
  }
  if (existsSync(HTACCESS)) {
    await sftp.put(HTACCESS, path.posix.join(REMOTE_DIR, '.htaccess'));
    log('uploaded .htaccess');
  }
  log(`done: ${files.length} files + .htaccess -> ${REMOTE_DIR}/`);
} finally {
  await sftp.end();
}