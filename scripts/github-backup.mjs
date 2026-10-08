#!/usr/bin/env node
// Sauvegarde locale complète : tar/zstd en flux, sans dépendance npm ni Git LFS.
import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { lstat, readdir, readFile, writeFile, mkdir, readlink, stat } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const argv = process.argv.slice(2);
const command = argv.shift();
function option(name, fallback) {
  const index = argv.indexOf(`--${name}`);
  return index === -1 ? fallback : argv[index + 1];
}
const PART_BYTES = 1536 * 1024 * 1024;
const privateNames = /^(?:id_rsa|id_ed25519|credentials(?:\.json)?|service-account.*\.json)$|\.(?:pem|key|p12|pfx)$/i;
const publicCertificates = new Set([
  '.mindstudio/chatterbox-venv/lib/python3.11/site-packages/certifi/cacert.pem',
  '.mindstudio/chatterbox-venv/lib/python3.11/site-packages/pip/_vendor/certifi/cacert.pem',
]);
function excluded(relative) {
  const name = path.basename(relative);
  if (relative === '.git') return 'Git racine : sauvegardé séparément dans le dépôt';
  if (name.startsWith('.env') && name !== '.env.example') return 'Configuration privée';
  if (privateNames.test(name) && !publicCertificates.has(relative)) return 'Identifiants ou clés privées potentiels';
  return null;
}
function safeName(name) {
  const clean = name.replace(/^\.\//, '').replace(/\/$/, '');
  if (!clean || name.startsWith('/') || clean.split('/').includes('..') || name.includes('\0')) {
    throw new Error(`Chemin d'archive interdit : ${JSON.stringify(name)}`);
  }
  return clean;
}
async function sha256(filename) {
  const hash = createHash('sha256');
  for await (const block of createReadStream(filename)) hash.update(block);
  return hash.digest('hex');
}
function processResult(child, label) {
  let errorText = '';
  child.stderr.on('data', block => { errorText += block.toString(); });
  return new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve(errorText) : reject(new Error(`${label} (${code}) : ${errorText}`)));
  });
}
class PartWriter extends Writable {
  constructor(output) {
    super(); this.output = output; this.parts = []; this.current = null; this.bytes = 0;
  }
  async openPart() {
    const name = `mindstudio.tar.zst.part${String(this.parts.length + 1).padStart(3, '0')}`;
    this.current = createWriteStream(path.join(this.output, name), { flags: 'wx', mode: 0o600 });
    this.current.on('error', error => this.destroy(error));
    this.hash = createHash('sha256'); this.bytes = 0; this.name = name;
  }
  async closePart() {
    if (!this.current) return;
    await new Promise((resolve, reject) => {
      this.current.on('error', reject); this.current.end(resolve);
    });
    this.parts.push({ name: this.name, bytes: this.bytes, sha256: this.hash.digest('hex') });
    console.log(`Pièce créée : ${this.name} (${(this.bytes / 1024 ** 3).toFixed(2)} GiB)`);
    this.current = null;
  }
  _write(block, _encoding, callback) {
    (async () => {
      let cursor = 0;
      while (cursor < block.length) {
        if (!this.current) await this.openPart();
        const length = Math.min(block.length - cursor, PART_BYTES - this.bytes);
        const piece = block.subarray(cursor, cursor + length);
        this.hash.update(piece);
        await new Promise((resolve, reject) => this.current.write(piece, error => error ? reject(error) : resolve()));
        this.bytes += length; cursor += length;
        if (this.bytes === PART_BYTES) await this.closePart();
      }
    })().then(() => callback(), callback);
  }
  _final(callback) { this.closePart().then(() => callback(), callback); }
}
async function create() {
  const source = path.resolve(option('source', '.'));
  const output = path.resolve(option('output', ''));
  if (!option('output')) throw new Error('--output est obligatoire (hors du dossier source)');
  if (output === source || output.startsWith(source + path.sep)) throw new Error('Sortie obligatoirement hors de la source');
  await mkdir(output, { recursive: true, mode: 0o700 });
  if ((await readdir(output)).length) throw new Error('Le dossier de sortie doit être vide');
  const manifest = { format: 1, createdAt: new Date().toISOString(), source, compression: 'zstd', partBytes: PART_BYTES,
    note: 'Instantané des fichiers sur disque, sans secrets, Git racine ni métadonnées OS étendues. Aucun lien symbolique suivi.',
    entries: [], exclusions: [], parts: [] };
  let bytes = 0, files = 0;
  const progress = setInterval(() => console.log(`Inventaire : ${files} fichiers, ${(bytes / 1024 ** 3).toFixed(2)} GiB contrôlés`), 15000);
  try {
    async function walk(relative = '') {
      for (const name of (await readdir(path.join(source, relative))).sort()) {
        const next = relative ? `${relative}/${name}` : name;
        const reason = excluded(next);
        if (reason) { manifest.exclusions.push({ path: next, reason }); continue; }
        const filename = path.join(source, next);
        const info = await lstat(filename);
        const entry = { path: next, mode: info.mode & 0o7777, mtime: info.mtime.toISOString() };
        if (info.isSymbolicLink()) {
          Object.assign(entry, { type: 'symlink', target: await readlink(filename) });
        } else if (info.isDirectory()) {
          entry.type = 'directory'; manifest.entries.push(entry); await walk(next); continue;
        } else if (info.isFile()) {
          if (publicCertificates.has(next)) {
            const certificate = await readFile(filename, 'utf8');
            if (!certificate.includes('-----BEGIN CERTIFICATE-----') || /-----BEGIN [^-]*PRIVATE KEY-----/.test(certificate)) {
              throw new Error(`Certificat public non conforme : ${next}`);
            }
          }
          Object.assign(entry, { type: 'file', bytes: info.size, sha256: await sha256(filename) });
          const after = await lstat(filename);
          if (info.size !== after.size || info.mtimeMs !== after.mtimeMs) throw new Error(`Fichier modifié pendant l'inventaire : ${next}`);
          bytes += info.size; files++;
        } else { manifest.exclusions.push({ path: next, reason: 'Objet système non régulier (socket/FIFO/etc.)' }); continue; }
        manifest.entries.push(entry);
      }
    }
    await walk();
  } finally { clearInterval(progress); }
  manifest.summary = { files, bytes, directories: manifest.entries.filter(x => x.type === 'directory').length,
    symlinks: manifest.entries.filter(x => x.type === 'symlink').length };
  await writeFile(path.join(output, 'filelist.nul'), manifest.entries.map(x => `./${x.path}\0`).join(''), { mode: 0o600 });
  console.log(`Compression : ${files} fichiers, ${(bytes / 1024 ** 3).toFixed(2)} GiB, ${manifest.exclusions.length} exclusions`);
  const tar = spawn('tar', ['-c', '--format=pax', '--no-recursion', '--no-xattrs', '--no-acls', '--no-fflags', '-C', source,
    '--null', '-T', path.join(output, 'filelist.nul'), '-f', '-'], { env: { ...process.env, COPYFILE_DISABLE: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  const zstd = spawn('zstd', ['-3', '-T2', '-q', '-c'], { stdio: ['pipe', 'pipe', 'pipe'] });
  const tarDone = processResult(tar, 'tar'); const zstdDone = processResult(zstd, 'zstd');
  const writer = new PartWriter(output);
  const results = await Promise.all([pipeline(tar.stdout, zstd.stdin), pipeline(zstd.stdout, writer), tarDone, zstdDone]);
  manifest.archiveWarnings = results.filter(x => typeof x === 'string' && x.trim());
  manifest.parts = writer.parts;
  const manifestFile = path.join(output, 'manifest.json');
  await writeFile(manifestFile, JSON.stringify(manifest, null, 2) + '\n', { mode: 0o600 });
  await writeFile(path.join(output, 'SHA256SUMS'), [...writer.parts.map(x => `${x.sha256}  ${x.name}`),
    `${await sha256(manifestFile)}  manifest.json`].join('\n') + '\n', { mode: 0o600 });
  console.log(JSON.stringify({ ...manifest.summary, parts: writer.parts.length, compressedBytes: writer.parts.reduce((n, x) => n + x.bytes, 0) }));
}
async function loadBackup() {
  if (!option('parts')) throw new Error('--parts est obligatoire');
  const directory = path.resolve(option('parts'));
  const sums = await readFile(path.join(directory, 'SHA256SUMS'), 'utf8');
  const hashes = new Map(sums.trim().split('\n').map(line => {
    const match = /^([a-f0-9]{64})  ([^/]+)$/.exec(line);
    if (!match) throw new Error('SHA256SUMS invalide');
    return [match[2], match[1]];
  }));
  if (hashes.get('manifest.json') !== await sha256(path.join(directory, 'manifest.json'))) throw new Error('Manifeste corrompu');
  const manifest = JSON.parse(await readFile(path.join(directory, 'manifest.json'), 'utf8'));
  if (manifest.format !== 1 || !manifest.parts?.length) throw new Error('Format inconnu ou vide');
  for (const [index, part] of manifest.parts.entries()) {
    if (part.name !== `mindstudio.tar.zst.part${String(index + 1).padStart(3, '0')}`) throw new Error('Pièces désordonnées');
    const filename = path.join(directory, part.name);
    if ((await stat(filename)).size !== part.bytes || hashes.get(part.name) !== part.sha256 || await sha256(filename) !== part.sha256) {
      throw new Error(`Pièce corrompue : ${part.name}`);
    }
    console.log(`SHA-256 validé : ${part.name}`);
  }
  for (const entry of manifest.entries) safeName(entry.path);
  return { directory, manifest };
}
async function feedParts(directory, manifest, stdin) {
  for (const part of manifest.parts) {
    for await (const block of createReadStream(path.join(directory, part.name))) {
      if (!stdin.write(block)) await new Promise((resolve, reject) => {
        const onError = error => { stdin.removeListener('drain', onDrain); reject(error); };
        const onDrain = () => { stdin.removeListener('error', onError); resolve(); };
        stdin.once('error', onError); stdin.once('drain', onDrain);
      });
    }
  }
  stdin.end();
}
// Analyse du tar en flux : contrôle de CHAQUE contenu, pas seulement de la compression.
async function inspectTar(stream, manifest) {
  const expected = new Map(manifest.entries.map(x => [x.path, x]));
  const seen = new Map();
  let buffer = Buffer.alloc(0), current = null, pendingPax = {}, globalPax = {}, finished = false;
  const string = block => block.toString('utf8').replace(/\0.*$/s, '');
  function parsePax(block) {
    const fields = {}; let pos = 0;
    while (pos < block.length) {
      const space = block.indexOf(32, pos); const count = Number(block.subarray(pos, space).toString());
      if (space < 0 || !Number.isInteger(count) || count <= 0 || pos + count > block.length) throw new Error('Entête PAX invalide');
      const record = block.subarray(space + 1, pos + count - 1).toString(); const equals = record.indexOf('=');
      if (equals > 0) fields[record.slice(0, equals)] = record.slice(equals + 1);
      pos += count;
    }
    return fields;
  }
  function endEntry() {
    if (current.type === 'x' || current.type === 'g') {
      const fields = parsePax(Buffer.concat(current.pax));
      if (current.type === 'g') globalPax = { ...globalPax, ...fields }; else pendingPax = fields;
    } else {
      const name = safeName(current.name), entry = expected.get(name);
      if (!entry || seen.has(name)) throw new Error(`Entrée inattendue/dupliquée : ${name}`);
      if (current.type === '0' || current.type === '') {
        const digest = current.hash.digest('hex');
        if (entry.type !== 'file' || entry.bytes !== current.size || entry.sha256 !== digest) throw new Error(`Contenu non conforme : ${name}`);
        seen.set(name, digest);
      } else if (current.type === '1') {
        const target = safeName(current.link);
        if (entry.type !== 'file' || seen.get(target) !== entry.sha256) throw new Error(`Lien physique non conforme : ${name}`);
        seen.set(name, entry.sha256);
      } else if (current.type === '2') {
        if (entry.type !== 'symlink' || entry.target !== current.link) throw new Error(`Lien symbolique non conforme : ${name}`);
        seen.set(name, 'symlink');
      } else if (current.type === '5') {
        if (entry.type !== 'directory') throw new Error(`Dossier non conforme : ${name}`);
        seen.set(name, 'directory');
      } else throw new Error(`Type tar non pris en charge : ${current.type} (${name})`);
    }
    current = null;
  }
  const timer = setInterval(() => console.log(`Contenus vérifiés : ${seen.size}/${expected.size} entrées`), 15000);
  try {
    for await (const chunk of stream) {
      buffer = buffer.length ? Buffer.concat([buffer, chunk]) : chunk;
      while (true) {
        if (!current) {
          if (buffer.length < 512) break;
          const header = buffer.subarray(0, 512); buffer = buffer.subarray(512);
          if (header.every(byte => byte === 0)) { finished = true; continue; }
          if (finished) throw new Error('Données après la fin du tar');
          const storedSum = parseInt(string(header.subarray(148, 156)).trim() || '0', 8);
          let sum = 0; for (let i = 0; i < 512; i++) sum += i >= 148 && i < 156 ? 32 : header[i];
          if (sum !== storedSum) throw new Error('Checksum entête tar invalide');
          const type = string(header.subarray(156, 157));
          const prefix = string(header.subarray(345, 500));
          let name = (prefix ? prefix + '/' : '') + string(header.subarray(0, 100));
          const fields = { ...globalPax, ...pendingPax };
          const extended = type === 'x' || type === 'g';
          const size = Number(!extended && fields.size !== undefined ? fields.size : parseInt(string(header.subarray(124, 136)).trim() || '0', 8));
          if (!Number.isSafeInteger(size) || size < 0) throw new Error('Taille tar invalide');
          let link = string(header.subarray(157, 257));
          if (!extended) { name = fields.path ?? name; link = fields.linkpath ?? link; pendingPax = {}; }
          current = { name, link, type, size, remaining: size, padding: (512 - size % 512) % 512,
            hash: createHash('sha256'), pax: [] };
        }
        if (current.remaining) {
          if (!buffer.length) break;
          const count = Math.min(current.remaining, buffer.length), data = buffer.subarray(0, count);
          if (current.type === 'x' || current.type === 'g') current.pax.push(Buffer.from(data)); else current.hash.update(data);
          current.remaining -= count; buffer = buffer.subarray(count);
          if (current.remaining) break;
        }
        if (buffer.length < current.padding) break;
        buffer = buffer.subarray(current.padding); endEntry();
      }
    }
    if (current || buffer.length || !finished || seen.size !== expected.size) throw new Error(`Archive incomplète (${seen.size}/${expected.size})`);
  } finally { clearInterval(timer); }
  return { entries: seen.size, files: manifest.summary.files, bytes: manifest.summary.bytes, allContentsSha256Match: true };
}
async function verifyLoaded(backup) {
  const zstd = spawn('zstd', ['-d', '-q', '-c'], { stdio: ['pipe', 'pipe', 'pipe'] });
  const done = processResult(zstd, 'zstd');
  const results = await Promise.all([feedParts(backup.directory, backup.manifest, zstd.stdin), inspectTar(zstd.stdout, backup.manifest), done]);
  const report = { verifiedAt: new Date().toISOString(), ...results[1], compressedSha256Match: true, zstdChecksumValid: true };
  console.log(JSON.stringify(report));
  return report;
}
async function restore() {
  if (!option('destination')) throw new Error('--destination est obligatoire');
  const backup = await loadBackup();
  await verifyLoaded(backup);
  const destination = path.resolve(option('destination'));
  const source = backup.manifest.source;
  if (destination === source || destination.startsWith(source + path.sep)) throw new Error('Ne jamais restaurer dans le dossier source actif');
  // Refuse les destinations existantes : aucun remplacement de données autorisé.
  await mkdir(destination, { recursive: false, mode: 0o700 });
  const zstd = spawn('zstd', ['-d', '-q', '-c'], { stdio: ['pipe', 'pipe', 'pipe'] });
  const tar = spawn('tar', ['-x', '-k', '-p', '-f', '-', '-C', destination], { stdio: ['pipe', 'ignore', 'pipe'] });
  await Promise.all([feedParts(backup.directory, backup.manifest, zstd.stdin), pipeline(zstd.stdout, tar.stdin),
    processResult(zstd, 'zstd'), processResult(tar, 'tar')]);
  console.log(`Restauration terminée dans ${destination}. Recréer .env.local séparément ; consulter docs/sauvegarde-github.md.`);
}
try {
  if (command === 'create') await create();
  else if (command === 'verify') {
    const backup = await loadBackup(); const report = await verifyLoaded(backup);
    await writeFile(path.join(backup.directory, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  } else if (command === 'restore') await restore();
  else throw new Error('Usage : github-backup.mjs create --source DIR --output DIR | verify --parts DIR | restore --parts DIR --destination NOUVEAU_DOSSIER');
} catch (error) { console.error(error.message); process.exitCode = 1; }
