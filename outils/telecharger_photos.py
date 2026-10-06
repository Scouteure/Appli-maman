#!/usr/bin/env python3
"""Télécharge depuis Wikipédia la photo des fleurs qui n'en ont pas encore,
la réduit à 640 px et l'enregistre dans data/photos/. Met à jour data/fleurs.js
(champs photo et credit). Reprenable : les fleurs déjà pourvues sont ignorées.

Usage : python3 outils/telecharger_photos.py   (depuis la racine du dépôt)
Nécessite Pillow (pip install pillow).
"""
import io, json, re, time, unicodedata, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image

RACINE = Path(__file__).resolve().parent.parent
FLEURS = RACINE / "data" / "fleurs.js"
PHOTOS = RACINE / "data" / "photos"
UA = {"User-Agent": "appli-maman/1.0 (page cadeau personnelle)"}


def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def get(url, essais=5):
    for i in range(essais):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 429 and i < essais - 1:
                print(f"  limite de débit, pause {45 * (i + 1)} s")
                time.sleep(45 * (i + 1))
                continue
            raise


def main():
    PHOTOS.mkdir(exist_ok=True)
    src = FLEURS.read_text(encoding="utf-8")
    blocs = re.findall(r'(    nom: "([^"]+)", latin: "[^"]+", wiki: "([^"]+)", emoji: "[^"]+",\n)(    photo: [^\n]*\n)?', src)
    for entete, nom, wiki in [(b[0], b[1], b[2]) for b in blocs if not b[3]]:
        titre = wiki.replace(" ", "_")
        url = ("https://fr.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages"
               "&piprop=thumbnail|name&pithumbsize=640&redirects=1&titles=" + urllib.parse.quote(titre))
        page = list(json.loads(get(url))["query"]["pages"].values())[0]
        if "thumbnail" not in page:
            print(f"{nom} : pas d'image sur Wikipédia")
            continue
        time.sleep(3)
        im = Image.open(io.BytesIO(get(page["thumbnail"]["source"]))).convert("RGB")
        im.thumbnail((640, 640))
        chemin = PHOTOS / f"{slug(nom)}.jpg"
        im.save(chemin, "JPEG", quality=80, optimize=True, progressive=True)
        ligne = '    photo: %s, credit: %s,\n' % (json.dumps(f"data/photos/{chemin.name}"), json.dumps(page.get("pageimage", ""), ensure_ascii=False))
        src = src.replace(entete, entete + ligne, 1)
        FLEURS.write_text(src, encoding="utf-8")
        print(f"{nom} : {chemin.name} ({chemin.stat().st_size // 1024} ko)")
        time.sleep(3)


if __name__ == "__main__":
    main()
