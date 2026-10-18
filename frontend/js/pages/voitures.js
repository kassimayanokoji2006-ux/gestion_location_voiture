import { api, messageErreur } from "../api.js";
import { echapper, argent } from "../outils.js";

export function afficherVoitures(conteneur) {
  let voitures = [];
  let enModification = null;

  conteneur.innerHTML = `
    <h1>Gestion des voitures</h1>

    <form id="formulaire">
      <h2 id="titre-formulaire">Ajouter une voiture</h2>
      <input name="immatriculation" placeholder="Immatriculation" required><br>
      <input name="marque" placeholder="Marque" required><br>
      <input name="modele" placeholder="Modèle" required><br>
      <input name="annee" type="number" min="1990" max="2100" placeholder="Année"><br>
      <input name="couleur" placeholder="Couleur"><br>

      <select name="carburant">
        <option value="Essence">Essence</option>
        <option value="Diesel">Diesel</option>
        <option value="Hybride">Hybride</option>
        <option value="Electrique">Électrique</option>
      </select><br>

      <input name="prix_jour" type="number" step="0.01" min="0" placeholder="Prix par jour" required>

      <br><select name="statut">
        <option value="disponible">Disponible</option>
        <option value="loue">Loué</option>
        <option value="maintenance">Maintenance</option>
      </select><br>

      <select name="categorie" id="liste-categories" required>
        <option value="">-- Choisir une catégorie --</option>
      </select>

      <button type="submit" id="btn-valider">Ajouter</button>
      <button type="button" id="btn-annuler" hidden>Annuler</button>
    </form>

    <table border="1" cellpadding="8">
      <thead>
        <tr>
          <th>ID</th>
          <th>Immatriculation</th>
          <th>Marque</th>
          <th>Modèle</th>
          <th>Année</th>
          <th>Couleur</th>
          <th>Carburant</th>
          <th>Prix/jour</th>
          <th>Statut</th>
          <th>Catégorie</th>
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
  const listeCategories = conteneur.querySelector("#liste-categories");

  function dessiner() {
    corps.innerHTML = voitures
      .map(
        (v) => `
        <tr>
          <td>${v.id_voiture}</td>
          <td>${echapper(v.immatriculation)}</td>
          <td>${echapper(v.marque)}</td>
          <td>${echapper(v.modele)}</td>
          <td>${echapper(v.annee)}</td>
          <td>${echapper(v.couleur)}</td>
          <td>${echapper(v.carburant)}</td>
          <td>${argent(v.prix_jour)}</td>
          <td>${echapper(v.statut)}</td>
          <td>${echapper(v.categorie_libelle)}</td>
          <td>
            <button data-action="modifier" data-id="${v.id_voiture}">Modifier</button>
            <button data-action="supprimer" data-id="${v.id_voiture}">Supprimer</button>
          </td>
        </tr>`
      )
      .join("");
  }

  async function charger() {
    try {
      voitures = await api.lister("/voitures/");
      dessiner();
    } catch (erreur) {
      alert("Erreur : " + messageErreur(erreur));
    }
  }

  async function chargerCategories() {
    try {
      const categories = await api.lister("/categories/");
      listeCategories.innerHTML =
        `<option value="">-- Choisir une catégorie --</option>` +
        categories
          .map(
            (c) =>
              `<option value="${c.id_categorie}">${echapper(c.libelle)}</option>`
          )
          .join("");
    } catch (erreur) {
      alert("Erreur : " + messageErreur(erreur));
    }
  }

  function annuler() {
    formulaire.reset();
    enModification = null;
    titre.textContent = "Ajouter une voiture";
    btnValider.textContent = "Ajouter";
    btnAnnuler.hidden = true;
  }

  formulaire.addEventListener("submit", async (e) => {
    e.preventDefault();

    const donnees = Object.fromEntries(new FormData(formulaire));
    donnees.annee = donnees.annee || null;
    donnees.couleur = donnees.couleur || null;

    try {
      if (enModification) {
        await api.modifier("/voitures/", enModification, donnees);
      } else {
        await api.ajouter("/voitures/", donnees);
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
      const v = voitures.find((x) => x.id_voiture === id);
      formulaire.elements.immatriculation.value = v.immatriculation;
      formulaire.elements.marque.value = v.marque;
      formulaire.elements.modele.value = v.modele;
      formulaire.elements.annee.value = v.annee ?? "";
      formulaire.elements.couleur.value = v.couleur ?? "";
      formulaire.elements.carburant.value = v.carburant;
      formulaire.elements.prix_jour.value = v.prix_jour;
      formulaire.elements.statut.value = v.statut;
      formulaire.elements.categorie.value = v.categorie;
      enModification = id;
      titre.textContent = "Modifier la voiture";
      btnValider.textContent = "Enregistrer";
      btnAnnuler.hidden = false;
    }

    if (bouton.dataset.action === "supprimer") {
      if (!confirm("Supprimer cette voiture ?")) return;
      try {
        await api.supprimer("/voitures/", id);
        await charger();
      } catch (erreur) {
        alert("Suppression impossible : cette voiture a peut-être des réservations.");
      }
    }
  });

  chargerCategories();
  charger();
}