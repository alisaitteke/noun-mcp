/**
 * Sync server.json with package.json before npm publish.
 * Copies version + description so the MCP registry listing never goes stale.
 * Run: npx tsx scripts/sync-server-version.ts   (wired into prepublishOnly)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const serverPath = join(ROOT, 'server.json');
const server = JSON.parse(readFileSync(serverPath, 'utf8'));

const REGISTRY_DESCRIPTION_MAX = 100;

function truncateDescription(text, max) {
  if (text.length <= max) {
    return text;
  }
  const slice = text.slice(0, max - 1).trimEnd();
  const atWord = slice.replace(/\s+\S*$/, '');
  const base = atWord.length >= Math.floor(max * 0.6) ? atWord : slice;
  return `${base.trimEnd()}…`;
}

server.version = pkg.version;
server.description = truncateDescription(pkg.description, REGISTRY_DESCRIPTION_MAX);
if (Array.isArray(server.packages)) {
  for (const p of server.packages) {
    if (p.registryType === 'npm') p.version = pkg.version;
  }
}

writeFileSync(serverPath, JSON.stringify(server, null, 2) + '\n');
console.log(`server.json synced to v${pkg.version}`);

const pluginPath = join(ROOT, '.cursor-plugin', 'plugin.json');
if (existsSync(pluginPath)) {
  const plugin = JSON.parse(readFileSync(pluginPath, 'utf8'));
  plugin.version = pkg.version;
  writeFileSync(pluginPath, JSON.stringify(plugin, null, 2) + '\n');
  console.log(`.cursor-plugin/plugin.json synced to v${pkg.version}`);
}
