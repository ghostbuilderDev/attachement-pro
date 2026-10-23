# Installer Attachement Pro avec Termux et GitHub Pages

Ce guide publie le programme sur votre propre compte GitHub. Vous obtenez une adresse HTTPS que vous pouvez ouvrir sur téléphone, tablette et ordinateur, puis installer comme une application.

Le programme n’a pas besoin de compilation, de Node.js, de Supabase ou d’un abonnement à un serveur. Les bibliothèques d’export sont déjà intégrées. Le site et le code publiés sont publics ; les dossiers créés dans l’application sont conservés dans le navigateur de chaque appareil. Les sauvegardes et exports ne sont pas envoyés à GitHub.

## 1. Télécharger le projet

Téléchargez l’archive fournie et enregistrez-la dans le dossier **Téléchargements** du téléphone. Son nom attendu dans les commandes est **attachement-pro.zip**. Si Android lui ajoute un suffixe, renommez-la ainsi ou adaptez la commande `unzip`.

Dans Termux, exécutez :

```bash
pkg update
pkg install -y git gh unzip coreutils findutils sed
termux-setup-storage
```

Acceptez l’autorisation Android permettant à Termux d’accéder aux fichiers du téléphone. Si l’autorisation ne s’affiche pas, ouvrez les paramètres Android de Termux, autorisez l’accès aux fichiers, puis relancez `termux-setup-storage`.

Décompressez l’archive dans **un nouveau dossier** pour préserver toute installation existante :

```bash
mkdir -p "$HOME/attachement-installation"
unzip -n "$HOME/storage/downloads/attachement-pro.zip" -d "$HOME/attachement-installation"
cd "$HOME/attachement-installation/attachement-pro"
```

`unzip -n` n’écrase pas les fichiers déjà présents. Pour refaire une installation de zéro après un essai, choisissez un autre nom de dossier, par exemple `attachement-installation-2`, dans les trois lignes. L’archive contient le dossier racine `attachement-pro/`. Le dossier à ouvrir contient `dist`, `scripts` et ce guide.

## 2. Créer votre dépôt et publier le site

La commande suivante crée un **nouveau dépôt public** nommé `attachement-pro` dans votre compte GitHub. L’option `--public` représente votre choix explicite de publier le code du programme.

```bash
bash scripts/deployer-termux.sh --public --repo attachement-pro
```

Si vous n’êtes pas connecté, GitHub CLI affiche un code et vous demande de vous authentifier dans le navigateur. Copiez le code, ouvrez la page indiquée et validez avec votre compte GitHub. Aucun mot de passe ni jeton n’est à coller dans le projet.

Si un dépôt `attachement-pro` existe déjà, le script s’arrête pour le préserver. Utilisez alors un autre nom :

```bash
bash scripts/deployer-termux.sh --public --repo attachement-chantier
```

Le script initialise le dépôt local, enregistre les fichiers du programme, crée le dépôt distant et active GitHub Pages. Il publie :

- les sources dans la branche `main` ;
- uniquement le contenu de `dist/` à la racine de la branche `gh-pages` ;
- GitHub Pages à partir de `gh-pages` et du dossier `/`.

Il n’utilise pas de `force-push`, ne réutilise pas un dépôt distant existant et ne change pas les données stockées dans le navigateur. Les fichiers `.pdf`, `.docx`, sauvegardes et exports sont exclus du suivi Git par défaut. Ne placez pas de données de chantier dans le dossier `dist/`.

## 3. Ouvrir l’application

À la fin, le script affiche l’adresse exacte, de la forme :

```text
https://VOTRE-COMPTE.github.io/attachement-pro/
```

GitHub prépare la publication après la commande. Un court délai est normal. Pour retrouver l’adresse et l’état de publication :

```bash
AP_COMPTE="$(gh api user --jq .login)"
gh api "repos/$AP_COMPTE/attachement-pro/pages" --jq '.html_url + " — " + .status'
```

Adaptez `attachement-pro` si vous avez choisi un autre nom. Vous pouvez aussi ouvrir votre dépôt sur GitHub puis **Settings → Pages**.

Si l’activation automatique de Pages est refusée par une règle du compte, choisissez dans cette page :

| Réglage | Valeur |
| --- | --- |
| Source | Deploy from a branch |
| Branch | gh-pages |
| Folder | / (root) |

Enregistrez, puis ouvrez l’adresse HTTPS indiquée par GitHub.

## 4. Installer sur le téléphone

### Android avec Chrome

1. Ouvrez l’adresse HTTPS dans Chrome, directement dans le navigateur.
2. Attendez le chargement complet et la confirmation que le mode hors connexion est prêt.
3. Utilisez le bouton **Installer** de l’application lorsqu’il est proposé, ou le menu **⋮ → Installer l’application** / **Ajouter à l’écran d’accueil**.
4. Ouvrez ensuite l’icône Attachements depuis l’écran d’accueil.

Les libellés peuvent varier selon le navigateur et le téléphone. Le bouton d’installation dépend de la prise en charge du navigateur ; il peut ne plus apparaître si l’application est déjà installée. Un fichier `index.html` ouvert dans le gestionnaire de fichiers ne suffit pas à installer la PWA : utilisez l’adresse HTTPS GitHub Pages.

### iPhone ou iPad

Ouvrez l’adresse dans Safari, puis **Partager → Sur l’écran d’accueil**. Sur certaines versions, activez l’option d’ouverture comme application web si elle est proposée.

### Ordinateur

Dans Chrome ou Edge, ouvrez l’adresse HTTPS puis utilisez l’icône d’installation de la barre d’adresse ou l’option d’installation du menu du navigateur.

## 5. Utiliser hors connexion et sauvegarder

La première ouverture doit se faire avec Internet pour charger l’ensemble du programme. Ensuite, les pages, la rédaction et les exports disponibles localement fonctionnent sans connexion, dès lors que le programme a été mis en cache et que le navigateur conserve ses données.

Les attachements sont enregistrés sur **l’appareil et le navigateur utilisés**. Les installations sont isolées par domaine et chemin : un autre téléphone, un autre navigateur ou une autre adresse d’installation n’a pas automatiquement accès aux mêmes dossiers. Si vous changez le nom du dépôt ou déplacez le site, exportez une sauvegarde depuis l’ancienne adresse puis restaurez-la à la nouvelle. Utilisez l’export de sauvegarde de l’application pour transférer les données et conservez une copie hors du téléphone. La suppression des données du navigateur, un appareil perdu ou le nettoyage du stockage peut effacer les données locales.

Les sauvegardes peuvent contenir des photos, noms et signatures : conservez-les avec les mêmes précautions que vos autres dossiers de chantier.

## 6. Publier une mise à jour

Commencez par exporter une sauvegarde depuis l’application. Remplacez ensuite les fichiers du programme dans votre dossier existant en conservant son répertoire `.git`.

Depuis ce dossier :

```bash
cd "$HOME/attachement-installation/attachement-pro"
bash scripts/mettre-a-jour.sh
```

Le script calcule une nouvelle version du programme, enregistre et pousse les changements sur `main`, puis met à jour `gh-pages` sans écraser son historique. Si `main` a été modifiée sur GitHub ou un autre appareil, le script vous demande d’intégrer ces changements avant de continuer.

Après la publication GitHub, ouvrez l’application avec Internet. Acceptez la mise à jour proposée après avoir enregistré votre travail. Le service worker conserve l’ancienne version jusqu’à cette action. La mise à jour du programme ne supprime pas la base locale des dossiers.

## 7. Reprendre après une interruption

Si le script s’interrompt après la création du dépôt, **ne supprimez pas votre dossier**. Vérifiez l’état :

```bash
git status
git remote -v
```

Si `origin` existe et correspond au dépôt souhaité, relancez :

```bash
bash scripts/mettre-a-jour.sh
```

Si le dépôt local existe mais qu’aucun `origin` n’a été créé, vérifiez d’abord sur GitHub si le dépôt distant existe. Pour rattacher le projet à votre dépôt neuf déjà créé :

```bash
AP_COMPTE="$(gh api user --jq .login)"
git remote add origin "https://github.com/$AP_COMPTE/attachement-pro.git"
git push -u origin main
bash scripts/mettre-a-jour.sh
```

Si le dépôt distant n’existe pas encore, créez-le depuis le dossier du projet :

```bash
AP_COMPTE="$(gh api user --jq .login)"
gh repo create "$AP_COMPTE/attachement-pro" --public --source . --remote origin --push
bash scripts/mettre-a-jour.sh
```

Adaptez toujours le nom du dépôt à celui que vous avez choisi.

## 8. Résoudre les problèmes courants

| Problème | Vérification |
| --- | --- |
| `No such file` pendant `unzip` | Vérifiez le nom exact de l’archive avec `ls "$HOME/storage/downloads"`. |
| `Permission denied` sur les téléchargements | Accordez l’accès aux fichiers Android et relancez `termux-setup-storage`. |
| Le dépôt existe déjà | Choisissez un autre nom `--repo` pour une première installation. Pour mettre à jour le même dépôt, utilisez `mettre-a-jour.sh`. |
| Erreur 404 sur le site | Attendez la fin de la publication, vérifiez l’adresse et **Settings → Pages → gh-pages / (root)**. |
| Le site affiche l’ancienne version | Rouvrez-le avec Internet et acceptez sa mise à jour. Le script de publication change automatiquement la version du cache. |
| Installation PWA absente | Ouvrez l’adresse HTTPS directement dans Chrome/Safari, vérifiez qu’elle n’est pas déjà installée et utilisez le menu du navigateur. |
| Hors connexion indisponible | Faites une ouverture complète avec Internet. Une ressource manquante empêche volontairement d’installer une version incomplète. |
| Données absentes sur un autre appareil | Importez votre sauvegarde dans l’application sur cet appareil. Il n’y a pas de synchronisation automatique. |
| Git refuse le `push` d’une mise à jour | Intégrez les changements distants avec `git pull --rebase origin main`, puis relancez le script. Aucun `force-push` n’est nécessaire. |

## Références techniques

- [GitHub Pages — créer un site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [GitHub Pages — choisir la source de publication](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [API GitHub Pages](https://docs.github.com/en/rest/pages/pages)
- [GitHub CLI — création d’un dépôt](https://cli.github.com/manual/gh_repo_create)
- [GitHub CLI — installation Android / Termux](https://github.com/cli/cli/blob/trunk/docs/install_linux.md)
- [MDN — rendre une PWA installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)

Références vérifiées le 23 octobre 2026. La disponibilité de GitHub Pages dépend du compte et de ses règles ; sur GitHub Free, cette procédure utilise un dépôt public.
