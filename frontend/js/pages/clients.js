import { api, messageErreur } from "../api.js";
import { echapper } from "../outils.js";

export function afficherClients(conteneur) {
  let clients = [];
  let enModification = null;

  conteneur.innerHTML = `
    <h1>Gestion des clients</h1>

    <form id="formulaire">
      <h2 id="titre-formulaire">Ajouter client</h2>
      <input name="nom" placeholder="Nom" required><br>
      <input name="prenom" placeholder="Prénom" required><br>
      <input name="telephone" placeholder="Téléphone" required><br>
      <input name="email" type="email" placeholder="Email"><br>
      <input name="numero_permis" placeholder="Numéro de permis" required><br>
      <input name="adresse" placeholder="Adresse"><br>
      <button type="submit" id="btn-valider">Ajouter</button>
      <button type="button" id="btn-annuler" hidden>Annuler</button>
    </form>

    <table border="1" cellpadding="8">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nom</th>
          <th>Prénom</th>
          <th>Téléphone</th>
          <th>Email</th>
          <th>Permis</th>
          <th>Adresse</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="corps"></tbody>
    </table>
  `;

  const corps = conteneur.querySelector("#corps");
  const formulaire = conteneur.querySelector("#formulaire");
  const titre = conteneur.querySelector("#titre-formulaire");
  const btnValider = conteneur.querySelector("#btn-valider");
  const btnAnnuler = conteneur.querySelector("#btn-annuler");

  function dessiner() {
    corps.innerHTML = clients
      .map(
        (c) => `
        <tr>
          <td>${c.id_client}</td>
          <td>${echapper(c.nom)}</td>
          <td>${echapper(c.prenom)}</td>
          <td>${echapper(c.telephone)}</td>
          <td>${echapper(c.email)}</td>
          <td>${echapper(c.numero_permis)}</td>
          <td>${echapper(c.adresse)}</td>
          <td>
            <button data-action="modifier" data-id="${c.id_client}">Modifier</button>
            <button data-action="supprimer" data-id="${c.id_client}">Supprimer</button>
          </td>
        </tr>`
      )
      .join("");
  }

  async function charger() {
    try {
      clients = await api.lister("/clients/");
      dessiner();
    } catch (erreur) {
      alert("Erreur : " + messageErreur(erreur));
    }
  }

  function annuler() {
    formulaire.reset();
    enModification = null;
    titre.textContent = "Ajouter un client";
    btnValider.textContent = "Ajouter";
    btnAnnuler.hidden = true;
  }

  formulaire.addEventListener("submit", async (e) => {
    e.preventDefault();

    const donnees = Object.fromEntries(new FormData(formulaire));
    donnees.email = donnees.email || null;
    donnees.adresse = donnees.adresse || null;

    try {
      if (enModification) {
        await api.modifier("/clients/", enModification, donnees);
      } else {
        await api.ajouter("/clients/", donnees);
      }
      annuler();
      await charger();
    } catch (erreur) {
      alert("Erreur : " + messageErreur(erreur));
    }
  });

  btnAnnuler.addEventListener("click", annuler);

  corps.addEventListener("click", async (e) => {
    const bouton = e.target.closest("button");
    if (!bouton) return;

    const id = Number(bouton.dataset.id);

    if (bouton.dataset.action === "modifier") {
      const c = clients.find((x) => x.id_client === id);
      formulaire.elements.nom.value = c.nom;
      formulaire.elements.prenom.value = c.prenom;
      formulaire.elements.telephone.value = c.telephone;
      formulaire.elements.email.value = c.email ?? "";
      formulaire.elements.numero_permis.value = c.numero_permis;
      formulaire.elements.adresse.value = c.adresse ?? "";
      enModification = id;
      titre.textContent = "Modifier le client";
      btnValider.textContent = "Enregistrer";
      btnAnnuler.hidden = false;
    }

    if (bouton.dataset.action === "supprimer") {
      if (!confirm("Supprimer ce client ?")) return;
      try {
        await api.supprimer("/clients/", id);
        await charger();
      } catch (erreur) {
        alert("Suppression impossible : ce client a peut-être des réservations.");
      }
    }
  });

  charger();
}