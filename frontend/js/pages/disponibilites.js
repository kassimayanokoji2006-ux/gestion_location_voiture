import { api, messageErreur } from "../api.js";
import { echapper, argent } from "../outils.js";

export function afficherDisponibilites(conteneur) {
  conteneur.innerHTML = `
    <h1>Voitures disponibles</h1>

    <form id="formulaire">
      <label>Du <input name="debut" type="date" required></label>
      <label>Au <input name="fin" type="date" required></label>
      <button type="submit">Rechercher</button>
    </form>

    <div id="resultat"></div>
  `;

  const formulaire = conteneur.querySelector("#formulaire");
  const resultat = conteneur.querySelector("#resultat");

  formulaire.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { debut, fin } = Object.fromEntries(new FormData(formulaire));
    const parametres = new URLSearchParams({ debut, fin });

    try {
      const voitures = await api.lister(`/voitures-disponibles/?${parametres}`);

      resultat.innerHTML = `
        <p>${voitures.length} voiture(s) disponible(s) du ${echapper(debut)} au ${echapper(fin)}</p>
        <table border="1" cellpadding="8">
          <thead>
            <tr>
              <th>Immatriculation</th>
              <th>Marque</th>
              <th>Modèle</th>
              <th>Catégorie</th>
              <th>Carburant</th>
              <th>Prix/jour</th>
            </tr>
          </thead>
          <tbody>
            ${voitures
              .map(
                (v) => `
              <tr>
                <td>${echapper(v.immatriculation)}</td>
                <td>${echapper(v.marque)}</td>
                <td>${echapper(v.modele)}</td>
                <td>${echapper(v.categorie_libelle)}</td>
                <td>${echapper(v.carburant)}</td>
                <td>${argent(v.prix_jour)}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      `;
    } catch (erreur) {
      resultat.innerHTML = "";
      alert("Erreur : " + messageErreur(erreur));
    }
  });
}
