// Génère la « fiche » d'une fleur : une image PNG d'une page (format A4), dessinée dans un canvas.
(function () {
  "use strict";

  var L = 1240, H = 1754, MARGE = 70; // A4 à 150 points par pouce
  var COULEURS = {
    fond: "#fffaf8", bande1: "#fbe3ea", bande2: "#fdf2f4", rose: "#c9507a", texte: "#4a3b42", doux: "#8a7079",
    vert: "#5f8f6b", vertClair: "#e8f3ea", parchemin: "#fdf5e4", parcheminBord: "#f1e2bf", brun: "#9a6b1f", brunTexte: "#5a4a2e",
    carte: "#fff6f8", carteBord: "#f5d9e1", blanc: "#ffffff",
  };

  function arrondi(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Écrit un texte en le coupant aux espaces. Retourne la hauteur occupée. Si dessiner vaut false, mesure seulement.
  function paragraphe(ctx, texte, x, y, largeur, interligne, dessiner) {
    // Espaces insécables avant les signes doubles et à l'intérieur des guillemets, à la française.
    var mots = String(texte).replace(/« /g, "«\u00a0").replace(/ ([»:;!?])/g, "\u00a0$1").split(/ +/), ligne = "", lignes = [];
    for (var i = 0; i < mots.length; i++) {
      var essai = ligne ? ligne + " " + mots[i] : mots[i];
      if (ctx.measureText(essai).width > largeur && ligne) { lignes.push(ligne); ligne = mots[i]; }
      else ligne = essai;
    }
    if (ligne) lignes.push(ligne);
    if (dessiner) for (var j = 0; j < lignes.length; j++) ctx.fillText(lignes[j], x, y + j * interligne);
    return lignes.length * interligne;
  }

  function chargerImage(src) {
    return new Promise(function (ok) {
      if (!src) return ok(null);
      var img = new Image();
      img.onload = function () { ok(img); };
      img.onerror = function () { ok(null); };
      img.src = src;
    });
  }

  function dessinerImageCouvrante(ctx, img, x, y, w, h, r) {
    ctx.save();
    arrondi(ctx, x, y, w, h, r);
    ctx.clip();
    if (img) {
      var ratio = Math.max(w / img.width, h / img.height);
      var lw = img.width * ratio, lh = img.height * ratio;
      ctx.drawImage(img, x + (w - lw) / 2, y + (h - lh) / 2, lw, lh);
    } else {
      ctx.fillStyle = COULEURS.vertClair;
      ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
  }

  function police(ctx, taille, famille, style) {
    ctx.font = (style || "") + " " + taille + "px " + (famille === "titre" ? '"Caveat", cursive' : '"Nunito", "Segoe UI", sans-serif');
  }

  // Dessine (ou mesure) la fiche avec un facteur d'échelle pour le texte. Retourne la hauteur finale utilisée.
  function composer(ctx, infos, img, echelle, dessiner) {
    var f = infos.fleur, e = echelle, y;
    var largeurTexte = L - 2 * MARGE;

    if (dessiner) {
      ctx.fillStyle = COULEURS.fond;
      ctx.fillRect(0, 0, L, H);
      var deg = ctx.createLinearGradient(0, 0, L, 0);
      deg.addColorStop(0, COULEURS.bande1); deg.addColorStop(1, COULEURS.bande2);
      ctx.fillStyle = deg;
      ctx.fillRect(0, 0, L, 140);
      // bande du haut
      ctx.fillStyle = COULEURS.vert;
      police(ctx, 22, "texte", "700");
      ctx.textAlign = "left";
      ctx.fillText(("LA FLEUR DU JOUR  ·  FICHE N° " + infos.numero).toUpperCase(), MARGE, 62);
      ctx.fillStyle = COULEURS.doux;
      police(ctx, 24, "texte", "600");
      ctx.textAlign = "right";
      ctx.fillText(infos.date, L - MARGE, 60);
      if (infos.saint) { police(ctx, 22, "texte", ""); ctx.fillText(infos.saint, L - MARGE, 96); }
      ctx.textAlign = "left";
    }

    // Titre
    y = 140 + 92 * e;
    if (dessiner) {
      ctx.fillStyle = COULEURS.rose;
      police(ctx, 84 * e, "titre", "700");
      ctx.textAlign = "center";
      ctx.fillText(f.nom, L / 2, y);
      ctx.fillStyle = COULEURS.doux;
      police(ctx, 30 * e, "texte", "italic");
      ctx.fillText(f.latin, L / 2, y + 44 * e);
      ctx.textAlign = "left";
    }
    y += 78 * e;

    // Photo à gauche, description à droite
    var photoL = 520, photoH = 390, colX = MARGE + photoL + 40, colL = L - MARGE - colX;
    if (dessiner) dessinerImageCouvrante(ctx, img, MARGE, y, photoL, photoH, 24);
    ctx.fillStyle = COULEURS.texte;
    police(ctx, 27 * e, "texte", "");
    var hDesc = paragraphe(ctx, f.description, colX, y + 30 * e, colL, 40 * e, dessiner);
    y += Math.max(photoH, hDesc + 10) + 34;

    // Étymologie
    police(ctx, 26 * e, "texte", "");
    var hEtym = paragraphe(ctx, f.etymologie, 0, 0, largeurTexte - 60, 38 * e, false);
    var boiteH = hEtym + 100 * e;
    if (dessiner) {
      ctx.fillStyle = COULEURS.parchemin;
      arrondi(ctx, MARGE, y, largeurTexte, boiteH, 22); ctx.fill();
      ctx.strokeStyle = COULEURS.parcheminBord; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = COULEURS.brun;
      police(ctx, 42 * e, "titre", "700");
      ctx.fillText("📖 D'où vient son nom ?", MARGE + 30, y + 52 * e);
      ctx.fillStyle = COULEURS.brunTexte;
      police(ctx, 26 * e, "texte", "");
      paragraphe(ctx, f.etymologie, MARGE + 30, y + 96 * e, largeurTexte - 60, 38 * e, true);
    }
    y += boiteH + 30;

    // Entretien : cinq lignes
    var lignes = [["🗓️", "Floraison", f.floraison], ["☀️", "Exposition", f.exposition], ["💧", "Arrosage", f.arrosage], ["🪴", "Sol", f.sol], ["🌱", "Plantation", f.plantation]];
    var labelL = 190 * e, valX = MARGE + 70 + labelL, valL = L - MARGE - valX - 20;
    for (var i = 0; i < lignes.length; i++) {
      police(ctx, 25 * e, "texte", "");
      var hVal = paragraphe(ctx, lignes[i][2], 0, 0, valL, 34 * e, false);
      var ligneH = Math.max(hVal, 34 * e) + 26 * e;
      if (dessiner) {
        ctx.fillStyle = COULEURS.carte;
        arrondi(ctx, MARGE, y, largeurTexte, ligneH, 16); ctx.fill();
        ctx.strokeStyle = COULEURS.carteBord; ctx.lineWidth = 1.5; ctx.stroke();
        police(ctx, 28 * e, "texte", "");
        ctx.fillStyle = COULEURS.texte;
        ctx.fillText(lignes[i][0], MARGE + 22, y + 13 * e + 28 * e);
        ctx.fillStyle = COULEURS.rose;
        police(ctx, 19 * e, "texte", "700");
        ctx.fillText(lignes[i][1].toUpperCase(), MARGE + 70, y + 13 * e + 26 * e);
        ctx.fillStyle = COULEURS.texte;
        police(ctx, 25 * e, "texte", "");
        paragraphe(ctx, lignes[i][2], valX, y + 13 * e + 26 * e, valL, 34 * e, true);
      }
      y += ligneH + 12;
    }
    y += 18;

    // Conseil
    police(ctx, 26 * e, "texte", "");
    var hCons = paragraphe(ctx, f.conseil, 0, 0, largeurTexte - 64, 38 * e, false);
    var consH = hCons + 86 * e;
    if (dessiner) {
      ctx.fillStyle = COULEURS.vertClair;
      arrondi(ctx, MARGE, y, largeurTexte, consH, 18); ctx.fill();
      ctx.fillStyle = COULEURS.vert;
      ctx.fillRect(MARGE, y + 10, 6, consH - 20);
      police(ctx, 25 * e, "texte", "700");
      ctx.fillText("💡 Le petit conseil", MARGE + 32, y + 40 * e);
      ctx.fillStyle = COULEURS.texte;
      police(ctx, 26 * e, "texte", "");
      paragraphe(ctx, f.conseil, MARGE + 32, y + 78 * e, largeurTexte - 64, 38 * e, true);
    }
    y += consH + 28;

    // Langage des fleurs
    police(ctx, 25 * e, "texte", "italic");
    var hSym = paragraphe(ctx, "Dans le langage des fleurs : " + f.symbole, 0, 0, largeurTexte, 36 * e, false);
    if (dessiner) {
      ctx.fillStyle = COULEURS.doux;
      paragraphe(ctx, "Dans le langage des fleurs : " + f.symbole, MARGE, y + 26 * e, largeurTexte, 36 * e, true);
    }
    y += hSym + 20;

    // Pied de page
    if (dessiner) {
      ctx.fillStyle = COULEURS.doux;
      police(ctx, 20, "texte", "");
      ctx.textAlign = "center";
      ctx.fillText("Avec tout mon amour 💕   ·   Pompon 🐰   ·   " + (infos.site || ""), L / 2, H - 40);
      ctx.textAlign = "left";
    }
    return y;
  }

  // Produit la fiche en PNG (Blob). infos : { fleur, numero, date, saint, site }.
  function genererFiche(infos) {
    var polices = ['700 84px "Caveat"', '400 27px "Nunito"', '700 27px "Nunito"', 'italic 400 27px "Nunito"'];
    var attente = document.fonts && document.fonts.load ? Promise.all(polices.map(function (p) { return document.fonts.load(p).catch(function () {}); })) : Promise.resolve();
    return Promise.all([attente, chargerImage(infos.fleur.photo)]).then(function (res) {
      var img = res[1];
      var canvas = document.createElement("canvas");
      canvas.width = L; canvas.height = H;
      var ctx = canvas.getContext("2d");
      ctx.textBaseline = "alphabetic";
      // Réduit un peu le texte si la fiche déborde de la page.
      var echelle = 1;
      for (var i = 0; i < 10; i++) {
        if (composer(ctx, infos, img, echelle, false) <= H - 90) break;
        echelle *= 0.95;
      }
      composer(ctx, infos, img, echelle, true);
      return new Promise(function (ok, ko) {
        canvas.toBlob(function (blob) { blob ? ok(blob) : ko(new Error("Impossible de créer l'image")); }, "image/png");
      });
    });
  }

  window.genererFiche = genererFiche;
})();
