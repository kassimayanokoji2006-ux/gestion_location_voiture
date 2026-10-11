import { afficherTableauDeBord } from "./pages/tableau-de-bord.js";
import { afficherClients } from "./pages/clients.js";
import { afficherCategories } from "./pages/categories.js";
import { afficherVoitures } from "./pages/voitures.js";
import { afficherDisponibilites } from "./pages/disponibilites.js";
import { afficherReservations } from "./pages/reservations.js";
import { afficherPaiements } from "./pages/paiements.js";

const pages = {
  tableau: { titre: "Tableau de bord", afficher: afficherTableauDeBord },
  clients: { titre: "Clients", afficher: afficherClients },
  categories: { titre: "Catégories", afficher: afficherCategories },
  voitures: { titre: "Voitures", afficher: afficherVoitures },
  disponibilites: { titre: "Disponibilités", afficher: afficherDisponibilites },
  reservations: { titre: "Réservations", afficher: afficherReservations },
  paiements: { titre: "Paiements", afficher: afficherPaiements },
};

const menu = document.getElementById("menu");
const contenu = document.getElementById("contenu");

function ouvrir(nom) {
  contenu.innerHTML = "";
  pages[nom].afficher(contenu);
}

for (const nom in pages) {
  const bouton = document.createElement("button");
  bouton.textContent = pages[nom].titre;
  bouton.addEventListener("click", () => ouvrir(nom));
  menu.appendChild(bouton);
}

ouvrir("tableau");
