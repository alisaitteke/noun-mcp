/**
 * Remove compiled server output so tsc cannot ship leftover modules.
 * Run: node scripts/clean-dist.mjs
 */
import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
rmSync(join(ROOT, 'dist'), { recursive: true, force: true });
