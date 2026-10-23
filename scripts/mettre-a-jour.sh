#!/usr/bin/env bash
# Publication normale, sans force-push et sans toucher aux dossiers du navigateur.
set -Eeuo pipefail
ap_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ap_dir"
for ap_command in git gh sha256sum sort xargs sed find cut; do
  command -v "$ap_command" >/dev/null || { printf 'Commande manquante : %s\n' "$ap_command" >&2; exit 1; }
done
[[ -d .git && -f dist/index.html ]] || {
  printf 'Lancez ce script dans le projet déjà publié avec deployer-termux.sh.\n' >&2; exit 1;
}
[[ "$(git branch --show-current)" == main ]] || {
  printf 'Placez-vous sur la branche main avant de publier. Aucune branche n’a été changée.\n' >&2; exit 1;
}
gh auth status --hostname github.com >/dev/null
gh auth setup-git --hostname github.com
ap_remote="$(git remote get-url origin)"
case "$ap_remote" in
  https://github.com/*) ap_full="${ap_remote#https://github.com/}" ;;
  git@github.com:*) ap_full="${ap_remote#git@github.com:}" ;;
  *) printf 'Le dépôt origin doit être hébergé sur github.com.\n' >&2; exit 1 ;;
esac
ap_full="${ap_full%.git}"
[[ "$ap_full" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || { printf 'Adresse GitHub inattendue.\n' >&2; exit 1; }
ap_owner="${ap_full%%/*}"
ap_repo="${ap_full#*/}"

# Récupérer le distant avant la modification ; refuser un main divergent.
git fetch origin main
if ! git merge-base --is-ancestor FETCH_HEAD HEAD; then
  printf 'La branche distante main contient des changements à intégrer.\nExécutez git pull --rebase origin main, résolvez les conflits éventuels, puis relancez.\n' >&2
  exit 1
fi
ap_hash="$(
  {
    find dist -type f ! -name sw.js -print0 | sort -z | xargs -0 sha256sum
    sed -E "s/^const VERSION = '[^']+';$/const VERSION = 'VERSION';/" dist/sw.js
  } | sha256sum | cut -c1-16
)"
sed -i -E "s/^const VERSION = '[^']+';$/const VERSION = '${ap_hash}';/" dist/sw.js
for ap_path in dist scripts tests package.json .gitignore README.md INSTALLATION-TERMUX.md GUIDE-UTILISATION.md REFERENCES.md THIRD-PARTY-NOTICES.md; do
  if [[ -e "$ap_path" ]]; then git add -A -- "$ap_path"; fi
done
if ! git diff --cached --quiet; then git commit -m 'Mettre à jour Attachement Pro'; fi
git push origin main
ap_tree="$(git rev-parse HEAD:dist)"
if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
  git fetch origin gh-pages
  ap_parent="$(git rev-parse FETCH_HEAD)"
  ap_previous_tree="$(git rev-parse "$ap_parent^{tree}")"
  if [[ "$ap_previous_tree" == "$ap_tree" ]]; then
    printf 'Le contenu publié est déjà à jour.\n'
  else
    ap_pages_commit="$(git commit-tree "$ap_tree" -p "$ap_parent" -m 'Mettre à jour Attachement Pro sur GitHub Pages')"
    git push origin "${ap_pages_commit}:refs/heads/gh-pages"
  fi
else
  ap_pages_commit="$(git commit-tree "$ap_tree" -m 'Publier Attachement Pro sur GitHub Pages')"
  git push origin "${ap_pages_commit}:refs/heads/gh-pages"
fi
if gh api "repos/$ap_full/pages" >/dev/null 2>&1; then
  gh api --method PUT "repos/$ap_full/pages" --input - <<'JSON'
{"build_type":"legacy","source":{"branch":"gh-pages","path":"/"}}
JSON
else
  gh api --method POST "repos/$ap_full/pages" --input - <<'JSON'
{"build_type":"legacy","source":{"branch":"gh-pages","path":"/"}}
JSON
fi
printf '\nSite : https://%s.github.io/%s/\n' "$ap_owner" "$ap_repo"
printf 'Après la publication GitHub, rouvrez l’application et acceptez sa mise à jour.\n'
printf 'Les données locales du navigateur ne sont pas modifiées par ce script.\n'
