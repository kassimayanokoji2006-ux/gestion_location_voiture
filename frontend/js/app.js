import { afficherClients } from "./pages/clients.js";
import { afficherCategories } from "./pages/categories.js";
import { afficherVoitures } from "./pages/voitures.js";
import { afficherReservations } from "./pages/reservation.js";
import { afficherPaiements } from "./pages/paiements.js";
import { afficherDisponibilites } from "./pages/disponibilite.js";
import { afficherTableauDeBord } from "./pages/tableaudebord.js";

const pages = [
  {
    nom: "tableau_de_bord",
    titre: "Tableau de bord",
    afficher: afficherTableauDeBord,
    icone: "M3 3h7v7H3z M14 3h7v4h-7z M14 10h7v11h-7z M3 14h7v7H3z",
  },
  {
    nom: "clients",
    titre: "Clients",
    afficher: afficherClients,
    icone: "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M20 8v6 M23 11h-6",
  },
  {
    nom: "categories",
    titre: "Catégories",
    afficher: afficherCategories,
    icone: "M4 4h7v7H4z M14 4h6v6h-6z M14 13h6v7h-6z M4 14h7v6H4z",
  },
  {
    nom: "voitures",
    titre: "Voitures",
    afficher: afficherVoitures,
    icone: "M3 13l2-6h14l2 6 M5 13h14a2 2 0 0 1 2 2v4h-3v-2H6v2H3v-4a2 2 0 0 1 2-2z M7 10h.01 M17 10h.01",
  },
  {
    nom: "reservations",
    titre: "Réservations",
    afficher: afficherReservations,
    icone: "M5 3v4 M19 3v4 M4 7h16v14H4z M8 11h3 M8 15h8",
  },
  {
    nom: "paiements",
    titre: "Paiements",
    afficher: afficherPaiements,
    icone: "M3 6h18v13H3z M3 10h18 M7 15h4",
  },
  {
    nom: "disponibilites",
    titre: "Disponibilités",
    afficher: afficherDisponibilites,
    icone: "M12 3v3 M12 12l4-2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  },
];

const menu = document.getElementById("menu");
const contenu = document.getElementById("contenu");
const titrePage = document.getElementById("titre-page");
const barreLaterale = document.getElementById("barre-laterale");
const boutonMenuMobile = document.getElementById("bouton-menu-mobile");
const voileMenu = document.querySelector(".voile-menu");
const navigationMobile = window.matchMedia("(max-width: 760px)");

function fermerMenuMobile({ rendreFocus = false } = {}) {
  document.body.classList.remove("menu-mobile-ouvert");
  boutonMenuMobile.setAttribute("aria-expanded", "false");
  boutonMenuMobile.setAttribute("aria-label", "Ouvrir le menu");
  barreLaterale.inert = navigationMobile.matches;

  if (rendreFocus && navigationMobile.matches) {
    boutonMenuMobile.focus();
  }
}

function basculerMenuMobile() {
  const ouvert = boutonMenuMobile.getAttribute("aria-expanded") !== "true";
  document.body.classList.toggle("menu-mobile-ouvert", ouvert);
  boutonMenuMobile.setAttribute("aria-expanded", String(ouvert));
  boutonMenuMobile.setAttribute("aria-label", ouvert ? "Fermer le menu" : "Ouvrir le menu");
  barreLaterale.inert = !ouvert;

  if (ouvert) {
    menu.querySelector("button")?.focus();
  }
}

function ouvrir(nom) {
  const page = pages.find((element) => element.nom === nom);
  if (!page) return;

  contenu.innerHTML = "";
  page.afficher(contenu);
  titrePage.textContent = page.titre;

  for (const bouton of menu.querySelectorAll("button")) {
    const actif = bouton.dataset.page === nom;
    bouton.classList.toggle("actif", actif);
    if (actif) {
      bouton.setAttribute("aria-current", "page");
    } else {
      bouton.removeAttribute("aria-current");
    }
  }

  fermerMenuMobile({ rendreFocus: true });
}

barreLaterale.inert = navigationMobile.matches;
boutonMenuMobile.addEventListener("click", basculerMenuMobile);
voileMenu.addEventListener("click", () => fermerMenuMobile({ rendreFocus: true }));
document.addEventListener("keydown", (evenement) => {
  if (evenement.key === "Escape" && boutonMenuMobile.getAttribute("aria-expanded") === "true") {
    fermerMenuMobile({ rendreFocus: true });
  }
});
navigationMobile.addEventListener("change", () => fermerMenuMobile());

for (const page of pages) {
  const bouton = document.createElement("button");
  bouton.className = "lien-navigation";
  bouton.type = "button";
  bouton.dataset.page = page.nom;

  const icone = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icone.setAttribute("viewBox", "0 0 24 24");
  icone.setAttribute("fill", "none");
  icone.setAttribute("stroke", "currentColor");
  icone.setAttribute("stroke-width", "1.7");
  icone.setAttribute("stroke-linecap", "round");
  icone.setAttribute("stroke-linejoin", "round");
  icone.setAttribute("aria-hidden", "true");

  const chemin = document.createElementNS("http://www.w3.org/2000/svg", "path");
  chemin.setAttribute("d", page.icone);
  icone.appendChild(chemin);

  const libelle = document.createElement("span");
  libelle.textContent = page.titre;

  bouton.append(icone, libelle);
  bouton.addEventListener("click", () => ouvrir(page.nom));
  menu.appendChild(bouton);
}

ouvrir(pages[0].nom);