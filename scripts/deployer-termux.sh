#!/usr/bin/env bash
# Première publication uniquement. Aucun token n’est copié dans les fichiers.
set -Eeuo pipefail

usage() {
  cat <<'HELP'
Attachement Pro — première publication sur GitHub Pages

Utilisation : bash scripts/deployer-termux.sh --public --repo attachement-pro

--public est obligatoire : le CODE de l’application et le site seront publics.
Les attachements saisis dans l’application restent dans le navigateur : ce script
ne lit pas la base locale du navigateur et ne téléverse pas vos dossiers.
Un dépôt GitHub portant déjà ce nom n’est jamais réutilisé ou écrasé.
HELP
}

ap_repo='attachement-pro'
ap_public=0
while (($#)); do
  case "$1" in
    --public) ap_public=1; shift ;;
    --repo) [[ $# -ge 2 ]] || { usage; exit 2; }; ap_repo="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) printf 'Option inconnue : %s\n' "$1" >&2; usage; exit 2 ;;
  esac
done
[[ "$ap_public" == 1 ]] || { usage; exit 2; }
[[ "$ap_repo" =~ ^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$ && "$ap_repo" != *.github.io ]] || {
  printf 'Choisissez un nom de dépôt de projet, par exemple attachement-pro.\n' >&2; exit 2;
}
for ap_command in git gh sha256sum sort xargs sed find cut; do
  command -v "$ap_command" >/dev/null || {
    printf 'Commande manquante : %s. Dans Termux : pkg install git gh coreutils findutils sed\n' "$ap_command" >&2; exit 1;
  }
done
ap_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ap_dir"
[[ -f dist/index.html && -f dist/sw.js && -f dist/manifest.webmanifest ]] || {
  printf 'Archive incomplète : index.html, sw.js ou manifeste absent de dist/.\n' >&2; exit 1;
}
if [[ -e .git ]]; then
  printf 'Ce dossier possède déjà un dépôt Git. Pour publier sa mise à jour :\n  bash scripts/mettre-a-jour.sh\nAucun fichier ni dépôt distant n’a été écrasé.\n' >&2
  exit 1
fi
if ! gh auth status --hostname github.com >/dev/null 2>&1; then
  gh auth login --hostname github.com --git-protocol https --web
fi
gh auth setup-git --hostname github.com
ap_owner="$(gh api user --jq .login)"
ap_userid="$(gh api user --jq .id)"
ap_full="$ap_owner/$ap_repo"
if gh repo view "$ap_full" --json name >/dev/null 2>&1; then
  printf 'Le dépôt %s existe déjà. Relancez avec un autre nom --repo.\n' "$ap_full" >&2
  exit 1
fi
printf 'Publication du code dans le dépôt PUBLIC https://github.com/%s\n' "$ap_full"
printf 'Les fichiers distribués dans dist/ seront accessibles à tous.\n'

# Le hash fait évoluer le service worker à chaque changement du programme.
ap_hash="$(
  {
    find dist -type f ! -name sw.js -print0 | sort -z | xargs -0 sha256sum
    sed -E "s/^const VERSION = '[^']+';$/const VERSION = 'VERSION';/" dist/sw.js
  } | sha256sum | cut -c1-16
)"
sed -i -E "s/^const VERSION = '[^']+';$/const VERSION = '${ap_hash}';/" dist/sw.js

git init -b main
if ! git config user.name >/dev/null; then git config --local user.name "$ap_owner"; fi
if ! git config user.email >/dev/null; then git config --local user.email "${ap_userid}+${ap_owner}@users.noreply.github.com"; fi
# Liste volontairement limitée aux fichiers du programme, sans exports utilisateur.
for ap_path in dist scripts tests package.json .gitignore README.md INSTALLATION-TERMUX.md GUIDE-UTILISATION.md REFERENCES.md THIRD-PARTY-NOTICES.md; do
  if [[ -e "$ap_path" ]]; then git add -- "$ap_path"; fi
done
git commit -m 'Créer Attachement Pro PWA'
gh repo create "$ap_full" --public --source . --remote origin --push --description 'Attachement Pro — rédaction et suivi des attachements de travaux'

# La publication crée un commit ayant uniquement dist/ à sa racine.
ap_tree="$(git rev-parse HEAD:dist)"
ap_pages_commit="$(git commit-tree "$ap_tree" -m 'Publier Attachement Pro sur GitHub Pages')"
git push origin "${ap_pages_commit}:refs/heads/gh-pages"
gh api --method POST "repos/$ap_full/pages" \
  --input - <<'JSON'
{"build_type":"legacy","source":{"branch":"gh-pages","path":"/"}}
JSON

printf '\nPublication demandée. GitHub prépare le site :\n  https://%s.github.io/%s/\n' "$ap_owner" "$ap_repo"
printf '\nPour vérifier la mise en ligne :\n  gh api repos/%s/pages --jq '\''.html_url + " — " + .status'\''\n' "$ap_full"
printf 'Attendez que GitHub termine, puis ouvrez le lien HTTPS dans Chrome.\n'
printf 'Dans l’application, attendez la confirmation du mode hors connexion avant de quitter le réseau.\n'
