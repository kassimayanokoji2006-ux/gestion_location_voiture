import { api, messageErreur } from "../api.js";
import { echapper, argent } from "../outils.js";

// Le GROUP BY ne renvoie que les statuts existants : on met 0 si un statut manque
function nombreParStatut(liste, statut) {
  const ligne = liste.find((l) => l.statut === statut);
  return ligne ? ligne.nombre : 0;
}

function carte(titre, valeur) {
  return `
    <div style="border:1px solid #ccc; border-radius:8px; padding:16px; min-width:160px;">
      <h3>${titre}</h3>
      <p>${valeur}</p>
    </div>`;
}

const LIGNE = "display:flex; gap:16px; flex-wrap:wrap;";

export async function afficherTableauDeBord(conteneur) {
  conteneur.innerHTML = "<p>Chargement...</p>";

  let stats;
  try {
    stats = await api.lister("/tableau-de-bord/");
  } catch (erreur) {
    conteneur.innerHTML = "<p>Impossible de charger le tableau de bord.</p>";
    alert("Erreur : " + messageErreur(erreur));
    return;
  }

  conteneur.innerHTML = `
    <h1>Tableau de bord</h1>

    <h2>Parc de voitures</h2>
    <div style="${LIGNE}">
      ${carte("Disponibles", nombreParStatut(stats.voitures, "disponible"))}
      ${carte("Louées", nombreParStatut(stats.voitures, "loue"))}
      ${carte("En maintenance", nombreParStatut(stats.voitures, "maintenance"))}
    </div>

    <h2>Réservations</h2>
    <div style="${LIGNE}">
      ${carte("En attente", nombreParStatut(stats.reservations, "en_attente"))}
      ${carte("Confirmées", nombreParStatut(stats.reservations, "confirmee"))}
      ${carte("Terminées", nombreParStatut(stats.reservations, "terminee"))}
      ${carte("Annulées", nombreParStatut(stats.reservations, "annulee"))}
    </div>

    <h2>Finances</h2>
    <div style="${LIGNE}">
      ${carte("Total facturé", argent(stats.finances.total_facture))}
      ${carte("Total encaissé", argent(stats.finances.total_encaisse))}
      ${carte("Reste à encaisser", argent(stats.finances.total_reste))}
    </div>

    <h2>Top 5 des voitures les plus louées</h2>
    <table border="1" cellpadding="8">
      <thead>
        <tr>
          <th>Voiture</th>
          <th>Immatriculation</th>
          <th>Réservations</th>
          <th>Chiffre d'affaires</th>
        </tr>
      </thead>
      <tbody>
        ${stats.top_voitures
          .map(
            (v) => `
          <tr>
            <td>${echapper(v.marque)} ${echapper(v.modele)}</td>
            <td>${echapper(v.immatriculation)}</td>
            <td>${v.nb_reservations}</td>
            <td>${argent(v.chiffre_affaires)}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
}
