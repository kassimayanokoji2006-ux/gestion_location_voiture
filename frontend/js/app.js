import { afficherClients } from "./pages/clients.js";
import { afficherCategories } from "./pages/categories.js";
import { afficherVoitures } from "./pages/voitures.js";
import { afficherReservations } from "./pages/reservation.js";
import { afficherPaiements } from "./pages/paiements.js";
import { afficherDisponibilites } from "./pages/disponibilite.js";
import { afficherTableauDeBord } from "./pages/tableaudebord.js";
import { afficherVoalohany} from "./pages/voalohany.js"



const pages = {
    clients: { titre: "Clients", afficher: afficherClients },
    categories: { titre: "Catégories", afficher: afficherCategories },
    voitures: { titre: "Voitures", afficher: afficherVoitures},
    reservations: { titre: "Réservations", afficher: afficherReservations },
    paiements: { titre: "Paiements", afficher: afficherPaiements },
    disponibilites: { titre: "Disponibilités", afficher: afficherDisponibilites },
    tableau_de_bord: { titre: "Tableau de bord", afficher: afficherTableauDeBord },
    voalohany: {titre: "hito"}
};

const menu = document.getElementById("menu");
const contenu = document.getElementById("contenu");

function ouvrir(nom) {
  contenu.innerHTML = "";
  pages[nom].afficher(contenu);

  for (const bouton of menu.querySelectorAll("button")) {
    const actif = bouton.dataset.page === nom;
    bouton.classList.toggle("actif", actif);
    if (actif) {
      bouton.setAttribute("aria-current", "page");
    } else {
      bouton.removeAttribute("aria-current");
    }
  }
}

for (const nom in pages) {
  const bouton = document.createElement("button");
  bouton.className = "lien-navigation";
  bouton.dataset.page = nom;
  bouton.textContent = pages[nom].titre;
  bouton.addEventListener("click", () => ouvrir(nom));
  menu.appendChild(bouton);
}

ouvrir("tableau_de_bord");