import { api, messageErreur } from "../api.js";
import { echapper, argent } from "../outils.js";

function presentationStatut(statut) {
  const statutsConnus = {
    disponible: { libelle: "Disponible", classe: "succes" },
    loue: { libelle: "Louée", classe: "avertissement" },
    maintenance: { libelle: "Maintenance", classe: "neutre" },
  };
  const presentation = statutsConnus[statut];

  return presentation
    ? `<span class="badge-statut badge-statut--${presentation.classe}">${presentation.libelle}</span>`
    : `<span class="badge-statut badge-statut--neutre">${echapper(statut)}</span>`;
}

export function afficherVoitures(conteneur) {
  let voitures = [];
  let enModification = null;

  conteneur.innerHTML = `
    <section class="entete-tableau entete-page-donnees">
      <div>
        <h1>Voitures</h1>
        <p>Gérez votre flotte, ses tarifs et ses disponibilités.</p>
      </div>
      <button
        type="button"
        id="btn-ajouter-voiture"
        class="bouton-principal bouton-ajout-page"
        aria-controls="panneau-formulaire-voiture"
        aria-expanded="false"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
        Ajouter une voiture
      </button>
    </section>

    <div id="message-voitures" class="message message--erreur message-page-donnees" role="alert" hidden></div>

    <section id="panneau-formulaire-voiture" class="panneau panneau-formulaire-donnees" hidden>
      <div class="entete-formulaire-donnees">
        <h2 id="titre-formulaire">Ajouter une voiture</h2>
        <p>Renseignez les informations du véhicule et sa catégorie.</p>
      </div>
      <form id="formulaire" class="formulaire-donnees">
        <div class="grille-formulaire-donnees grille-formulaire-voiture">
          <label for="voiture-immatriculation">
            <span class="libelle-champ">Immatriculation <span aria-hidden="true">*</span></span>
            <input id="voiture-immatriculation" name="immatriculation" required>
          </label>
          <label for="voiture-marque">
            <span class="libelle-champ">Marque <span aria-hidden="true">*</span></span>
            <input id="voiture-marque" name="marque" required>
          </label>
          <label for="voiture-modele">
            <span class="libelle-champ">Modèle <span aria-hidden="true">*</span></span>
            <input id="voiture-modele" name="modele" required>
          </label>
          <label for="voiture-annee">
            <span class="libelle-champ">Année</span>
            <input id="voiture-annee" name="annee" type="number" min="1990" max="2100">
          </label>
          <label for="voiture-couleur">
            <span class="libelle-champ">Couleur</span>
            <input id="voiture-couleur" name="couleur">
          </label>
          <label for="voiture-carburant">
            <span class="libelle-champ">Carburant</span>
            <select id="voiture-carburant" name="carburant">
              <option value="Essence">Essence</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybride">Hybride</option>
              <option value="Electrique">Électrique</option>
            </select>
          </label>
          <label for="voiture-prix">
            <span class="libelle-champ">Prix par jour <span aria-hidden="true">*</span></span>
            <input id="voiture-prix" name="prix_jour" type="number" step="0.01" min="0" required>
          </label>
          <label for="voiture-statut">
            <span class="libelle-champ">Statut</span>
            <select id="voiture-statut" name="statut">
              <option value="disponible">Disponible</option>
              <option value="loue">Loué</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </label>
          <label for="liste-categories">
            <span class="libelle-champ">Catégorie <span aria-hidden="true">*</span></span>
            <select name="categorie" id="liste-categories" required>
              <option value="">Chargement des catégories…</option>
            </select>
          </label>
        </div>
        <div class="actions-formulaire-donnees">
          <button type="submit" id="btn-valider" class="bouton-principal">Ajouter</button>
          <button type="button" id="btn-annuler" class="bouton-secondaire" hidden>Annuler</button>
        </div>
      </form>
    </section>

    <section class="section-tableau section-page-donnees" aria-labelledby="titre-liste-voitures">
      <div class="entete-section-tableau">
        <div>
          <h2 id="titre-liste-voitures">Parc automobile</h2>
          <p id="nombre-voitures">Chargement des voitures…</p>
        </div>
      </div>
      <div class="tableau-defilant tableau-voitures">
        <table>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Immatriculation</th>
              <th scope="col">Marque</th>
              <th scope="col">Modèle</th>
              <th scope="col">Année</th>
              <th scope="col">Couleur</th>
              <th scope="col">Carburant</th>
              <th scope="col">Prix par jour</th>
              <th scope="col">Statut</th>
              <th scope="col">Catégorie</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody id="corps"></tbody>
        </table>
      </div>
    </section>
  `;

  const formulaire = conteneur.querySelector("#formulaire");
  const panneauFormulaire = conteneur.querySelector("#panneau-formulaire-voiture");
  const titre = conteneur.querySelector("#titre-formulaire");
  const btnAjouter = conteneur.querySelector("#btn-ajouter-voiture");
  const btnValider = conteneur.querySelector("#btn-valider");
  const btnAnnuler = conteneur.querySelector("#btn-annuler");
  const corps = conteneur.querySelector("#corps");
  const listeCategories = conteneur.querySelector("#liste-categories");
  const message = conteneur.querySelector("#message-voitures");
  const nombreVoitures = conteneur.querySelector("#nombre-voitures");

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
    nombreVoitures.textContent = `${voitures.length} voiture${voitures.length > 1 ? "s" : ""}`;

    if (voitures.length === 0) {
      corps.innerHTML = `
        <tr>
          <td class="tableau-vide" colspan="11">
            <div class="etat-vide-donnees">
              <strong>Aucune voiture pour le moment</strong>
              <span>Ajoutez une voiture pour la voir apparaître dans votre parc.</span>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    corps.innerHTML = voitures
      .map(
        (voiture) => `
          <tr>
            <td class="identifiant-donnee">${voiture.id_voiture}</td>
            <td><span class="plaque-immatriculation">${echapper(voiture.immatriculation)}</span></td>
            <td class="nom-donnee">${echapper(voiture.marque)}</td>
            <td class="modele-voiture">${echapper(voiture.modele)}</td>
            <td>${echapper(voiture.annee)}</td>
            <td>${echapper(voiture.couleur)}</td>
            <td>${echapper(voiture.carburant)}</td>
            <td class="tarif-donnee">${argent(voiture.prix_jour)}</td>
            <td>${presentationStatut(voiture.statut)}</td>
            <td>${echapper(voiture.categorie_libelle)}</td>
            <td>
              <div class="actions-ligne-donnee">
                <button type="button" class="bouton-secondaire" data-action="modifier" data-id="${voiture.id_voiture}">Modifier</button>
                <button type="button" class="bouton-danger" data-action="supprimer" data-id="${voiture.id_voiture}">Supprimer</button>
              </div>
            </td>
          </tr>
        `
      )
      .join("");
  }

  async function charger() {
    nombreVoitures.textContent = "Chargement des voitures…";
    corps.innerHTML = `
      <tr>
        <td class="chargement-donnees" colspan="11">
          <span class="indicateur-chargement" aria-hidden="true"></span>
          Chargement des voitures…
        </td>
      </tr>
    `;

    try {
      voitures = await api.lister("/voitures/");
      dessiner();
    } catch (erreur) {
      voitures = [];
      nombreVoitures.textContent = "Les voitures n’ont pas pu être chargées.";
      corps.innerHTML = `
        <tr>
          <td class="tableau-vide" colspan="11">Les données ne sont pas disponibles.</td>
        </tr>
      `;
      afficherMessage(`Erreur lors du chargement des voitures : ${messageErreur(erreur)}`);
    }
  }

  async function chargerCategories() {
    try {
      const categories = await api.lister("/categories/");
      listeCategories.innerHTML =
        `<option value="">-- Choisir une catégorie --</option>` +
        categories
          .map(
            (categorie) =>
              `<option value="${categorie.id_categorie}">${echapper(categorie.libelle)}</option>`
          )
          .join("");
    } catch (erreur) {
      listeCategories.innerHTML = `<option value="">Catégories indisponibles</option>`;
      afficherMessage(`Impossible de charger les catégories : ${messageErreur(erreur)}`);
    }
  }

  function annuler() {
    formulaire.reset();
    enModification = null;
    titre.textContent = "Ajouter une voiture";
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
    titre.textContent = "Ajouter une voiture";
    btnValider.textContent = "Ajouter";
    btnAnnuler.hidden = false;
    ouvrirFormulaire();
    formulaire.elements.immatriculation.focus();
  });

  formulaire.addEventListener("submit", async (e) => {
    e.preventDefault();
    effacerMessage();

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
      afficherMessage(`Enregistrement impossible : ${messageErreur(erreur)}`);
    }
  });

  btnAnnuler.addEventListener("click", annuler);

  corps.addEventListener("click", async (e) => {
    const bouton = e.target.closest("button");
    if (!bouton) return;

    const id = Number(bouton.dataset.id);

    if (bouton.dataset.action === "modifier") {
      const voiture = voitures.find((element) => element.id_voiture === id);
      if (!voiture) return;

      formulaire.elements.immatriculation.value = voiture.immatriculation;
      formulaire.elements.marque.value = voiture.marque;
      formulaire.elements.modele.value = voiture.modele;
      formulaire.elements.annee.value = voiture.annee ?? "";
      formulaire.elements.couleur.value = voiture.couleur ?? "";
      formulaire.elements.carburant.value = voiture.carburant;
      formulaire.elements.prix_jour.value = voiture.prix_jour;
      formulaire.elements.statut.value = voiture.statut;
      formulaire.elements.categorie.value = voiture.categorie;
      enModification = id;
      titre.textContent = "Modifier la voiture";
      btnValider.textContent = "Enregistrer";
      btnAnnuler.hidden = false;
      ouvrirFormulaire();
      formulaire.elements.immatriculation.focus();
    }

    if (bouton.dataset.action === "supprimer") {
      if (!confirm("Supprimer cette voiture ?")) return;
      effacerMessage();
      try {
        await api.supprimer("/voitures/", id);
        await charger();
      } catch (erreur) {
        afficherMessage(`Suppression impossible : ${messageErreur(erreur)}`);
      }
    }
  });

  chargerCategories();
  charger();
}
