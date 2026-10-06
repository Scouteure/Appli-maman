# Pour maman 🌸

Une petite page web, à ouvrir chaque jour, qui affiche :

1. un gentil message qui change tous les jours ;
2. un bouton « Découvrir la fleur du jour » ;
3. une fiche fleur (photo, description, floraison, exposition, arrosage, sol, plantation, conseil, langage des fleurs) qui change aussi tous les jours.

Tout fonctionne sans serveur : ce sont de simples fichiers HTML / CSS / JavaScript.
Il y a 70 fleurs et 45 messages, qui tournent automatiquement en boucle.

## Mettre le site en ligne (gratuit, avec GitHub Pages)

1. Fusionne cette branche dans `main` (ou pousse ces fichiers sur `main`).
2. Sur GitHub, va dans **Settings → Pages**.
3. Dans **Build and deployment → Source**, choisis **Deploy from a branch**, puis la branche `main` et le dossier `/ (root)`. Enregistre.
4. Après une ou deux minutes, le site est disponible à l'adresse `https://<ton-pseudo>.github.io/Appli-maman/`.

Tu peux envoyer ce lien à ta maman ; sur téléphone, elle peut même l'ajouter à son écran d'accueil.

## Personnaliser

- **Les messages** : `data/messages.js`. Ajoute ou modifie des lignes dans la liste `MESSAGES`.
- **Les messages pour une date précise** (anniversaire, etc.) : dans le même fichier, `MESSAGES_SPECIAUX`, au format `"MM-JJ": "Message"`. Un exemple est déjà prêt en commentaire.
- **La fête des mères** est détectée automatiquement (dernier dimanche de mai en France) et affiche `MESSAGE_FETE_DES_MERES`.
- **Les fleurs** : `data/fleurs.js`. Chaque fleur a un champ `wiki` qui doit correspondre au titre exact d'une page Wikipédia en français : c'est de là que vient la photo.
- **Les couleurs** : en haut de `style.css`, dans `:root`.

## Tester une autre date

Ajoute `?date=AAAA-MM-JJ` à l'adresse, par exemple `index.html?date=2026-05-31` pour voir le message de la fête des mères.

## Tester en local

Ouvre simplement `index.html` dans un navigateur, ou lance un petit serveur :

```
python3 -m http.server 8000
```

puis va sur http://localhost:8000.
