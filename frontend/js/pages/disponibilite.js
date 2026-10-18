import { api, messageErreur } from "../api.js";
import { echapper, argent } from "../outils.js";

function badgeStatutVoiture(statut) {
  const statuts = {
    disponible: { libelle: "Disponible", classe: "succes" },
    maintenance: { libelle: "Maintenance", classe: "neutre" },
    louee: { libelle: "Louée", classe: "avertissement" },
  };

  const presentation = statuts[statut];

  return presentation
    ? `<span class="badge-statut badge-statut--${presentation.classe}">${presentation.libelle}</span>`
    : `<span class="badge-statut badge-statut--neutre">${echapper(statut)}</span>`;
}

export function afficherDisponibilites(conteneur) {
  conteneur.innerHTML = `
    <section class="entete-tableau entete-page-donnees">
      <div>
        <h1>Disponibilités</h1>
        <p>Vérifiez les véhicules disponibles sur une période précise.</p>
      </div>
    </section>

    <div id="message-disponibilites" class="message message--erreur message-page-donnees" role="alert" hidden></div>

    <section class="panneau panneau-formulaire-donnees" aria-labelledby="titre-recherche-disponibilites">
      <div class="entete-formulaire-donnees">
        <h2 id="titre-recherche-disponibilites">Recherche de disponibilité</h2>
        <p>Choisissez une plage de dates pour afficher les voitures libres.</p>
      </div>

      <form id="formulaire" class="formulaire-donnees">
        <div class="grille-formulaire-donnees">
          <label for="disponibilite-date-debut">
            <span class="libelle-champ">Date de début <span aria-hidden="true">*</span></span>
            <input id="disponibilite-date-debut" name="debut" type="date" required>
          </label>

          <label for="disponibilite-date-fin">
            <span class="libelle-champ">Date de fin <span aria-hidden="true">*</span></span>
            <input id="disponibilite-date-fin" name="fin" type="date" required>
          </label>
        </div>

        <div class="actions-formulaire-donnees">
          <button type="submit" class="bouton-principal">Rechercher</button>
        </div>
      </form>
    </section>

    <section class="section-tableau section-page-donnees" aria-labelledby="titre-liste-disponibilites">
      <div class="entete-section-tableau">
        <div>
          <h2 id="titre-liste-disponibilites">Véhicules disponibles</h2>
          <p id="resume-disponibilites">Choisissez une période pour commencer la recherche.</p>
        </div>
      </div>
      <div id="resultat" class="resultat-disponibilites"></div>
    </section>
  `;

  const formulaire = conteneur.querySelector("#formulaire");
  const resultat = conteneur.querySelector("#resultat");
  const message = conteneur.querySelector("#message-disponibilites");
  const resume = conteneur.querySelector("#resume-disponibilites");

  function afficherMessage(texte) {
    message.textContent = texte;
    message.hidden = false;
  }

  function effacerMessage() {
    message.textContent = "";
    message.hidden = true;
  }

  function afficherCharge() {
    resultat.innerHTML = `
      <div class="etat-vide-donnees" role="status" aria-live="polite">
        <span class="indicateur-chargement" aria-hidden="true"></span>
        <strong>Recherche en cours…</strong>
        <span>Chargement des véhicules disponibles.</span>
      </div>
    `;
  }

  function afficherVide(debut, fin) {
    resultat.innerHTML = `
      <div class="etat-vide-donnees">
        <strong>Aucune voiture disponible</strong>
        <span>Il n’y a aucun véhicule libre du ${echapper(debut)} au ${echapper(fin)}.</span>
      </div>
    `;
  }

  function afficherResultat(voitures, debut, fin) {
    const nombres = voitures.length;
    resume.textContent = `${nombres} véhicule${nombres > 1 ? "s" : ""} disponible${nombres > 1 ? "s" : ""} du ${echapper(debut)} au ${echapper(fin)}`;

    if (nombres === 0) {
      afficherVide(debut, fin);
      return;
    }

    const cartes = `
      <div class="grille-statistiques disponibilites-statistiques">
        <article class="carte-statistique carte-statistique--violet">
          <span class="etiquette">Période</span>
          <div class="valeur">${echapper(debut)}</div>
          <span class="tendance">→ ${echapper(fin)}</span>
        </article>
        <article class="carte-statistique carte-statistique--bleu">
          <span class="etiquette">Véhicules</span>
          <div class="valeur">${nombres}</div>
          <span class="tendance">Disponibles</span>
        </article>
      </div>
    `;

    const tableau = `
      <div class="tableau-defilant tableau-disponibilites">
        <table>
          <thead>
            <tr>
              <th scope="col">Immatriculation</th>
              <th scope="col">Marque</th>
              <th scope="col">Modèle</th>
              <th scope="col">Catégorie</th>
              <th scope="col">Carburant</th>
              <th scope="col">Prix / jour</th>
              <th scope="col">Statut</th>
            </tr>
          </thead>
          <tbody>
            ${voitures
              .map(
                (v) => `
                  <tr>
                    <td class="identifiant-donnee">${echapper(v.immatriculation)}</td>
                    <td class="nom-donnee">${echapper(v.marque)}</td>
                    <td>${echapper(v.modele)}</td>
                    <td>${echapper(v.categorie_libelle)}</td>
                    <td>${echapper(v.carburant)}</td>
                    <td class="tarif-donnee">${argent(v.prix_jour)}</td>
                    <td>${badgeStatutVoiture(v.statut)}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    resultat.innerHTML = cartes + tableau;
  }

  formulaire.addEventListener("submit", async (e) => {
    e.preventDefault();
    effacerMessage();

    const { debut, fin } = Object.fromEntries(new FormData(formulaire));

    if (!debut || !fin) {
      afficherMessage("Veuillez choisir une date de début et une date de fin.");
      resultat.innerHTML = "";
      return;
    }

    const parametres = new URLSearchParams({ debut, fin });
    afficherCharge();

    try {
      const voitures = await api.lister(`/voitures-disponibles/?${parametres}`);
      afficherResultat(voitures, debut, fin);
    } catch (erreur) {
      resultat.innerHTML = "";
      afficherMessage(`Erreur lors de la recherche : ${messageErreur(erreur)}`);
    }
  });
}