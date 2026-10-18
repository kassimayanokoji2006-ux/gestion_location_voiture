import { api, messageErreur } from "../api.js";
import { echapper, argent } from "../outils.js";

// Le serveur ne renvoie que les statuts existants : on met 0 si un statut manque
function nombreParStatut(liste, statut) {
  const ligne = liste.find((l) => l.statut === statut);
  return ligne ? ligne.nombre : 0;
}

function creerRepartition(statuts) {
  const total = statuts.reduce((somme, statut) => somme + Number(statut.nombre), 0);
  let position = 0;

  const segments = statuts
    .map((statut) => {
      const largeur = total ? (Number(statut.nombre) / total) * 1000 : 0;
      const segment = `<rect x="${position}" y="0" width="${largeur}" height="16" rx="8" fill="${statut.couleur}"></rect>`;
      position += largeur;
      return segment;
    })
    .join("");

  return `
    <svg class="graphique-repartition" viewBox="0 0 1000 16" role="img"
      aria-label="Répartition des réservations par statut, sur un total de ${total}">
      ${segments}
    </svg>
  `;
}

export async function afficherTableauDeBord(conteneur) {
  conteneur.innerHTML = `
    <div class="chargement-tableau" role="status" aria-live="polite">
      <span class="indicateur-chargement" aria-hidden="true"></span>
      Chargement des données du tableau de bord…
    </div>
  `;

  let stats;
  try {
    stats = await api.lister("/tableau-de-bord/");
  } catch (erreur) {
    conteneur.innerHTML = `
      <section class="message message--erreur" role="alert">
        <h1>Impossible de charger le tableau de bord</h1>
        <p>${echapper(messageErreur(erreur))}</p>
      </section>
    `;
    return;
  }

  const voituresDisponibles = nombreParStatut(stats.voitures, "disponible");
  const statutsVoitures = [
    { libelle: "Disponibles", statut: "disponible", classe: "succes" },
    { libelle: "Louées", statut: "loue", classe: "violet" },
    { libelle: "En maintenance", statut: "maintenance", classe: "avertissement" },
  ];
  const statutsReservations = [
    {
      libelle: "En attente",
      statut: "en_attente",
      classe: "avertissement",
      couleur: "#f59e0b",
    },
    {
      libelle: "Confirmées",
      statut: "confirmee",
      classe: "violet",
      couleur: "#7c3aed",
    },
    {
      libelle: "Terminées",
      statut: "terminee",
      classe: "succes",
      couleur: "#16a34a",
    },
    {
      libelle: "Annulées",
      statut: "annulee",
      classe: "danger",
      couleur: "#dc2626",
    },
  ];
  const legendeReservations = statutsReservations
    .map(
      (statut) => `
        <li class="element-legende">
          <span class="point-legende point-legende--${statut.classe}" aria-hidden="true"></span>
          <span>${statut.libelle}</span>
          <strong>${nombreParStatut(stats.reservations, statut.statut)}</strong>
        </li>
      `
    )
    .join("");

  conteneur.innerHTML = `
    <section class="entete-tableau">
      <div>
        <h1>Tableau de bord</h1>
        <p>Vue d'ensemble de votre activité de location</p>
      </div>
    </section>

    <section class="grille-statistiques statistiques-principales" aria-label="Indicateurs principaux">
      <article class="carte-statistique carte-statistique--violet">
        <span class="etiquette">Total facturé</span>
        <strong class="valeur">${argent(stats.finances.total_facture)}</strong>
        <span class="icone-statistique icone-statistique--violet" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="3" width="16" height="18" rx="3"></rect><path d="M8 8h8M8 12h8M8 16h4"></path>
          </svg>
        </span>
      </article>
      <article class="carte-statistique carte-statistique--bleu">
        <span class="etiquette">Total encaissé</span>
        <strong class="valeur">${argent(stats.finances.total_encaisse)}</strong>
        <span class="icone-statistique icone-statistique--bleu" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7h18v13H3zM3 11h18M7 16h4"></path><path d="M7 4h10"></path>
          </svg>
        </span>
      </article>
      <article class="carte-statistique carte-statistique--peche">
        <span class="etiquette">Reste à encaisser</span>
        <strong class="valeur">${argent(stats.finances.total_reste)}</strong>
        <span class="icone-statistique icone-statistique--peche" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>
          </svg>
        </span>
      </article>
      <article class="carte-statistique carte-statistique--vert">
        <span class="etiquette">Voitures disponibles</span>
        <strong class="valeur">${voituresDisponibles}</strong>
        <span class="icone-statistique icone-statistique--vert" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 13 2-6h14l2 6M5 13h14a2 2 0 0 1 2 2v4h-3v-2H6v2H3v-4a2 2 0 0 1 2-2Z"></path><path d="M7 10h.01M17 10h.01"></path>
          </svg>
        </span>
      </article>
    </section>

    <section class="section-tableau" aria-labelledby="titre-statuts">
      <div class="entete-section-tableau">
        <div>
          <h2 id="titre-statuts">Activité par statut</h2>
          <p>Vue actuelle du parc et des réservations</p>
        </div>
      </div>
      <div class="grille-statuts">
        <article class="panneau-statuts">
          <h3>État des voitures</h3>
          <ul class="liste-statuts">
            ${statutsVoitures
              .map(
                (statut) => `
                  <li class="element-statut">
                    <span class="point-legende point-legende--${statut.classe}" aria-hidden="true"></span>
                    <span>${statut.libelle}</span>
                    <strong>${nombreParStatut(stats.voitures, statut.statut)}</strong>
                  </li>
                `
              )
              .join("")}
          </ul>
        </article>
        <article class="panneau-statuts panneau-repartition">
          <div class="entete-repartition">
            <div>
              <h3>Réservations</h3>
              <p>Répartition par statut</p>
            </div>
            <strong class="total-repartition">${statutsReservations.reduce(
              (somme, statut) => somme + Number(nombreParStatut(stats.reservations, statut.statut)),
              0
            )}</strong>
          </div>
          ${creerRepartition(
            statutsReservations.map((statut) => ({
              ...statut,
              nombre: nombreParStatut(stats.reservations, statut.statut),
            }))
          )}
          <ul class="legende-repartition">${legendeReservations}</ul>
        </article>
      </div>
    </section>

    <section class="section-tableau" aria-labelledby="titre-voitures-populaires">
      <div class="entete-section-tableau">
        <div>
          <h2 id="titre-voitures-populaires">Voitures les plus louées</h2>
          <p>Les cinq véhicules ayant le plus de réservations</p>
        </div>
      </div>
      <div class="tableau-defilant tableau-tableau-bord">
        <table>
          <thead>
            <tr>
              <th scope="col">Voiture</th>
              <th scope="col">Immatriculation</th>
              <th scope="col">Nombre de réservations</th>
              <th scope="col">Chiffre d'affaires</th>
            </tr>
          </thead>
          <tbody>
            ${
              stats.top_voitures.length
                ? stats.top_voitures
                    .map(
                      (voiture) => `
                        <tr>
                          <td class="nom-voiture">${echapper(voiture.marque)} ${echapper(voiture.modele)}</td>
                          <td><span class="plaque-immatriculation">${echapper(voiture.immatriculation)}</span></td>
                          <td>${voiture.nb_reservations}</td>
                          <td class="chiffre-affaires">${argent(voiture.chiffre_affaires)}</td>
                        </tr>
                      `
                    )
                    .join("")
                : `<tr><td class="tableau-vide" colspan="4">Aucune voiture à afficher pour le moment.</td></tr>`
            }
          </tbody>
        </table>
      </div>
    </section>
  `;
}
