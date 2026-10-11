import { afficherClients } from "./pages/clients.js";

const pages = {
  clients: { titre: "Clients", afficher: afficherClients },
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