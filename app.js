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
    // Un petit décalage pour que la suite des fleurs ne soit pas trop prévisible d'une année sur l'autre.
    return fleurs[(idx * 7) % fleurs.length];
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

    function afficherImage(src, secours) {
      img.onload = function () { figure.classList.add("chargee"); credit.textContent = "Photo : Wikipédia"; };
      img.onerror = function () {
        img.onerror = null;
        if (secours && secours !== src) img.src = secours;
      };
      img.src = src;
    }

    // Source 1 : résumé de la page (API REST de Wikipédia).
    function viaRest() {
      var url = "https://fr.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(titre);
      return fetch(url, { headers: { Accept: "application/json" } })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("rest " + r.status)); })
        .then(function (data) {
          var source = data && (data.originalimage || data.thumbnail);
          if (!source || !source.source) throw new Error("pas d'image");
          afficherImage(source.source.replace(/\/\d+px-/, "/900px-"), source.source);
        });
    }

    // Source 2 : API classique de MediaWiki, en secours.
    function viaApi() {
      var url = "https://fr.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail&pithumbsize=900&redirects=1&titles=" + encodeURIComponent(titre);
      return fetch(url)
        .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("api " + r.status)); })
        .then(function (data) {
          var pages = data && data.query && data.query.pages;
          var page = pages && pages[Object.keys(pages)[0]];
          if (!page || !page.thumbnail || !page.thumbnail.source) throw new Error("pas d'image");
          afficherImage(page.thumbnail.source);
        });
    }

    viaRest().catch(viaApi).catch(function () { /* pas de photo, l'emoji reste affiché */ });
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
  }

  document.addEventListener("DOMContentLoaded", init);
})();
