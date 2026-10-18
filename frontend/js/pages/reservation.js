import { api, messageErreur } from "../api.js";
import { echapper, argent } from "../outils.js";

function badgeStatutReservation(statut) {
  const statuts = {
    en_attente: { libelle: "En attente", classe: "avertissement" },
    confirmee: { libelle: "Confirmée", classe: "succes" },
    terminee: { libelle: "Terminée", classe: "neutre" },
    annulee: { libelle: "Annulée", classe: "danger" },
  };
  const presentation = statuts[statut];

  return presentation
    ? `<span class="badge-statut badge-statut--${presentation.classe}">${presentation.libelle}</span>`
    : `<span class="badge-statut badge-statut--neutre">${echapper(statut)}</span>`;
}

export function afficherReservations(conteneur) {
  let reservations = [];
  let voitures = [];
  let enModification = null;

  conteneur.innerHTML = `
    <section class="entete-tableau entete-page-donnees">
      <div>
        <h1>Réservations</h1>
        <p>Consultez et gérez les périodes de location de votre flotte.</p>
      </div>
      <button
        type="button"
        id="btn-ajouter-reservation"
        class="bouton-principal bouton-ajout-page"
        aria-controls="panneau-formulaire-reservation"
        aria-expanded="false"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
        Nouvelle réservation
      </button>
    </section>

    <div id="message-reservations" class="message message--erreur message-page-donnees" role="alert" hidden></div>

    <section id="panneau-formulaire-reservation" class="panneau panneau-formulaire-donnees" hidden>
      <div class="entete-formulaire-donnees">
        <h2 id="titre-formulaire">Nouvelle réservation</h2>
        <p>Sélectionnez un client, un véhicule et les dates de location.</p>
      </div>
      <form id="formulaire" class="formulaire-donnees">
        <div class="grille-formulaire-donnees">
          <label for="liste-clients">
            <span class="libelle-champ">Client <span aria-hidden="true">*</span></span>
            <select name="client" id="liste-clients" required>
              <option value="">Chargement des clients…</option>
            </select>
          </label>
          <label for="liste-voitures">
            <span class="libelle-champ">Voiture <span aria-hidden="true">*</span></span>
            <select name="voiture" id="liste-voitures" required>
              <option value="">Chargement des voitures…</option>
            </select>
          </label>
          <label for="reservation-date-debut">
            <span class="libelle-champ">Date de début <span aria-hidden="true">*</span></span>
            <input id="reservation-date-debut" name="date_debut" type="date" required>
          </label>
          <label for="reservation-date-fin">
            <span class="libelle-champ">Date de fin <span aria-hidden="true">*</span></span>
            <input id="reservation-date-fin" name="date_fin" type="date" required>
          </label>
          <label for="reservation-statut">
            <span class="libelle-champ">Statut</span>
            <select id="reservation-statut" name="statut">
              <option value="en_attente">En attente</option>
              <option value="confirmee">Confirmée</option>
              <option value="terminee">Terminée</option>
              <option value="annulee">Annulée</option>
            </select>
          </label>
        </div>
        <p id="estimation" class="estimation-reservation" hidden></p>
        <div class="actions-formulaire-donnees">
          <button type="submit" id="btn-valider" class="bouton-principal">Réserver</button>
          <button type="button" id="btn-annuler" class="bouton-secondaire" hidden>Annuler</button>
        </div>
      </form>
    </section>

    <section class="section-tableau section-page-donnees" aria-labelledby="titre-liste-reservations">
      <div class="entete-section-tableau">
        <div>
          <h2 id="titre-liste-reservations">Liste des réservations</h2>
          <p id="nombre-reservations">Chargement des réservations…</p>
        </div>
      </div>
      <div class="tableau-defilant tableau-reservations">
        <table>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Client</th>
              <th scope="col">Voiture</th>
              <th scope="col">Date de début</th>
              <th scope="col">Date de fin</th>
              <th scope="col">Statut</th>
              <th scope="col">Montant total</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody id="corps"></tbody>
        </table>
      </div>
    </section>
  `;

  const formulaire = conteneur.querySelector("#formulaire");
  const panneauFormulaire = conteneur.querySelector("#panneau-formulaire-reservation");
  const titre = conteneur.querySelector("#titre-formulaire");
  const btnAjouter = conteneur.querySelector("#btn-ajouter-reservation");
  const btnValider = conteneur.querySelector("#btn-valider");
  const btnAnnuler = conteneur.querySelector("#btn-annuler");
  const corps = conteneur.querySelector("#corps");
  const listeClients = conteneur.querySelector("#liste-clients");
  const listeVoitures = conteneur.querySelector("#liste-voitures");
  const estimation = conteneur.querySelector("#estimation");
  const message = conteneur.querySelector("#message-reservations");
  const nombreReservations = conteneur.querySelector("#nombre-reservations");

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
    nombreReservations.textContent = `${reservations.length} réservation${reservations.length > 1 ? "s" : ""}`;

    if (reservations.length === 0) {
      corps.innerHTML = `
        <tr>
          <td class="tableau-vide" colspan="8">
            <div class="etat-vide-donnees">
              <strong>Aucune réservation pour le moment</strong>
              <span>Créez une réservation pour la voir apparaître dans cette liste.</span>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    corps.innerHTML = reservations
      .map(
        (reservation) => `
          <tr>
            <td class="identifiant-donnee">${reservation.id_reservation}</td>
            <td class="nom-donnee">${echapper(reservation.client_nom)}</td>
            <td>${echapper(reservation.voiture_nom)}</td>
            <td class="date-reservation">${echapper(reservation.date_debut)}</td>
            <td class="date-reservation">${echapper(reservation.date_fin)}</td>
            <td>${badgeStatutReservation(reservation.statut)}</td>
            <td class="tarif-donnee">${argent(reservation.montant_total)}</td>
            <td>
              <div class="actions-ligne-donnee">
                <button type="button" class="bouton-secondaire" data-action="modifier" data-id="${reservation.id_reservation}">Modifier</button>
                <button type="button" class="bouton-danger" data-action="supprimer" data-id="${reservation.id_reservation}">Supprimer</button>
              </div>
            </td>
          </tr>
        `
      )
      .join("");
  }

  async function charger() {
    nombreReservations.textContent = "Chargement des réservations…";
    corps.innerHTML = `
      <tr>
        <td class="chargement-donnees" colspan="8">
          <span class="indicateur-chargement" aria-hidden="true"></span>
          Chargement des réservations…
        </td>
      </tr>
    `;

    try {
      reservations = await api.lister("/reservations/");
      dessiner();
    } catch (erreur) {
      reservations = [];
      nombreReservations.textContent = "Les réservations n’ont pas pu être chargées.";
      corps.innerHTML = `<tr><td class="tableau-vide" colspan="8">Les données ne sont pas disponibles.</td></tr>`;
      afficherMessage(`Erreur lors du chargement des réservations : ${messageErreur(erreur)}`);
    }
  }

  async function chargerListes() {
    try {
      const clients = await api.lister("/clients/");
      voitures = await api.lister("/voitures/");

      listeClients.innerHTML =
        `<option value="">-- Choisir un client --</option>` +
        clients
          .map(
            (client) =>
              `<option value="${client.id_client}">${echapper(client.nom)} ${echapper(client.prenom)}</option>`
          )
          .join("");

      listeVoitures.innerHTML =
        `<option value="">-- Choisir une voiture --</option>` +
        voitures
          .map(
            (voiture) =>
              `<option value="${voiture.id_voiture}">${echapper(voiture.marque)} ${echapper(voiture.modele)} (${echapper(voiture.immatriculation)}) - ${argent(voiture.prix_jour)}/jour</option>`
          )
          .join("");
    } catch (erreur) {
      afficherMessage(`Impossible de charger les clients ou les voitures : ${messageErreur(erreur)}`);
    }
  }

  // Montant estimé affiché en direct (le calcul officiel reste celui de Django)
  function mettreAJourEstimation() {
    const champs = formulaire.elements;
    const voiture = voitures.find((element) => String(element.id_voiture) === champs.voiture.value);

    if (!champs.date_debut.value || !champs.date_fin.value || !voiture) {
      estimation.hidden = true;
      return;
    }

    const jours = Math.max(
      1,
      Math.round((new Date(champs.date_fin.value) - new Date(champs.date_debut.value)) / 86400000)
    );
    estimation.textContent = `Montant estimé : ${argent(jours * Number(voiture.prix_jour))}`;
    estimation.hidden = false;
  }

  function annuler() {
    formulaire.reset();
    enModification = null;
    titre.textContent = "Nouvelle réservation";
    btnValider.textContent = "Réserver";
    panneauFormulaire.hidden = true;
    btnAjouter.hidden = false;
    btnAjouter.setAttribute("aria-expanded", "false");
    btnAnnuler.hidden = true;
    estimation.hidden = true;
    effacerMessage();
    btnAjouter.focus();
  }

  btnAjouter.addEventListener("click", () => {
    formulaire.reset();
    enModification = null;
    titre.textContent = "Nouvelle réservation";
    btnValider.textContent = "Réserver";
    btnAnnuler.hidden = false;
    ouvrirFormulaire();
    formulaire.elements.client.focus();
  });

  formulaire.addEventListener("change", mettreAJourEstimation);

  formulaire.addEventListener("submit", async (e) => {
    e.preventDefault();
    effacerMessage();

    const donnees = Object.fromEntries(new FormData(formulaire));

    try {
      if (enModification) {
        await api.modifier("/reservations/", enModification, donnees);
      } else {
        await api.ajouter("/reservations/", donnees);
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
      const reservation = reservations.find((element) => element.id_reservation === id);
      if (!reservation) return;

      formulaire.elements.client.value = reservation.client;
      formulaire.elements.voiture.value = reservation.voiture;
      formulaire.elements.date_debut.value = reservation.date_debut;
      formulaire.elements.date_fin.value = reservation.date_fin;
      formulaire.elements.statut.value = reservation.statut;
      enModification = id;
      titre.textContent = "Modifier la réservation";
      btnValider.textContent = "Enregistrer";
      btnAnnuler.hidden = false;
      ouvrirFormulaire();
      mettreAJourEstimation();
      formulaire.elements.client.focus();
    }

    if (bouton.dataset.action === "supprimer") {
      if (!confirm("Supprimer cette réservation ?")) return;
      effacerMessage();
      try {
        await api.supprimer("/reservations/", id);
        await charger();
      } catch (erreur) {
        afficherMessage(`Suppression impossible : ${messageErreur(erreur)}`);
      }
    }
  });

  chargerListes();
  charger();
}
