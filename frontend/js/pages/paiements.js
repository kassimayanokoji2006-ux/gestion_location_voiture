import { api, messageErreur } from "../api.js";
import { echapper, argent } from "../outils.js";

export function afficherPaiements(conteneur) {
  let paiements = [];
  let reservations = [];
  let enModification = null;

  conteneur.innerHTML = `
    <h1>Gestion des paiements</h1>

    <form id="formulaire">
      <h2 id="titre-formulaire">Nouveau paiement</h2>

      <select name="reservation" id="liste-reservations" required>
        <option value="">-- Choisir une réservation --</option>
      </select>

      <p id="reste" hidden></p>

      <input name="montant" type="number" step="0.01" min="0.01" placeholder="Montant" required>

      <select name="mode_paiement">
        <option value="especes">Espèces</option>
        <option value="mobile_money">Mobile Money</option>
        <option value="carte">Carte</option>
        <option value="virement">Virement</option>
      </select>

      <input name="reference" placeholder="Référence (facultatif)">

      <button type="submit" id="btn-valider">Payer</button>
      <button type="button" id="btn-annuler" hidden>Annuler</button>
    </form>

    <table border="1" cellpadding="8">
      <thead>
        <tr>
          <th>ID</th>
          <th>Réservation</th>
          <th>Date</th>
          <th>Montant</th>
          <th>Mode</th>
          <th>Référence</th>
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
  const listeReservations = conteneur.querySelector("#liste-reservations");
  const reste = conteneur.querySelector("#reste");

  function dessiner() {
    corps.innerHTML = paiements
      .map(
        (p) => `
        <tr>
          <td>${p.id_paiement}</td>
          <td>${echapper(p.reservation_info)}</td>
          <td>${echapper(p.date_paiement)}</td>
          <td>${argent(p.montant)}</td>
          <td>${echapper(p.mode_paiement)}</td>
          <td>${echapper(p.reference)}</td>
          <td>
            <button data-action="modifier" data-id="${p.id_paiement}">Modifier</button>
            <button data-action="supprimer" data-id="${p.id_paiement}">Supprimer</button>
          </td>
        </tr>`
      )
      .join("");
  }

  async function charger() {
    try {
      paiements = await api.lister("/paiements/");
      dessiner();
      mettreAJourReste();
    } catch (erreur) {
      alert("Erreur : " + messageErreur(erreur));
    }
  }

  async function chargerReservations() {
    try {
      reservations = await api.lister("/reservations/");
      listeReservations.innerHTML =
        `<option value="">-- Choisir une réservation --</option>` +
        reservations
          .map(
            (r) =>
              `<option value="${r.id_reservation}">#${r.id_reservation} - ${echapper(r.client_nom)} - ${echapper(r.voiture_nom)} (${argent(r.montant_total)})</option>`
          )
          .join("");
    } catch (erreur) {
      alert("Erreur : " + messageErreur(erreur));
    }
  }

  // Reste à payer affiché en direct pour la réservation choisie
  function mettreAJourReste() {
    const choix = listeReservations.value;
    const reservation = reservations.find((r) => String(r.id_reservation) === choix);

    if (!reservation) {
      reste.hidden = true;
      return;
    }

    const dejaPaye = paiements
      .filter(
        (p) =>
          String(p.reservation) === choix && p.id_paiement !== enModification
      )
      .reduce((somme, p) => somme + Number(p.montant), 0);

    reste.textContent = `Reste à payer : ${argent(Number(reservation.montant_total) - dejaPaye)}`;
    reste.hidden = false;
  }

  function annuler() {
    formulaire.reset();
    enModification = null;
    titre.textContent = "Nouveau paiement";
    btnValider.textContent = "Payer";
    btnAnnuler.hidden = true;
    reste.hidden = true;
  }

  listeReservations.addEventListener("change", mettreAJourReste);

  formulaire.addEventListener("submit", async (e) => {
    e.preventDefault();

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
      alert("Erreur : " + messageErreur(erreur));
    }
  });

  btnAnnuler.addEventListener("click", annuler);

  corps.addEventListener("click", async (e) => {
    const bouton = e.target.closest("button");
    if (!bouton) return;

    const id = Number(bouton.dataset.id);

    if (bouton.dataset.action === "modifier") {
      const p = paiements.find((x) => x.id_paiement === id);
      formulaire.elements.reservation.value = p.reservation;
      formulaire.elements.montant.value = p.montant;
      formulaire.elements.mode_paiement.value = p.mode_paiement;
      formulaire.elements.reference.value = p.reference ?? "";
      enModification = id;
      titre.textContent = "Modifier le paiement";
      btnValider.textContent = "Enregistrer";
      btnAnnuler.hidden = false;
      mettreAJourReste();
    }

    if (bouton.dataset.action === "supprimer") {
      if (!confirm("Supprimer ce paiement ?")) return;
      try {
        await api.supprimer("/paiements/", id);
        await charger();
      } catch (erreur) {
        alert("Erreur : " + messageErreur(erreur));
      }
    }
  });

  chargerReservations();
  charger();
}