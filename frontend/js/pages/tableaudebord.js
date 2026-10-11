import { api, messageErreur } from "../api.js";
import { echapper, argent } from "../outils.js";

// Le serveur ne renvoie que les statuts existants : on met 0 si un statut manque
function nombreParStatut(liste, statut) {
  const ligne = liste.find((l) => l.statut === statut);
  return ligne ? ligne.nombre : 0;
}

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

    <h2>Finances</h2>
    <ul>
      <li>Total facturé : ${argent(stats.finances.total_facture)}</li>
      <li>Total encaissé : ${argent(stats.finances.total_encaisse)}</li>
      <li>Reste à encaisser : ${argent(stats.finances.total_reste)}</li>
    </ul>

    <h2>Voitures</h2>
    <ul>
      <li>Disponibles : ${nombreParStatut(stats.voitures, "disponible")}</li>
      <li>Louées : ${nombreParStatut(stats.voitures, "loue")}</li>
      <li>En maintenance : ${nombreParStatut(stats.voitures, "maintenance")}</li>
    </ul>

    <h2>Réservations</h2>
    <ul>
      <li>En attente : ${nombreParStatut(stats.reservations, "en_attente")}</li>
      <li>Confirmées : ${nombreParStatut(stats.reservations, "confirmee")}</li>
      <li>Terminées : ${nombreParStatut(stats.reservations, "terminee")}</li>
      <li>Annulées : ${nombreParStatut(stats.reservations, "annulee")}</li>
    </ul>

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