import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, symlink, link, readlink, stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./github-backup.mjs', import.meta.url));
function run(...args) {
  return spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', timeout: 60000 });
}
function successful(result) { assert.equal(result.status, 0, result.stderr + result.stdout); }

test('archive complète : PAX, liens, dossiers vides, secrets exclus et restauration sans écrasement', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mindstudio-backup-test-'));
  const source = path.join(root, 'source'), output = path.join(root, 'archive'), restored = path.join(root, 'restored');
  await mkdir(source); await mkdir(path.join(source, '.mindstudio')); await mkdir(path.join(source, 'empty'));
  await mkdir(path.join(source, '.git')); await mkdir(path.join(source, '.mindstudio', '.git'));
  await writeFile(path.join(source, '.git', 'config'), 'root ignored');
  await writeFile(path.join(source, '.mindstudio', '.git', 'config'), 'nested preserved');
  await writeFile(path.join(source, '.env.local'), 'PRIVATE_VALUE=test-placeholder');
  await writeFile(path.join(source, '.env.example'), 'PRIVATE_VALUE=');
  await writeFile(path.join(source, 'private.pem'), 'not uploaded');
  const name = 'é'.repeat(65) + ' long\nfilename.txt';
  const contents = Buffer.alloc(1024 * 1024 + 137, 73);
  await writeFile(path.join(source, name), contents, { mode: 0o640 });
  await writeFile(path.join(source, 'zero.txt'), '');
  await link(path.join(source, name), path.join(source, 'hardlink.txt'));
  await symlink(name, path.join(source, 'symlink'));
  successful(run('create', '--source', source, '--output', output));
  const manifest = JSON.parse(await readFile(path.join(output, 'manifest.json'), 'utf8'));
  assert.equal(manifest.summary.files, 5);
  assert.equal(manifest.summary.symlinks, 1);
  assert.equal(manifest.exclusions.length, 3);
  assert.ok(manifest.entries.some(x => x.path === '.mindstudio/.git/config'));
  successful(run('verify', '--parts', output));
  const report = JSON.parse(await readFile(path.join(output, 'verification.json'), 'utf8'));
  assert.equal(report.allContentsSha256Match, true);
  successful(run('restore', '--parts', output, '--destination', restored));
  assert.deepEqual(await readFile(path.join(restored, name)), contents);
  assert.equal((await readlink(path.join(restored, 'symlink'))).normalize('NFC'),
    (await readlink(path.join(source, 'symlink'))).normalize('NFC'));
  assert.deepEqual(await readFile(path.join(restored, 'symlink')), contents);
  assert.equal((await stat(path.join(restored, name))).mode & 0o777, 0o640);
  assert.deepEqual(await readdir(path.join(restored, 'empty')), []);
  assert.equal(await readFile(path.join(restored, '.mindstudio', '.git', 'config'), 'utf8'), 'nested preserved');
  assert.ok(!(await readdir(restored)).includes('.env.local'));
  const again = run('restore', '--parts', output, '--destination', restored);
  assert.notEqual(again.status, 0);
  assert.deepEqual(await readFile(path.join(restored, name)), contents);
  const inside = run('create', '--source', source, '--output', path.join(source, 'bad-output'));
  assert.notEqual(inside.status, 0);
  // Une pièce modifiée doit être refusée avant l'extraction.
  const partFile = path.join(output, manifest.parts[0].name);
  const part = await readFile(partFile); part[part.length - 1] ^= 1; await writeFile(partFile, part);
  const corrupted = run('verify', '--parts', output);
  assert.notEqual(corrupted.status, 0);
  assert.match(corrupted.stderr, /corrompue/);
  console.log(`Test de restauration conservé dans ${root}`);
});
