# Attachement Pro

Attachement Pro est une application PWA autonome pour rédiger, documenter et suivre les attachements de travaux. Elle fonctionne dans le navigateur, s’installe sur les appareils compatibles et permet de poursuivre le travail hors connexion après le premier chargement complet.

La rédaction suit six étapes : **Cadre → Faits → Relevés → Pièces → Constat → Suivi**. Le programme reprend la structure du modèle Word fourni et intègre une synthèse des règles de la fiche 7 et des annexes du RGF00099, version 01 du 3 mars 2026. Les références renvoient aux pages imprimées 33 à 43. Les PDF et le document Word internes d’origine ne sont pas inclus dans le dépôt destiné à être publié.

## Démarrer

- Pour mettre l’application en ligne depuis Android : [Installation Termux et GitHub Pages](INSTALLATION-TERMUX.md).
- Pour rédiger un premier dossier et comprendre les fonctions : [Guide d’utilisation](GUIDE-UTILISATION.md).
- Dans l’application, ouvrez **Paramètres** pour renseigner votre profil, puis **Chantiers** pour enregistrer les informations communes aux futurs constats.

La commande de première publication, depuis le dossier du projet, est :

```bash
bash scripts/deployer-termux.sh --public --repo attachement-pro
```

Elle crée un nouveau dépôt public dans votre compte GitHub et publie le contenu de `dist/` sur GitHub Pages. Le guide détaille l’installation des outils, l’extraction de l’archive, la connexion GitHub et les éventuelles reprises après interruption. Aucun dépôt distant n’est créé par le simple téléchargement de ce projet.

## Fonctions disponibles

| Besoin | Fonction |
| --- | --- |
| Retrouver les dossiers | Tableau de bord, recherche, filtres par chantier et état, archives, registre CSV. |
| Réutiliser les données communes | Profil du rédacteur et fiches chantier. |
| Rédiger les constats | Marché, commande, entreprise, emplacement, voie, PK, initiative, dates, faits et circonstances. |
| Documenter les mesures | Lignes de quantités, unités, dimensions réelles, références et observations factuelles. |
| Être guidé | 55 situations issues des tableaux, trames de rédaction, contrôles de champs et références de pages. |
| Ajouter les pièces | Photos JPEG/PNG/WebP, prise de vue si le navigateur le permet, fichiers PDF, légendes et repères. |
| Dessiner et annoter | Trait libre, segment, flèche, rectangle, texte, couleurs, épaisseur, annulation et rétablissement. |
| Organiser le contradictoire | Convocation, preuve, représentants, présence, absence, habilitations et suivi de présentation. |
| Établir un document | Attribution du numéro suivant et gel des faits, relevés, représentants et preuves. |
| Recueillir les signatures | Tracés manuscrits, identité et habilitation, date, confirmation du signataire et lien à l’empreinte du constat. |
| Gérer les suites | Réserves, refus, projet de PV, observations, pièces de procédure et preuve de transmission. |
| Corriger un acte établi | Nouvel attachement rectificatif ou abrogatoire, original conservé, numéro suivant à l’établissement. |
| Exporter | PDF, Word `.docx`, dossier complet ZIP, impression navigateur et sauvegarde JSON. |
| Préserver ou transférer les données | Sauvegarde complète, protection facultative par mot de passe et restauration avec contrôle des conflits. |

Les relevés sont factuels. L’application n’effectue pas de calcul de règlement, de valorisation financière ou de décision automatique d’acceptation.

Après la préparation d’un export PDF, Word ou ZIP, la fenêtre **Votre export est prêt** présente un lien direct **Télécharger**. Touchez ce lien pour récupérer le fichier, notamment sur téléphone.

## Données et fonctionnement hors connexion

Les dossiers et pièces sont enregistrés automatiquement dans **IndexedDB**, dans le navigateur utilisé. Le service worker conserve une copie locale du programme. Aucune base distante, aucun compte applicatif et aucune synchronisation automatique ne sont nécessaires.

Avant de travailler sans réseau, ouvrez le site en ligne et attendez **Prêt hors connexion**. L’installation sur l’écran d’accueil et le stockage persistant dépendent du navigateur. La présence du programme en cache ne remplace pas une sauvegarde de vos données.

Exportez régulièrement une sauvegarde et conservez-la dans un emplacement indépendant du téléphone. Chaque adresse d’installation possède son propre espace de données, identifié par le domaine et le chemin du site. Un changement d’appareil, de navigateur, de domaine ou de chemin ne transfère pas les dossiers : exportez puis restaurez une sauvegarde pour déplacer l’installation. Le nettoyage des données du navigateur peut effacer le travail local. Les sauvegardes générales peuvent être chiffrées avec un mot de passe ; le mot de passe n’est pas récupérable par l’application.

## Portée des signatures et contrôles

Les signatures dessinées sont des **images de signatures manuscrites**. Le programme les rattache à l’empreinte SHA-256 du contenu factuel établi. Cette empreinte sert au contrôle local d’intégrité ; elle ne constitue ni un certificat de signature électronique qualifiée ni un horodatage certifié. Une copie signée selon votre procédure peut être jointe dans le suivi.

Les échéances sont des repères de suivi fondés sur les dates saisies. L’application ne prononce pas l’opposabilité d’un attachement, ne déduit pas une acceptation de l’expiration d’un délai et n’envoie aucune notification ou pièce à un destinataire. Le rédacteur vérifie les faits, les habilitations, le marché et les modalités de computation applicables.

Attachement Pro est un outil autonome d’aide à la rédaction, sans certification ni affiliation officielle SNCF.

## Projet technique

Le site est statique et ne nécessite aucune compilation. Les ressources sont fournies localement dans `dist/`, y compris les bibliothèques d’export ; aucun CDN n’est nécessaire à l’utilisation.

| Élément | Rôle |
| --- | --- |
| `dist/index.html`, `styles.css` | Coque de l’interface et présentation responsive. |
| `dist/js/app.js` | Navigation, formulaires et actions utilisateur. |
| `dist/js/core.js` | Modèle, numérotation, contrôles, empreintes et chiffrement des sauvegardes. |
| `dist/js/db.js` | Enregistrement transactionnel local et gestion des conflits. |
| `dist/js/media.js` | Import d’images, documents et outils de dessin. |
| `dist/js/exports.js` | Documents PDF, DOCX, CSV et ZIP. |
| `dist/js/references.js` | Synthèse des sources, catégories et aides à la rédaction. |
| `dist/sw.js`, `manifest.webmanifest` | Installation PWA et cache hors connexion. |
| `scripts/` | Première publication et mises à jour GitHub Pages. |
| `tests/` | Vérifications automatisées du modèle, des exports, de la PWA et des scripts. |

Le routage utilise les fragments d’URL : `#dashboard`, `#documents`, `#projects`, `#references`, `#backup`, `#settings` et `#editor/identifiant/etape`. Il ne nécessite pas de réécriture serveur. Les chemins relatifs permettent l’hébergement sous un sous-répertoire GitHub Pages.

### Vérification locale

Avec Node.js 20 ou plus récent :

```bash
npm test
npm run check
```

Les tests de publication nécessitent aussi Bash et Git ; ils utilisent un GitHub simulé et un dépôt Git local temporaire, sans créer de dépôt distant ni contacter GitHub. Les tests automatisés ne constituent pas une validation de l’installation sur chaque modèle de téléphone.

La livraison a aussi fait l’objet d’une vérification de la rédaction, du dessin, de l’enregistrement et de la restauration dans le navigateur, ainsi que de la présentation sur une largeur de 390 px. Les exports PDF et Word ont été générés et contrôlés visuellement ; la structure du dossier ZIP a été vérifiée. Dans l’environnement de prévisualisation HTTP, la génération de l’archive a réussi mais son téléchargement par le navigateur n’a pas pu être confirmé. L’installation PWA, le fonctionnement hors connexion et les actions nécessitant Web Crypto doivent être vérifiés sur l’adresse HTTPS finale et votre téléphone. Aucun dépôt GitHub réel n’a été créé pendant ces tests.

Pour servir le projet localement avec Python 3 :

```bash
python3 -m http.server 8000 --directory dist
```

Ouvrez ensuite `http://localhost:8000/`. N’ouvrez pas directement `index.html` avec une URL `file://` : les modules JavaScript et l’installation PWA nécessitent un serveur local ou une adresse HTTPS.

### Publication et mise à jour

Les sources sont enregistrées dans `main`. La branche `gh-pages` contient uniquement `dist/`. Les scripts ne font aucun `force-push` et refusent de remplacer un dépôt distant existant lors d’une première publication.

```bash
bash scripts/mettre-a-jour.sh
```

Le script calcule une version du cache à partir du contenu du programme, puis publie la mise à jour. L’application propose ensuite de la charger après enregistrement de la saisie. La configuration de prévisualisation locale `.openai/` est exclue du dépôt.

Les licences des bibliothèques embarquées se trouvent dans `dist/vendor/`. Les icônes de l’application ont été dessinées pour ce projet.
