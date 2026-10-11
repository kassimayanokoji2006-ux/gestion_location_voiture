import { api, messageErreur } from "../api.js";
import { echapper, argent } from "../outils.js";

export function afficherCategories(conteneur) {
  let categories = [];
  let enModification = null;

  conteneur.innerHTML = `
    <h1>Gestion des catégories</h1>

    <form id="formulaire">
      <h2 id="titre-formulaire">Ajouter une catégorie</h2>
      <input name="libelle" placeholder="Libellé (ex. SUV)" required>
      <input name="description" placeholder="Description">
      <input name="tarif_base_jour" type="number" step="0.01" min="0" placeholder="Tarif par jour" required>
      <button type="submit" id="btn-valider">Ajouter</button>
      <button type="button" id="btn-annuler" hidden>Annuler</button>
    </form>

    <table border="1" cellpadding="8">
      <thead>
        <tr>
          <th>ID</th>
          <th>Libellé</th>
          <th>Description</th>
          <th>Tarif par jour</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="corps"></tbody>
    </table>
  `;

  const formulaire = conteneur.querySelector("#formulaire");
  const titre = conteneur.querySelector("#titre-formulaire");
  const btnValider = conteneur.querySelector("#btn-valider");
  const btnAnnuler = conteneur.querySelector("#btn-annuler");
  const corps = conteneur.querySelector("#corps");

  function dessiner() {
    corps.innerHTML = categories
      .map(
        (c) => `
        <tr>
          <td>${c.id_categorie}</td>
          <td>${echapper(c.libelle)}</td>
          <td>${echapper(c.description)}</td>
          <td>${argent(c.tarif_base_jour)}</td>
          <td>
            <button data-action="modifier" data-id="${c.id_categorie}">Modifier</button>
            <button data-action="supprimer" data-id="${c.id_categorie}">Supprimer</button>
          </td>
        </tr>`
      )
      .join("");
  }

  async function charger() {
    try {
      categories = await api.lister("/categories/");
      dessiner();
    } catch (erreur) {
      alert("Erreur : " + messageErreur(erreur));
    }
  }

  function annuler() {
    formulaire.reset();
    enModification = null;
    titre.textContent = "Ajouter une catégorie";
    btnValider.textContent = "Ajouter";
    btnAnnuler.hidden = true;
  }

  formulaire.addEventListener("submit", async (e) => {
    e.preventDefault();

    const donnees = Object.fromEntries(new FormData(formulaire));

    try {
      if (enModification) {
        await api.modifier("/categories/", enModification, donnees);
      } else {
        await api.ajouter("/categories/", donnees);
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
      const c = categories.find((x) => x.id_categorie === id);
      formulaire.elements.libelle.value = c.libelle;
      formulaire.elements.description.value = c.description ?? "";
      formulaire.elements.tarif_base_jour.value = c.tarif_base_jour;
      enModification = id;
      titre.textContent = "Modifier la catégorie";
      btnValider.textContent = "Enregistrer";
      btnAnnuler.hidden = false;
    }

    if (bouton.dataset.action === "supprimer") {
      if (!confirm("Supprimer cette catégorie ?")) return;
      try {
        await api.supprimer("/categories/", id);
        await charger();
      } catch (erreur) {
        alert("Suppression impossible : cette catégorie est peut-être utilisée par des voitures.");
      }
    }
  });

  charger();
}
