/**
 * Build from a source checkout only.
 *
 * Published tarballs omit src/. If a consumer npm/npx still runs `prepare`,
 * rebuilding would wipe or miss compiled files.
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

if (!existsSync(join(ROOT, 'src', 'index.ts'))) {
  process.exit(0);
}

const result = spawnSync('npm', ['run', 'build'], {
  cwd: ROOT,
  stdio: 'inherit',
  shell: true,
});
process.exit(result.status ?? 1);
