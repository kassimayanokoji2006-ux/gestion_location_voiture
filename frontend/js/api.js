import { API_URL } from "./config.js";

async function requete(chemin, options = {}) {
  const reponse = await fetch(API_URL + chemin, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (reponse.status === 204) {
    return null;
  }

  const donnees = await reponse.json().catch(() => null);

  if (!reponse.ok) {
    const erreur = new Error("Erreur API");
    erreur.donnees = donnees;
    throw erreur;
  }

  return donnees;
}

export const api = {
  lister: (chemin) => requete(chemin),
  ajouter: (chemin, donnees) =>
    requete(chemin, { method: "POST", body: JSON.stringify(donnees) }),
  modifier: (chemin, id, donnees) =>
    requete(`${chemin}${id}/`, { method: "PUT", body: JSON.stringify(donnees) }),
  supprimer: (chemin, id) =>
    requete(`${chemin}${id}/`, { method: "DELETE" }),
};

export function messageErreur(erreur) {
  const donnees = erreur.donnees;
  if (!donnees) {
    return "Impossible de joindre le serveur.";
  }
  if (donnees.erreur) {
    return donnees.erreur;
  }
  if (donnees.non_field_errors) {
    return donnees.non_field_errors.join(" ");
  }
  return JSON.stringify(donnees);
}