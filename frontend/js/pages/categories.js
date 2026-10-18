import { api, messageErreur } from "../api.js";
import { echapper, argent } from "../outils.js";

export function afficherCategories(conteneur) {
  let categories = [];
  let enModification = null;

  conteneur.innerHTML = `
    <section class="entete-tableau entete-page-donnees">
      <div>
        <h1>Catégories</h1>
        <p>Organisez les véhicules et leurs tarifs de location par catégorie.</p>
      </div>
      <button
        type="button"
        id="btn-ajouter-categorie"
        class="bouton-principal bouton-ajout-page"
        aria-controls="panneau-formulaire-categorie"
        aria-expanded="false"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
        Ajouter une catégorie
      </button>
    </section>

    <div id="message-categories" class="message message--erreur message-page-donnees" role="alert" hidden></div>

    <section id="panneau-formulaire-categorie" class="panneau panneau-formulaire-donnees" hidden>
      <div class="entete-formulaire-donnees">
        <h2 id="titre-formulaire">Ajouter une catégorie</h2>
        <p>Renseignez le libellé et le tarif journalier de cette catégorie.</p>
      </div>
      <form id="formulaire" class="formulaire-donnees">
        <div class="grille-formulaire-donnees">
          <label for="categorie-libelle">
            <span class="libelle-champ">Libellé <span aria-hidden="true">*</span></span>
            <input id="categorie-libelle" name="libelle" placeholder="Ex. SUV" required>
          </label>
          <label for="categorie-description">
            <span class="libelle-champ">Description</span>
            <input id="categorie-description" name="description" placeholder="Description facultative">
          </label>
          <label for="categorie-tarif">
            <span class="libelle-champ">Tarif de base par jour <span aria-hidden="true">*</span></span>
            <input id="categorie-tarif" name="tarif_base_jour" type="number" step="0.01" min="0" placeholder="0,00" required>
          </label>
        </div>
        <div class="actions-formulaire-donnees">
          <button type="submit" id="btn-valider" class="bouton-principal">Ajouter</button>
          <button type="button" id="btn-annuler" class="bouton-secondaire" hidden>Annuler</button>
        </div>
      </form>
    </section>

    <section class="section-tableau section-page-donnees" aria-labelledby="titre-liste-categories">
      <div class="entete-section-tableau">
        <div>
          <h2 id="titre-liste-categories">Liste des catégories</h2>
          <p id="nombre-categories">Chargement des catégories…</p>
        </div>
      </div>
      <div class="tableau-defilant tableau-categories">
        <table>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Libellé</th>
              <th scope="col">Description</th>
              <th scope="col">Tarif par jour</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody id="corps"></tbody>
        </table>
      </div>
    </section>
  `;

  const corps = conteneur.querySelector("#corps");
  const formulaire = conteneur.querySelector("#formulaire");
  const panneauFormulaire = conteneur.querySelector("#panneau-formulaire-categorie");
  const titre = conteneur.querySelector("#titre-formulaire");
  const btnAjouter = conteneur.querySelector("#btn-ajouter-categorie");
  const btnValider = conteneur.querySelector("#btn-valider");
  const btnAnnuler = conteneur.querySelector("#btn-annuler");
  const message = conteneur.querySelector("#message-categories");
  const nombreCategories = conteneur.querySelector("#nombre-categories");

  function afficherMessage(texte) {
    message.textContent = texte;
    message.hidden = false;
  }

  function effacerMessage() {
    message.textContent = "";
    message.hidden = true;
  }

  function ouvrirFormulaire() {
    effacerMessage();
    panneauFormulaire.hidden = false;
    btnAjouter.hidden = true;
    btnAjouter.setAttribute("aria-expanded", "true");
  }

  function dessiner() {
    nombreCategories.textContent = `${categories.length} catégorie${categories.length > 1 ? "s" : ""}`;

    if (categories.length === 0) {
      corps.innerHTML = `
        <tr>
          <td class="tableau-vide" colspan="5">
            <div class="etat-vide-donnees">
              <strong>Aucune catégorie pour le moment</strong>
              <span>Ajoutez une catégorie pour l’associer à vos voitures.</span>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    corps.innerHTML = categories
      .map(
        (categorie) => `
          <tr>
            <td class="identifiant-donnee">${categorie.id_categorie}</td>
            <td class="nom-donnee">${echapper(categorie.libelle)}</td>
            <td>${echapper(categorie.description)}</td>
            <td class="tarif-donnee">${argent(categorie.tarif_base_jour)}</td>
            <td>
              <div class="actions-ligne-donnee">
                <button type="button" class="bouton-secondaire" data-action="modifier" data-id="${categorie.id_categorie}">Modifier</button>
                <button type="button" class="bouton-danger" data-action="supprimer" data-id="${categorie.id_categorie}">Supprimer</button>
              </div>
            </td>
          </tr>
        `
      )
      .join("");
  }

  async function charger() {
    nombreCategories.textContent = "Chargement des catégories…";
    corps.innerHTML = `
      <tr>
        <td class="chargement-donnees" colspan="5">
          <span class="indicateur-chargement" aria-hidden="true"></span>
          Chargement des catégories…
        </td>
      </tr>
    `;

    try {
      categories = await api.lister("/categories/");
      dessiner();
    } catch (erreur) {
      categories = [];
      nombreCategories.textContent = "Les catégories n’ont pas pu être chargées.";
      corps.innerHTML = `
        <tr>
          <td class="tableau-vide" colspan="5">Les données ne sont pas disponibles.</td>
        </tr>
      `;
      afficherMessage(`Erreur lors du chargement : ${messageErreur(erreur)}`);
    }
  }

  function annuler() {
    formulaire.reset();
    enModification = null;
    titre.textContent = "Ajouter une catégorie";
    btnValider.textContent = "Ajouter";
    panneauFormulaire.hidden = true;
    btnAjouter.hidden = false;
    btnAjouter.setAttribute("aria-expanded", "false");
    effacerMessage();
    btnAjouter.focus();
  }

  btnAjouter.addEventListener("click", () => {
    formulaire.reset();
    enModification = null;
    titre.textContent = "Ajouter une catégorie";
    btnValider.textContent = "Ajouter";
    btnAnnuler.hidden = false;
    ouvrirFormulaire();
    formulaire.elements.libelle.focus();
  });

  formulaire.addEventListener("submit", async (e) => {
    e.preventDefault();
    effacerMessage();

    const donnees = Object.fromEntries(new FormData(formulaire));
    donnees.description = donnees.description || null;

    try {
      if (enModification) {
        await api.modifier("/categories/", enModification, donnees);
      } else {
        await api.ajouter("/categories/", donnees);
      }
      annuler();
      await charger();
    } catch (erreur) {
      afficherMessage(`Enregistrement impossible : ${messageErreur(erreur)}`);
    }
  });

  btnAnnuler.addEventListener("click", annuler);

  corps.addEventListener("click", async (e) => {
    const bouton = e.target.closest("button");
    if (!bouton) return;

    const id = Number(bouton.dataset.id);

    if (bouton.dataset.action === "modifier") {
      const categorie = categories.find((element) => element.id_categorie === id);
      if (!categorie) return;

      formulaire.elements.libelle.value = categorie.libelle;
      formulaire.elements.description.value = categorie.description ?? "";
      formulaire.elements.tarif_base_jour.value = categorie.tarif_base_jour;
      enModification = id;
      titre.textContent = "Modifier la catégorie";
      btnValider.textContent = "Enregistrer";
      btnAnnuler.hidden = false;
      ouvrirFormulaire();
      formulaire.elements.libelle.focus();
    }

    if (bouton.dataset.action === "supprimer") {
      if (!confirm("Supprimer cette catégorie ?")) return;
      effacerMessage();
      try {
        await api.supprimer("/categories/", id);
        await charger();
      } catch (erreur) {
        afficherMessage(`Suppression impossible : ${messageErreur(erreur)}`);
      }
    }
  });

  charger();
}
