import { api, messageErreur } from "../api.js";
import { echapper, argent } from "../outils.js";

const modesPaiement = {
  especes: "Espèces",
  mobile_money: "Mobile Money",
  carte: "Carte",
  virement: "Virement",
};

function libelleModePaiement(mode) {
  return modesPaiement[mode] || echapper(mode);
}

export function afficherPaiements(conteneur) {
  let paiements = [];
  let reservations = [];
  let enModification = null;

  conteneur.innerHTML = `
    <section class="entete-tableau entete-page-donnees">
      <div>
        <h1>Paiements</h1>
        <p>Consultez les règlements enregistrés et suivez le solde des réservations.</p>
      </div>
      <button
        type="button"
        id="btn-ajouter-paiement"
        class="bouton-principal bouton-ajout-page"
        aria-controls="panneau-formulaire-paiement"
        aria-expanded="false"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
        Nouveau paiement
      </button>
    </section>

    <div id="message-paiements" class="message message--erreur message-page-donnees" role="alert" hidden></div>

    <section id="panneau-formulaire-paiement" class="panneau panneau-formulaire-donnees" hidden>
      <div class="entete-formulaire-donnees">
        <h2 id="titre-formulaire">Nouveau paiement</h2>
        <p>Associez le montant reçu à une réservation existante.</p>
      </div>
      <form id="formulaire" class="formulaire-donnees">
        <div class="grille-formulaire-donnees">
          <label for="liste-reservations">
            <span class="libelle-champ">Réservation <span aria-hidden="true">*</span></span>
            <select name="reservation" id="liste-reservations" required>
              <option value="">Chargement des réservations…</option>
            </select>
          </label>
          <label for="paiement-montant">
            <span class="libelle-champ">Montant <span aria-hidden="true">*</span></span>
            <input id="paiement-montant" name="montant" type="number" step="0.01" min="0.01" required>
          </label>
          <label for="paiement-mode">
            <span class="libelle-champ">Mode de paiement</span>
            <select id="paiement-mode" name="mode_paiement">
              <option value="especes">Espèces</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="carte">Carte</option>
              <option value="virement">Virement</option>
            </select>
          </label>
          <label for="paiement-reference">
            <span class="libelle-champ">Référence</span>
            <input id="paiement-reference" name="reference" placeholder="Facultative">
          </label>
        </div>
        <p id="reste" class="solde-reservation" hidden></p>
        <div class="actions-formulaire-donnees">
          <button type="submit" id="btn-valider" class="bouton-principal">Payer</button>
          <button type="button" id="btn-annuler" class="bouton-secondaire" hidden>Annuler</button>
        </div>
      </form>
    </section>

    <section class="section-tableau section-page-donnees" aria-labelledby="titre-liste-paiements">
      <div class="entete-section-tableau">
        <div>
          <h2 id="titre-liste-paiements">Historique des paiements</h2>
          <p id="nombre-paiements">Chargement des paiements…</p>
        </div>
      </div>
      <div class="tableau-defilant tableau-paiements">
        <table>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Réservation</th>
              <th scope="col">Date</th>
              <th scope="col">Montant</th>
              <th scope="col">Mode</th>
              <th scope="col">Référence</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody id="corps"></tbody>
        </table>
      </div>
    </section>
  `;

  const formulaire = conteneur.querySelector("#formulaire");
  const panneauFormulaire = conteneur.querySelector("#panneau-formulaire-paiement");
  const titre = conteneur.querySelector("#titre-formulaire");
  const btnAjouter = conteneur.querySelector("#btn-ajouter-paiement");
  const btnValider = conteneur.querySelector("#btn-valider");
  const btnAnnuler = conteneur.querySelector("#btn-annuler");
  const corps = conteneur.querySelector("#corps");
  const listeReservations = conteneur.querySelector("#liste-reservations");
  const reste = conteneur.querySelector("#reste");
  const message = conteneur.querySelector("#message-paiements");
  const nombrePaiements = conteneur.querySelector("#nombre-paiements");

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
    nombrePaiements.textContent = `${paiements.length} paiement${paiements.length > 1 ? "s" : ""}`;

    if (paiements.length === 0) {
      corps.innerHTML = `
        <tr>
          <td class="tableau-vide" colspan="7">
            <div class="etat-vide-donnees">
              <strong>Aucun paiement pour le moment</strong>
              <span>Les paiements enregistrés apparaîtront ici.</span>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    corps.innerHTML = paiements
      .map(
        (paiement) => `
          <tr>
            <td class="identifiant-donnee">${paiement.id_paiement}</td>
            <td class="nom-donnee">${echapper(paiement.reservation_info)}</td>
            <td class="date-paiement">${echapper(paiement.date_paiement)}</td>
            <td class="tarif-donnee">${argent(paiement.montant)}</td>
            <td><span class="badge-mode-paiement">${libelleModePaiement(paiement.mode_paiement)}</span></td>
            <td>${echapper(paiement.reference)}</td>
            <td>
              <div class="actions-ligne-donnee">
                <button type="button" class="bouton-secondaire" data-action="modifier" data-id="${paiement.id_paiement}">Modifier</button>
                <button type="button" class="bouton-danger" data-action="supprimer" data-id="${paiement.id_paiement}">Supprimer</button>
              </div>
            </td>
          </tr>
        `
      )
      .join("");
  }

  async function charger() {
    nombrePaiements.textContent = "Chargement des paiements…";
    corps.innerHTML = `
      <tr>
        <td class="chargement-donnees" colspan="7">
          <span class="indicateur-chargement" aria-hidden="true"></span>
          Chargement des paiements…
        </td>
      </tr>
    `;

    try {
      paiements = await api.lister("/paiements/");
      dessiner();
      mettreAJourReste();
    } catch (erreur) {
      paiements = [];
      nombrePaiements.textContent = "Les paiements n’ont pas pu être chargés.";
      corps.innerHTML = `<tr><td class="tableau-vide" colspan="7">Les données ne sont pas disponibles.</td></tr>`;
      afficherMessage(`Erreur lors du chargement des paiements : ${messageErreur(erreur)}`);
    }
  }

  async function chargerReservations() {
    try {
      reservations = await api.lister("/reservations/");
      listeReservations.innerHTML =
        `<option value="">-- Choisir une réservation --</option>` +
        reservations
          .map(
            (reservation) =>
              `<option value="${reservation.id_reservation}">#${reservation.id_reservation} - ${echapper(reservation.client_nom)} - ${echapper(reservation.voiture_nom)} (${argent(reservation.montant_total)})</option>`
          )
          .join("");
    } catch (erreur) {
      listeReservations.innerHTML = `<option value="">Réservations indisponibles</option>`;
      afficherMessage(`Impossible de charger les réservations : ${messageErreur(erreur)}`);
    }
  }

  // Reste à payer affiché en direct pour la réservation choisie
  function mettreAJourReste() {
    const choix = listeReservations.value;
    const reservation = reservations.find((element) => String(element.id_reservation) === choix);

    if (!reservation) {
      reste.hidden = true;
      return;
    }

    const dejaPaye = paiements
      .filter(
        (paiement) =>
          String(paiement.reservation) === choix && paiement.id_paiement !== enModification
      )
      .reduce((somme, paiement) => somme + Number(paiement.montant), 0);

    reste.textContent = `Reste à payer : ${argent(Number(reservation.montant_total) - dejaPaye)}`;
    reste.hidden = false;
  }

  function annuler() {
    formulaire.reset();
    enModification = null;
    titre.textContent = "Nouveau paiement";
    btnValider.textContent = "Payer";
    panneauFormulaire.hidden = true;
    btnAjouter.hidden = false;
    btnAjouter.setAttribute("aria-expanded", "false");
    btnAnnuler.hidden = true;
    reste.hidden = true;
    effacerMessage();
    btnAjouter.focus();
  }

  btnAjouter.addEventListener("click", () => {
    formulaire.reset();
    enModification = null;
    titre.textContent = "Nouveau paiement";
    btnValider.textContent = "Payer";
    btnAnnuler.hidden = false;
    ouvrirFormulaire();
    formulaire.elements.reservation.focus();
  });

  listeReservations.addEventListener("change", mettreAJourReste);

  formulaire.addEventListener("submit", async (e) => {
    e.preventDefault();
    effacerMessage();

    const donnees = Object.fromEntries(new FormData(formulaire));
    donnees.reference = donnees.reference || null;

    try {
      if (enModification) {
        await api.modifier("/paiements/", enModification, donnees);
      } else {
        await api.ajouter("/paiements/", donnees);
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
      const paiement = paiements.find((element) => element.id_paiement === id);
      if (!paiement) return;

      formulaire.elements.reservation.value = paiement.reservation;
      formulaire.elements.montant.value = paiement.montant;
      formulaire.elements.mode_paiement.value = paiement.mode_paiement;
      formulaire.elements.reference.value = paiement.reference ?? "";
      enModification = id;
      titre.textContent = "Modifier le paiement";
      btnValider.textContent = "Enregistrer";
      btnAnnuler.hidden = false;
      ouvrirFormulaire();
      mettreAJourReste();
      formulaire.elements.reservation.focus();
    }

    if (bouton.dataset.action === "supprimer") {
      if (!confirm("Supprimer ce paiement ?")) return;
      effacerMessage();
      try {
        await api.supprimer("/paiements/", id);
        await charger();
      } catch (erreur) {
        afficherMessage(`Suppression impossible : ${messageErreur(erreur)}`);
      }
    }
  });

  chargerReservations();
  charger();
}
