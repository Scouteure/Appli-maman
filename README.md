# Pour maman 🌸

Une petite page web, à ouvrir chaque jour, qui affiche :

1. un gentil message qui change tous les jours ;
2. un bouton « Découvrir la fleur du jour » ;
3. une fiche fleur (photo, description, étymologie du nom, floraison, exposition, arrosage, sol, plantation, conseil, langage des fleurs) qui change aussi tous les jours.

Tout fonctionne sans serveur : ce sont de simples fichiers HTML / CSS / JavaScript.
Il y a 70 fleurs et 45 messages, qui tournent automatiquement en boucle.

## Mettre le site en ligne (gratuit, avec GitHub Pages)

GitHub Pages n'est gratuit que pour les dépôts **publics**, il faut donc :

1. Sur GitHub, aller dans **Settings → General**, tout en bas dans **Danger Zone → Change repository visibility**, et passer le dépôt en **Public**.
2. Aller dans **Settings → Pages**. Dans **Build and deployment → Source**, choisir **Deploy from a branch**, puis la branche à publier (`main`, ou directement `claude/exciting-planck-f1vwdn`) et le dossier `/ (root)`. Enregistrer.
3. Après une ou deux minutes, le site est disponible à l'adresse `https://scouteure.github.io/Appli-maman/`.

Tu peux envoyer ce lien à ta maman ; sur téléphone, elle peut même l'ajouter à son écran d'accueil.

## Personnaliser

- **Les messages** : `data/messages.js`. Ajoute ou modifie des lignes dans la liste `MESSAGES`.
- **Les messages pour une date précise** (anniversaire, etc.) : dans le même fichier, `MESSAGES_SPECIAUX`, au format `"MM-JJ": "Message"`. Un exemple est déjà prêt en commentaire.
- **La fête des mères** est détectée automatiquement (dernier dimanche de mai en France) et affiche `MESSAGE_FETE_DES_MERES`.
- **Les fleurs** : `data/fleurs.js`. Chaque fleur a un champ `etymologie` qui raconte l'origine de son nom. Chaque fleur a une photo dans `data/photos/` (issue de Wikimedia Commons, le champ `credit` garde le nom du fichier d'origine) et un champ `wiki` qui pointe vers sa page Wikipédia.
- **Les couleurs** : en haut de `style.css`, dans `:root`.

## Tester une autre date

Ajoute `?date=AAAA-MM-JJ` à l'adresse, par exemple `index.html?date=2026-05-31` pour voir le message de la fête des mères.

## Tester en local

Ouvre simplement `index.html` dans un navigateur, ou lance un petit serveur :

```
python3 -m http.server 8000
```

puis va sur http://localhost:8000.
