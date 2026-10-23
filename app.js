// Logique de la page : choisit le message et la fleur du jour, et remplit la page.
(function () {
  "use strict";

  // Date de départ du calendrier. Le jour 0 affiche la première fleur et le premier message.
  var DATE_DEPART = new Date(2026, 0, 1); // 1er janvier 2026

  function aujourdhui() {
    // Permet de tester une autre date : index.html?date=2026-05-31
    var param = new URLSearchParams(window.location.search).get("date");
    if (param) {
      var parts = param.split("-").map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function indexDuJour(date) {
    var ms = date - DATE_DEPART;
    var jours = Math.round(ms / 86400000);
    return jours < 0 ? 0 : jours;
  }

  // Fête des mères en France : dernier dimanche de mai, sauf si c'est la Pentecôte (alors premier dimanche de juin).
  function estFeteDesMeres(date) {
    var annee = date.getFullYear();
    var dernierDimancheMai = new Date(annee, 4, 31);
    while (dernierDimancheMai.getDay() !== 0) dernierDimancheMai.setDate(dernierDimancheMai.getDate() - 1);
    var pentecote = new Date(paques(annee).getTime() + 49 * 86400000);
    var fete = dernierDimancheMai;
    if (pentecote.getMonth() === 4 && pentecote.getDate() === dernierDimancheMai.getDate()) {
      fete = new Date(annee, 5, 1);
      while (fete.getDay() !== 0) fete.setDate(fete.getDate() + 1);
    }
    return fete.getMonth() === date.getMonth() && fete.getDate() === date.getDate();
  }

  // Algorithme de Meeus pour la date de Pâques.
  function paques(annee) {
    var a = annee % 19, b = Math.floor(annee / 100), c = annee % 100;
    var d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var mois = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    var jour = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(annee, mois, jour);
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function messageDuJour(date, idx) {
    if (estFeteDesMeres(date) && window.MESSAGE_FETE_DES_MERES) return window.MESSAGE_FETE_DES_MERES;
    var cle = pad(date.getMonth() + 1) + "-" + pad(date.getDate());
    var speciaux = window.MESSAGES_SPECIAUX || {};
    if (speciaux[cle]) return speciaux[cle];
    var messages = window.MESSAGES;
    return messages[idx % messages.length];
  }

  function fleurDuJour(idx) {
    var fleurs = window.FLEURS;
    // Jusqu'au 13 octobre 2026 (jour 285), le site tournait sur les 70 premières fleurs : on garde le même
    // ordre pour ces jours-là. Ensuite, on parcourt toute la liste avec un pas et un décalage choisis pour
    // ne pas revoir trop vite les fleurs des jours précédents.
    var PREMIERE_LISTE = 70, BASCULE = 285, DECALAGE = 3, PAS = 7;
    if (idx <= BASCULE) return fleurs[(idx * 7) % PREMIERE_LISTE];
    return fleurs[(DECALAGE + (idx - BASCULE) * PAS) % fleurs.length];
  }

  // Le saint du jour, d'après data/saints.js.
  function saintDuJour(date) {
    var mois = window.SAINTS && window.SAINTS[date.getMonth() + 1];
    var entree = mois && mois[date.getDate() - 1];
    if (!entree) return null;
    if (entree.charAt(0) === "*") return { fete: entree.slice(1) };
    return { prenom: entree };
  }

  function texteSaint(saint) {
    if (!saint) return "";
    if (saint.fete) return "🎀 Aujourd'hui, c'est " + saint.fete + " !";
    return "🎀 Bonne fête aux " + saint.prenom + " !";
  }

  function formatDate(date) {
    try {
      var d = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      return d.charAt(0).toUpperCase() + d.slice(1);
    } catch (e) {
      return date.toLocaleDateString();
    }
  }

  function texte(id, valeur) {
    var el = document.getElementById(id);
    if (el) el.textContent = valeur;
  }

  function chargerPhoto(fleur) {
    var figure = document.getElementById("fleur-photo");
    var img = document.getElementById("fleur-image");
    var credit = document.getElementById("fleur-credit");
    document.getElementById("photo-placeholder").textContent = fleur.emoji;
    img.alt = fleur.nom;

    var titre = fleur.wiki.replace(/ /g, "_");

    function montrerCredit(fichier) {
      credit.textContent = "";
      var texte = "Photo : Wikimedia Commons";
      if (fichier) {
        var lien = document.createElement("a");
        lien.href = "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(fichier);
        lien.target = "_blank";
        lien.rel = "noopener";
        lien.textContent = texte;
        credit.appendChild(lien);
      } else {
        credit.textContent = texte;
      }
    }

    function afficherImage(src, fichier, sinon) {
      img.onload = function () { figure.classList.add("chargee"); montrerCredit(fichier); };
      img.onerror = function () { img.onerror = null; if (sinon) sinon(); };
      img.src = src;
    }

    // Source de secours : la photo de la page Wikipédia, via l'API de MediaWiki.
    function viaWikipedia() {
      var url = "https://fr.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail|name&pithumbsize=640&redirects=1&titles=" + encodeURIComponent(titre);
      fetch(url)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          var pages = data && data.query && data.query.pages;
          var page = pages && pages[Object.keys(pages)[0]];
          if (page && page.thumbnail && page.thumbnail.source) afficherImage(page.thumbnail.source, page.pageimage);
        })
        .catch(function () { /* pas de photo, l'emoji reste affiché */ });
    }

    // Source principale : la photo embarquée avec le site.
    if (fleur.photo) afficherImage(fleur.photo, fleur.credit, viaWikipedia);
    else viaWikipedia();
  }

  function afficherFleur(fleur) {
    texte("fleur-nom", fleur.nom);
    texte("fleur-latin", fleur.latin);
    texte("fleur-description", fleur.description);
    texte("fleur-etymologie", fleur.etymologie);
    texte("fleur-floraison", fleur.floraison);
    texte("fleur-exposition", fleur.exposition);
    texte("fleur-arrosage", fleur.arrosage);
    texte("fleur-sol", fleur.sol);
    texte("fleur-plantation", fleur.plantation);
    texte("fleur-conseil", fleur.conseil);
    texte("fleur-symbole", fleur.symbole);
    var lien = document.getElementById("fleur-lien");
    lien.href = "https://fr.wikipedia.org/wiki/" + encodeURIComponent(fleur.wiki.replace(/ /g, "_"));
    chargerPhoto(fleur);
  }

  // --- Pompon, le lapin qui présente les fleurs ---
  function nomAvecArticle(fleur) {
    var nom = fleur.nom.replace(/\s*\(.*\)$/, "");
    if (/^[aeiouyhéèêœ]/i.test(nom)) return "l'" + nom.charAt(0).toLowerCase() + nom.slice(1);
    return (fleur.genre === "m" ? "le " : "la ") + nom.charAt(0).toLowerCase() + nom.slice(1);
  }

  function minuscule(texte) { return texte.charAt(0).toLowerCase() + texte.slice(1); }

  function premierePhrase(texte) {
    var m = texte.match(/^[^.!?]+[.!?]/);
    return m ? m[0] : texte;
  }

  function mascotte(fleur, boutonFleur, saint) {
    var el = document.getElementById("mascotte");
    var bulle = document.getElementById("bulle");
    if (!el || !bulle) return;

    var minuteur = null;
    var file = [];

    function dire(texte, duree) {
      bulle.textContent = texte;
      bulle.classList.add("visible");
      clearTimeout(minuteur);
      minuteur = setTimeout(function () { bulle.classList.remove("visible"); }, duree || 6000);
    }

    function animer(classe) {
      el.classList.remove(classe);
      void el.offsetWidth; // relance l'animation
      el.classList.add(classe);
    }

    el.addEventListener("animationend", function (e) {
      if (e.animationName === "saute") el.classList.remove("saute");
      if (e.animationName === "coucou") el.classList.remove("coucou");
    });

    // Fait défiler une série de phrases, l'une après l'autre.
    function raconter(phrases, pause) {
      file = phrases.slice();
      clearTimeout(minuteur);
      (function suivante() {
        if (!file.length) { minuteur = setTimeout(function () { bulle.classList.remove("visible"); }, pause); return; }
        bulle.textContent = file.shift();
        bulle.classList.add("visible");
        minuteur = setTimeout(suivante, pause);
      })();
    }

    var pronom = fleur.genre === "m" ? "Il" : "Elle";
    var article = nomAvecArticle(fleur);
    var presentation = [
      "Aujourd'hui, je te présente " + article + " ! 🌸",
      "Floraison : " + minuscule(fleur.floraison) + ".",
      pronom + " aime : " + minuscule(fleur.exposition) + ".",
      "Pour l'arrosage : " + minuscule(fleur.arrosage) + ".",
      "Mon petit conseil : " + fleur.conseil,
      "Tu savais ? " + premierePhrase(fleur.etymologie),
    ];

    var bavardages = [
      "Tu es la meilleure maman du monde ! 💕",
      "Moi aussi je t'aime fort !",
      "J'ai planté une carotte à côté de " + article + "… chut !",
      "Tu savais ? " + premierePhrase(fleur.etymologie),
      "Dans le langage des fleurs, " + article + ", c'est : " + minuscule(fleur.symbole) + ".",
      "Mon conseil du jour : " + fleur.conseil,
      "Un câlin ? Moi je dis oui ! 🤗",
      "Demain, je t'en présente une nouvelle. Promis !",
      "Je surveille ton jardin, ne t'inquiète pas. 🥕",
      "Je trouve que tu as le plus beau jardin du monde.",
    ];
    var dernier = -1;

    // Arrivée : petit coucou.
    setTimeout(function () {
      animer("coucou");
      var accueil = ["Coucou ! Moi c'est Pompon 🐰"];
      if (saint && saint.prenom) accueil.push("Et bonne fête à tous les " + saint.prenom + " ! 🎉");
      else if (saint && saint.fete) accueil.push("Aujourd'hui, c'est " + saint.fete + " ! 🎉");
      accueil.push("Clique sur le bouton, j'ai une fleur à te montrer !");
      raconter(accueil, 4500);
    }, 1300);

    // Quand la fleur apparaît : il saute et la présente.
    boutonFleur.addEventListener("click", function () {
      animer("saute");
      setTimeout(function () { raconter(presentation, 7000); }, 500);
    });

    // Quand on clique sur lui : il saute et bavarde.
    el.addEventListener("click", function () {
      animer("saute");
      var i;
      do { i = Math.floor(Math.random() * bavardages.length); } while (i === dernier && bavardages.length > 1);
      dernier = i;
      file = [];
      dire(bavardages[i], 7000);
    });
  }

  // --- Les fiches à télécharger ---
  var PREMIER_JOUR = 278; // 6 octobre 2026, jour où le site a été offert : fiche n° 1
  var SITE = "scouteure.github.io/Appli-maman";

  function dateDepuisIndex(idx) { return new Date(2026, 0, 1 + idx); }

  // Nom de fichier sans accent ni caractère spécial, pour que tous les navigateurs l'acceptent tel quel.
  function nomFichier(infos) {
    var d = infos.dateObj;
    var iso = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    var nom = infos.fleur.nom.replace(/œ/g, "oe").replace(/Œ/g, "Oe").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 ()'-]/g, "");
    var numero = (infos.numero < 10 ? "00" : infos.numero < 100 ? "0" : "") + infos.numero;
    return iso + " - Fiche " + numero + " - " + nom + ".png";
  }

  function infosFiche(idx) {
    var d = dateDepuisIndex(idx);
    var saint = saintDuJour(d);
    return {
      fleur: fleurDuJour(idx),
      numero: idx - PREMIER_JOUR + 1,
      dateObj: d,
      date: formatDate(d),
      saint: saint ? texteSaint(saint).replace(/^🎀 /, "") : "",
      site: SITE,
    };
  }

  // Enregistre un fichier : via la capacité « downloads » dans l'Artifact claude.ai, sinon par un lien de téléchargement.
  function enregistrer(blob, nom) {
    var capacite = window.claude && typeof window.claude.use === "function" ? window.claude.use("downloads").catch(function () { return null; }) : Promise.resolve(null);
    return capacite.then(function (downloads) {
      if (downloads && downloads.save) return downloads.save({ filename: nom, data: blob });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = nom;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { a.remove(); URL.revokeObjectURL(url); }, 10000);
    });
  }

  function telechargerFiche(idx, bouton, etat) {
    var infos = infosFiche(idx);
    if (bouton) bouton.disabled = true;
    if (etat) etat.textContent = "Préparation de la fiche…";
    return window.genererFiche(infos)
      .then(function (blob) { return enregistrer(blob, nomFichier(infos)); })
      .then(function () { if (etat) etat.textContent = "C'est prêt ! Fiche n°" + infos.numero + " : " + infos.fleur.nom + " 🌸"; })
      .catch(function (e) { if (etat) etat.textContent = e && e.code === "declined" ? "Téléchargement annulé." : "Oups, la fiche n'a pas pu être créée. Réessaie dans un instant."; })
      .then(function () { if (bouton) bouton.disabled = false; });
  }

  function chargerScript(src) {
    return new Promise(function (ok, ko) {
      var s = document.createElement("script");
      s.src = src; s.onload = ok; s.onerror = function () { ko(new Error("script")); };
      document.head.appendChild(s);
    });
  }

  function toutTelecharger(idxMax, bouton, etat) {
    bouton.disabled = true;
    etat.textContent = "Préparation du dossier…";
    var promesse = window.JSZip ? Promise.resolve() : chargerScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");
    return promesse.then(function () {
      var zip = new window.JSZip();
      var dossier = zip.folder("Fiches fleurs");
      var liste = [];
      for (var i = PREMIER_JOUR; i <= idxMax; i++) liste.push(i);
      var n = 0;
      return liste.reduce(function (suite, idx) {
        return suite.then(function () {
          var infos = infosFiche(idx);
          n++;
          etat.textContent = "Fiche " + n + " sur " + liste.length + " : " + infos.fleur.nom + "…";
          return window.genererFiche(infos).then(function (blob) { dossier.file(nomFichier(infos), blob); });
        });
      }, Promise.resolve()).then(function () {
        etat.textContent = "Compression du dossier…";
        return zip.generateAsync({ type: "blob" });
      });
    })
      .then(function (blob) { return enregistrer(blob, "Fiches fleurs - " + liste_date() + ".zip"); })
      .then(function () { etat.textContent = "C'est prêt ! Toutes les fiches sont dans le dossier zip 📦"; })
      .catch(function (e) { etat.textContent = e && e.code === "declined" ? "Téléchargement annulé." : "Oups, le dossier n'a pas pu être créé."; })
      .then(function () { bouton.disabled = false; });

    function liste_date() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  }

  function dateCourte(d) {
    try { return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }); } catch (e) { return d.toLocaleDateString(); }
  }

  function construireArchives(idxAujourdhui) {
    var section = document.getElementById("archives-section");
    var liste = document.getElementById("liste-fiches");
    if (!section || !liste || !window.genererFiche) return;
    for (var idx = idxAujourdhui; idx >= PREMIER_JOUR; idx--) {
      (function (idx) {
        var infos = infosFiche(idx);
        var li = document.createElement("li");
        var num = document.createElement("span"); num.className = "fiche-num"; num.textContent = "n°" + infos.numero;
        var date = document.createElement("span"); date.className = "fiche-date"; date.textContent = dateCourte(infos.dateObj);
        var nom = document.createElement("span"); nom.className = "fiche-nom"; nom.textContent = infos.fleur.emoji + " " + infos.fleur.nom + (idx === idxAujourdhui ? " (aujourd'hui)" : "");
        var bouton = document.createElement("button"); bouton.type = "button"; bouton.textContent = "📄 Télécharger";
        bouton.addEventListener("click", function () {
          bouton.textContent = "⏳ Préparation…";
          telechargerFiche(idx, bouton, null).then(function () { bouton.textContent = "✅ Téléchargée"; setTimeout(function () { bouton.textContent = "📄 Télécharger"; }, 4000); });
        });
        li.appendChild(num); li.appendChild(date); li.appendChild(nom); li.appendChild(bouton);
        liste.appendChild(li);
      })(idx);
    }
    var zipBouton = document.getElementById("bouton-zip");
    var zipEtat = document.getElementById("zip-etat");
    if (zipBouton) zipBouton.addEventListener("click", function () { toutTelecharger(idxAujourdhui, zipBouton, zipEtat); });
    section.classList.remove("cachee");
    section.setAttribute("aria-hidden", "false");
  }

  function petales() {
    var conteneur = document.querySelector(".petales");
    if (!conteneur) return;
    var symboles = ["🌸", "🌷", "💮", "🌺", "🩷"];
    for (var i = 0; i < 14; i++) {
      var p = document.createElement("span");
      p.className = "petale";
      p.textContent = symboles[i % symboles.length];
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDuration = 10 + Math.random() * 12 + "s";
      p.style.animationDelay = -Math.random() * 20 + "s";
      p.style.fontSize = 0.9 + Math.random() * 1 + "rem";
      conteneur.appendChild(p);
    }
  }

  function init() {
    var date = aujourdhui();
    var idx = indexDuJour(date);

    texte("date-du-jour", formatDate(date));
    var saint = saintDuJour(date);
    texte("saint-du-jour", texteSaint(saint));
    texte("message-du-jour", messageDuJour(date, idx));

    var fleur = fleurDuJour(idx);
    afficherFleur(fleur);

    var bouton = document.getElementById("bouton-fleur");
    var section = document.getElementById("fleur-section");
    bouton.addEventListener("click", function () {
      section.classList.remove("cachee");
      section.setAttribute("aria-hidden", "false");
      bouton.disabled = true;
      bouton.textContent = "🌸 Bonne lecture !";
      setTimeout(function () { section.scrollIntoView({ behavior: "smooth", block: "start" }); }, 50);
    });

    petales();
    mascotte(fleur, bouton, saint);

    var boutonFiche = document.getElementById("bouton-fiche");
    if (boutonFiche && window.genererFiche) {
      boutonFiche.addEventListener("click", function () { telechargerFiche(idx, boutonFiche, document.getElementById("fiche-etat")); });
    } else if (boutonFiche) {
      boutonFiche.parentNode.style.display = "none";
    }
    construireArchives(idx);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
