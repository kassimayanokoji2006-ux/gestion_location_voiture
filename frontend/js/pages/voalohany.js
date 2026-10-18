
import { api, messageErreur } from "../api.js";
import { echapper, argent } from "../outils.js";

export function afficherVoalohany
(conteneur) {
  conteneur.innerHTML = `
    <h1>Tonagasoa lesy</h1>
  `;
}