import { readFile, mkdir, cp, stat } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = resolve(project, '..');
const source = resolve(project, 'production');
const manifest = JSON.parse(await readFile(resolve(project, 'reports/production-manifest.json'), 'utf8'));
const files = Object.entries(manifest.files);
// Verify the complete release before touching any current site file.
for (const [name, expected] of files) {
  if (relative(source, resolve(source, name)) !== name || name.startsWith('.')) throw new Error(`Unexpected release path: ${name}`);
  const content = await readFile(resolve(source, name));
  if (createHash('sha256').update(content).digest('hex') !== expected) throw new Error(`Unreviewed release file: ${name}`);
}
if (!process.argv.includes('--apply')) {
  console.log(`Verified ${files.length} files. Use --apply to back up current files and install this release in ${repo}`);
} else {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backup = resolve(repo, '..', 'kotto-production-backups', stamp);
  // Backups live outside the repository and the published website.
  for (const [name] of files) {
    const path = resolve(repo, name);
    try {
      if (!(await stat(path)).isFile()) throw new Error(`Destination is not a file: ${name}`);
      await mkdir(dirname(resolve(backup, name)), { recursive: true });
      await cp(path, resolve(backup, name));
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  for (const [name] of files) {
    await mkdir(dirname(resolve(repo, name)), { recursive: true });
    await cp(resolve(source, name), resolve(repo, name));
  }
  console.log(`Installed ${files.length} files; previous files preserved in ${backup}`);
}
