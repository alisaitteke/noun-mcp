/**
 * Fail if the published file set would boot into MODULE_NOT_FOUND.
 *
 * Does not run `npm pack` — that always triggers `prepare` / a full build
 * and mixes script logs into `--json` output. Instead we apply package.json
 * `files` + .npmignore the same way a tarball would.
 *
 * Run: npm run verify:pack   (requires a current server build)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const REQUIRED_FILES = [
  'dist/index.js',
  'scripts/prepare.mjs',
];

const RELATIVE_SPECIFIER =
  /(?:import|export)\s+(?:type\s+)?(?:[^'"\n;]*?\sfrom\s+)?['"](\.\.?\/[^'"]+)['"]|import\s*\(\s*['"](\.\.?\/[^'"]+)['"]\s*\)/g;

function toPosix(file) {
  return file.split(sep).join('/');
}

function listFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      listFiles(full, acc);
    } else {
      acc.push(full);
    }
  }
  return acc;
}

function exists(rel) {
  try {
    statSync(join(ROOT, rel));
    return true;
  } catch {
    return false;
  }
}

function npmIgnored(rel) {
  if (rel === '.taskmaster' || rel.startsWith('.taskmaster/')) return true;
  if (rel.endsWith('.log')) return true;
  if (rel === '.env' || rel.startsWith('.env.')) return true;
  return false;
}

function collectPublishedFiles() {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const allow = pkg.files ?? [];
  const published = new Set();

  for (const entry of allow) {
    const abs = join(ROOT, entry);
    try {
      const st = statSync(abs);
      if (st.isDirectory()) {
        for (const file of listFiles(abs)) {
          const rel = toPosix(relative(ROOT, file));
          if (!npmIgnored(rel)) published.add(rel);
        }
      } else if (!npmIgnored(toPosix(entry))) {
        published.add(toPosix(entry));
      }
    } catch {
      // Missing allowlist path is fine (e.g. dist before a build).
    }
  }

  return published;
}

function collectSpecifiers(source) {
  const specs = [];
  for (const match of source.matchAll(RELATIVE_SPECIFIER)) {
    const spec = match[1] ?? match[2];
    if (spec) specs.push(spec);
  }
  return specs;
}

async function main() {
  const problems = [];
  const published = collectPublishedFiles();

  for (const file of REQUIRED_FILES) {
    if (!exists(file)) {
      problems.push(`${file} is missing on disk. Run npm run build first.`);
    } else if (!published.has(file)) {
      problems.push(`${file} exists but is not in the published file set`);
    }
  }

  const jsFiles = [...published].filter((file) => file.startsWith('dist/') && file.endsWith('.js'));
  for (const file of jsFiles) {
    const source = readFileSync(join(ROOT, file), 'utf8');
    for (const spec of collectSpecifiers(source)) {
      if (!spec.endsWith('.js') && !spec.endsWith('.json')) continue;
      const resolved = toPosix(relative(ROOT, resolve(ROOT, dirname(file), spec)));
      if (!published.has(resolved)) {
        problems.push(`${file} imports ${spec} → missing ${resolved}`);
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(`Pack integrity failed:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  }

  // Import a leaf module, not dist/index.js — that starts the stdio server.
  await import(pathToFileURL(join(ROOT, 'dist/api/errors.js')).href);

  console.log(
    `verify:pack ok — ${jsFiles.length} packed dist JS files, imports resolve.`
  );
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
