import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bash = spawnSync('bash', ['--version'], { encoding: 'utf8' });
const gitAvailable = spawnSync('git', ['--version'], { encoding: 'utf8' });
const skip = bash.status !== 0 || gitAvailable.status !== 0 ? 'Vérification du déploiement : bash et git requis.' : false;
const shellQuote = value => `'${String(value).replaceAll("'", "'\\''")}'`;

test('Les deux scripts de publication ont une syntaxe Bash valide', { skip }, () => {
  for (const file of ['deployer-termux.sh', 'mettre-a-jour.sh']) {
    const result = spawnSync('bash', ['-n', path.join(root, 'scripts', file)], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  }
});

test('Première publication et mise à jour complètes avec GitHub simulé et un vrai Git local', { skip, timeout: 30000 }, () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'attachement-deployment-test-'));
  try {
    const project = path.join(temp, 'project');
    const bin = path.join(temp, 'bin');
    for (const dir of ['project/scripts', 'project/dist/js', 'project/exports', 'bin', 'remotes']) fs.mkdirSync(path.join(temp, dir), { recursive: true });
    for (const file of ['deployer-termux.sh', 'mettre-a-jour.sh']) fs.copyFileSync(path.join(root, 'scripts', file), path.join(project, 'scripts', file));
    fs.copyFileSync(path.join(root, '.gitignore'), path.join(project, '.gitignore'));
    fs.writeFileSync(path.join(project, 'dist/index.html'), '<!doctype html><title>Test</title>');
    fs.writeFileSync(path.join(project, 'dist/sw.js'), "const VERSION = '1.0.0';\n");
    fs.writeFileSync(path.join(project, 'dist/manifest.webmanifest'), '{}');
    fs.writeFileSync(path.join(project, 'dist/js/app.js'), 'console.log(1);\n');
    fs.writeFileSync(path.join(project, 'chantier-confidentiel.pdf'), 'Ne pas publier');
    fs.writeFileSync(path.join(project, 'exports/photo.png'), 'Ne pas publier');

    const realGit = spawnSync('bash', ['-c', 'command -v git'], { encoding: 'utf8' }).stdout.trim();
    assert.ok(realGit);
    fs.writeFileSync(path.join(bin, 'git'), `#!/usr/bin/env bash\nif [[ "$*" == "remote get-url origin" ]]; then printf 'https://github.com/test-owner/attachement-pro.git\\n'; else exec ${shellQuote(realGit)} "$@"; fi\n`, { mode: 0o755 });
    fs.writeFileSync(path.join(bin, 'gh'), `#!/usr/bin/env bash
set -euo pipefail
case "$1 $2" in
  'auth status'|'auth setup-git') exit 0 ;;
  'api user')
    case "$*" in *'.login'*) printf 'test-owner\\n';; *'.id'*) printf '123456\\n';; esac; exit 0 ;;
  'repo view') [[ -d "$AP_MOCK_ROOT/remotes/attachement-pro.git" ]]; exit $? ;;
  'repo create')
    git init --bare "$AP_MOCK_ROOT/remotes/attachement-pro.git" >/dev/null
    git config --local url."file://$AP_MOCK_ROOT/remotes/".insteadOf https://github.com/test-owner/
    git remote add origin https://github.com/test-owner/attachement-pro.git
    git push -u origin main
    exit 0 ;;
  'api --method')
    cat >/dev/null
    touch "$AP_MOCK_ROOT/pages-created"
    printf '{"status":"built"}\\n'; exit 0 ;;
  api*)
    [[ -f "$AP_MOCK_ROOT/pages-created" ]] && printf '{"status":"built"}\\n'; exit 0 ;;
  *) printf 'Commande gh inattendue : %s\\n' "$*" >&2; exit 44 ;;
esac
`, { mode: 0o755 });
    const env = { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, AP_MOCK_ROOT: temp, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' };
    const run = (args, expected = 0) => {
      const result = spawnSync('bash', args, { cwd: project, env, encoding: 'utf8', timeout: 15000 });
      assert.equal(result.status, expected, `${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
      return result;
    };
    const remoteGit = (...args) => {
      const result = spawnSync(realGit, ['--git-dir', path.join(temp, 'remotes/attachement-pro.git'), ...args], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      return result.stdout.trim();
    };
    run(['scripts/deployer-termux.sh', '--help']);
    run(['scripts/deployer-termux.sh'], 2);
    run(['scripts/deployer-termux.sh', '--public', '--repo', '../mauvais'], 2);
    assert.equal(fs.existsSync(path.join(project, '.git')), false);
    run(['scripts/deployer-termux.sh', '--public', '--repo', 'attachement-pro']);
    const mainFiles = remoteGit('ls-tree', '-r', '--name-only', 'main').split('\n');
    const pageFiles = remoteGit('ls-tree', '-r', '--name-only', 'gh-pages').split('\n');
    assert.ok(mainFiles.includes('dist/index.html'));
    assert.ok(mainFiles.includes('scripts/deployer-termux.sh'));
    assert.ok(pageFiles.includes('index.html'));
    assert.equal(pageFiles.some(f => f.startsWith('dist/')), false);
    assert.equal([...mainFiles, ...pageFiles].some(f => f.includes('confidentiel') || f.includes('photo.png')), false);
    const first = remoteGit('rev-parse', 'gh-pages');
    const firstWorker = remoteGit('show', 'gh-pages:sw.js');
    fs.writeFileSync(path.join(project, 'dist/js/app.js'), 'console.log(2);\n');
    run(['scripts/mettre-a-jour.sh']);
    const second = remoteGit('rev-parse', 'gh-pages');
    assert.notEqual(first, second);
    assert.equal(remoteGit('rev-parse', 'gh-pages^'), first, 'La mise à jour conserve son historique.');
    assert.notEqual(remoteGit('show', 'gh-pages:sw.js'), firstWorker);
    assert.equal(remoteGit('show', 'gh-pages:js/app.js'), 'console.log(2);');
    run(['scripts/mettre-a-jour.sh']);
    assert.equal(remoteGit('rev-parse', 'gh-pages'), second, 'Pas de nouveau déploiement pour un contenu identique.');
    fs.appendFileSync(path.join(project, 'dist/sw.js'), '// Correction du worker seul\n');
    run(['scripts/mettre-a-jour.sh']);
    assert.notEqual(remoteGit('rev-parse', 'gh-pages'), second, 'Une correction du SW seul déclenche une nouvelle version.');
    run(['scripts/deployer-termux.sh', '--public', '--repo', 'attachement-pro'], 1);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
