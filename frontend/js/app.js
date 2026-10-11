import { afficherClients } from "./pages/clients.js";
import { afficherCategories } from "./pages/categories.js";
import { afficherVoitures } from "./pages/voitures.js";
import { afficherReservations } from "./pages/reservation.js";
const pages = {
    clients: { titre: "Clients", afficher: afficherClients },
    categories: { titre: "Catégories", afficher: afficherCategories },
    voitures: { titre: "Voitures", afficher: afficherVoitures},
    reservations: { titre: "Réservations", afficher: afficherReservations },
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

ouvrir("clients");