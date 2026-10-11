import { api, messageErreur } from "../api.js";
import { echapper, argent } from "../outils.js";

export function afficherReservations(conteneur) {
  let reservations = [];
  let voitures = [];
  let enModification = null;

  conteneur.innerHTML = `
    <h1>Gestion des réservations</h1>

    <form id="formulaire">
      <h2 id="titre-formulaire">Nouvelle réservation</h2>

      <select name="client" id="liste-clients" required>
        <option value="">-- Choisir un client --</option>
      </select>

      <select name="voiture" id="liste-voitures" required>
        <option value="">-- Choisir une voiture --</option>
      </select>

      <label>Du <input name="date_debut" type="date" required></label>
      <label>Au <input name="date_fin" type="date" required></label>

      <select name="statut">
        <option value="en_attente">En attente</option>
        <option value="confirmee">Confirmée</option>
        <option value="terminee">Terminée</option>
        <option value="annulee">Annulée</option>
      </select>

      <p id="estimation" hidden></p>

      <button type="submit" id="btn-valider">Réserver</button>
      <button type="button" id="btn-annuler" hidden>Annuler</button>
    </form>

    <table border="1" cellpadding="8">
      <thead>
        <tr>
          <th>ID</th>
          <th>Client</th>
          <th>Voiture</th>
          <th>Du</th>
          <th>Au</th>
          <th>Statut</th>
          <th>Montant total</th>
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
  const listeClients = conteneur.querySelector("#liste-clients");
  const listeVoitures = conteneur.querySelector("#liste-voitures");
  const estimation = conteneur.querySelector("#estimation");

  function dessiner() {
    corps.innerHTML = reservations
      .map(
        (r) => `
        <tr>
          <td>${r.id_reservation}</td>
          <td>${echapper(r.client_nom)}</td>
          <td>${echapper(r.voiture_nom)}</td>
          <td>${echapper(r.date_debut)}</td>
          <td>${echapper(r.date_fin)}</td>
          <td>${echapper(r.statut)}</td>
          <td>${argent(r.montant_total)}</td>
          <td>
            <button data-action="modifier" data-id="${r.id_reservation}">Modifier</button>
            <button data-action="supprimer" data-id="${r.id_reservation}">Supprimer</button>
          </td>
        </tr>`
      )
      .join("");
  }

  async function charger() {
    try {
      reservations = await api.lister("/reservations/");
      dessiner();
    } catch (erreur) {
      alert("Erreur : " + messageErreur(erreur));
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
            (c) =>
              `<option value="${c.id_client}">${echapper(c.nom)} ${echapper(c.prenom)}</option>`
          )
          .join("");

      listeVoitures.innerHTML =
        `<option value="">-- Choisir une voiture --</option>` +
        voitures
          .map(
            (v) =>
              `<option value="${v.id_voiture}">${echapper(v.marque)} ${echapper(v.modele)} (${echapper(v.immatriculation)}) - ${argent(v.prix_jour)}/jour</option>`
          )
          .join("");
    } catch (erreur) {
      alert("Erreur : " + messageErreur(erreur));
    }
  }

  // Montant estimé affiché en direct (le calcul officiel reste celui de Django)
  function mettreAJourEstimation() {
    const f = formulaire.elements;
    const voiture = voitures.find((v) => String(v.id_voiture) === f.voiture.value);

    if (!f.date_debut.value || !f.date_fin.value || !voiture) {
      estimation.hidden = true;
      return;
    }

    const jours = Math.max(
      1,
      Math.round((new Date(f.date_fin.value) - new Date(f.date_debut.value)) / 86400000)
    );
    estimation.textContent = `Montant estimé : ${argent(jours * Number(voiture.prix_jour))}`;
    estimation.hidden = false;
  }

  function annuler() {
    formulaire.reset();
    enModification = null;
    titre.textContent = "Nouvelle réservation";
    btnValider.textContent = "Réserver";
    btnAnnuler.hidden = true;
    estimation.hidden = true;
  }

  formulaire.addEventListener("change", mettreAJourEstimation);

  formulaire.addEventListener("submit", async (e) => {
    e.preventDefault();

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
      alert("Erreur : " + messageErreur(erreur));
    }
  });

  btnAnnuler.addEventListener("click", annuler);

  corps.addEventListener("click", async (e) => {
    const bouton = e.target.closest("button");
    if (!bouton) return;

    const id = Number(bouton.dataset.id);

    if (bouton.dataset.action === "modifier") {
      const r = reservations.find((x) => x.id_reservation === id);
      formulaire.elements.client.value = r.client;
      formulaire.elements.voiture.value = r.voiture;
      formulaire.elements.date_debut.value = r.date_debut;
      formulaire.elements.date_fin.value = r.date_fin;
      formulaire.elements.statut.value = r.statut;
      enModification = id;
      titre.textContent = "Modifier la réservation";
      btnValider.textContent = "Enregistrer";
      btnAnnuler.hidden = false;
      mettreAJourEstimation();
    }

    if (bouton.dataset.action === "supprimer") {
      if (!confirm("Supprimer cette réservation ?")) return;
      try {
        await api.supprimer("/reservations/", id);
        await charger();
      } catch (erreur) {
        alert("Suppression impossible : cette réservation a peut-être des paiements.");
      }
    }
  });

  chargerListes();
  charger();
}