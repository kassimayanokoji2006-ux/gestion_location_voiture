import { api, messageErreur } from "../api.js";
import { echapper } from "../outils.js";

export function afficherClients(conteneur) {
  let clients = [];
  let enModification = null;

  conteneur.innerHTML = `
    <section class="entete-tableau entete-clients">
      <div>
        <h1>Clients</h1>
        <p>Consultez et gérez les clients de votre activité de location.</p>
      </div>
      <button
        type="button"
        id="btn-ajouter-client"
        class="bouton-principal"
        aria-controls="panneau-formulaire-client"
        aria-expanded="false"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
        Ajouter un client
      </button>
    </section>

    <div id="message-clients" class="message message--erreur message-clients" role="alert" hidden></div>

    <section id="panneau-formulaire-client" class="panneau panneau-formulaire-client" hidden>
      <div class="entete-formulaire-client">
        <div>
          <h2 id="titre-formulaire">Ajouter un client</h2>
          <p>Les champs marqués d’un astérisque sont obligatoires.</p>
        </div>
      </div>
      <form id="formulaire" class="formulaire-client">
        <div class="grille-formulaire-client">
          <label for="client-nom"><span class="libelle-champ">Nom <span aria-hidden="true">*</span></span>
            <input id="client-nom" name="nom" autocomplete="family-name" required>
          </label>
          <label for="client-prenom"><span class="libelle-champ">Prénom <span aria-hidden="true">*</span></span>
            <input id="client-prenom" name="prenom" autocomplete="given-name" required>
          </label>
          <label for="client-telephone"><span class="libelle-champ">Téléphone <span aria-hidden="true">*</span></span>
            <input id="client-telephone" name="telephone" type="tel" autocomplete="tel" required>
          </label>
          <label for="client-email"><span class="libelle-champ">Adresse e-mail</span>
            <input id="client-email" name="email" type="email" autocomplete="email">
          </label>
          <label for="client-permis"><span class="libelle-champ">Numéro de permis <span aria-hidden="true">*</span></span>
            <input id="client-permis" name="numero_permis" required>
          </label>
          <label for="client-adresse"><span class="libelle-champ">Adresse</span>
            <input id="client-adresse" name="adresse" autocomplete="street-address">
          </label>
        </div>
        <div class="actions-formulaire-client">
          <button type="submit" id="btn-valider" class="bouton-principal">Ajouter</button>
          <button type="button" id="btn-annuler" class="bouton-secondaire" hidden>Annuler</button>
        </div>
      </form>
    </section>

    <section class="section-tableau section-clients" aria-labelledby="titre-liste-clients">
      <div class="entete-section-tableau">
        <div>
          <h2 id="titre-liste-clients">Liste des clients</h2>
          <p id="nombre-clients">Chargement des clients…</p>
        </div>
      </div>
      <div class="tableau-defilant tableau-clients">
        <table>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nom</th>
              <th scope="col">Prénom</th>
              <th scope="col">Téléphone</th>
              <th scope="col">E-mail</th>
              <th scope="col">Permis</th>
              <th scope="col">Adresse</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody id="corps"></tbody>
        </table>
      </div>
    </section>
  `;

  const corps = conteneur.querySelector("#corps");
  const formulaire = conteneur.querySelector("#formulaire");
  const panneauFormulaire = conteneur.querySelector("#panneau-formulaire-client");
  const titre = conteneur.querySelector("#titre-formulaire");
  const btnAjouter = conteneur.querySelector("#btn-ajouter-client");
  const btnValider = conteneur.querySelector("#btn-valider");
  const btnAnnuler = conteneur.querySelector("#btn-annuler");
  const message = conteneur.querySelector("#message-clients");
  const nombreClients = conteneur.querySelector("#nombre-clients");

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
    nombreClients.textContent = `${clients.length} client${clients.length > 1 ? "s" : ""}`;

    if (clients.length === 0) {
      corps.innerHTML = `
        <tr>
          <td class="tableau-vide" colspan="8">
            <div class="etat-vide-clients">
              <span class="etat-vide-icone" aria-hidden="true">♙</span>
              <strong>Aucun client pour le moment</strong>
              <span>Ajoutez un client pour le voir apparaître dans cette liste.</span>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    corps.innerHTML = clients
      .map(
        (client) => `
          <tr>
            <td class="identifiant-client">${client.id_client}</td>
            <td class="nom-client">${echapper(client.nom)}</td>
            <td>${echapper(client.prenom)}</td>
            <td>${echapper(client.telephone)}</td>
            <td>${echapper(client.email)}</td>
            <td>${echapper(client.numero_permis)}</td>
            <td>${echapper(client.adresse)}</td>
            <td>
              <div class="actions-ligne-client">
                <button type="button" class="bouton-secondaire" data-action="modifier" data-id="${client.id_client}">Modifier</button>
                <button type="button" class="bouton-danger" data-action="supprimer" data-id="${client.id_client}">Supprimer</button>
              </div>
            </td>
          </tr>
        `
      )
      .join("");
  }

  async function charger() {
    nombreClients.textContent = "Chargement des clients…";
    corps.innerHTML = `
      <tr>
        <td class="chargement-clients" colspan="8">
          <span class="indicateur-chargement" aria-hidden="true"></span>
          Chargement des clients…
        </td>
      </tr>
    `;

    try {
      clients = await api.lister("/clients/");
      dessiner();
    } catch (erreur) {
      clients = [];
      nombreClients.textContent = "Les clients n’ont pas pu être chargés.";
      corps.innerHTML = `
        <tr>
          <td class="tableau-vide" colspan="8">Les données ne sont pas disponibles.</td>
        </tr>
      `;
      afficherMessage(`Erreur lors du chargement : ${messageErreur(erreur)}`);
    }
  }

  function annuler() {
    formulaire.reset();
    enModification = null;
    titre.textContent = "Ajouter un client";
    btnValider.textContent = "Ajouter";
    panneauFormulaire.hidden = true;
    btnAjouter.hidden = false;
    btnAjouter.setAttribute("aria-expanded", "false");
    effacerMessage();
    btnAjouter.focus();
  }

  btnAjouter.addEventListener("click", () => {
    formulaire.reset();
    enModification = null;
    titre.textContent = "Ajouter un client";
    btnValider.textContent = "Ajouter";
    btnAnnuler.hidden = false;
    ouvrirFormulaire();
    formulaire.elements.nom.focus();
  });

  formulaire.addEventListener("submit", async (e) => {
    e.preventDefault();
    effacerMessage();

    const donnees = Object.fromEntries(new FormData(formulaire));
    donnees.email = donnees.email || null;
    donnees.adresse = donnees.adresse || null;

    try {
      if (enModification) {
        await api.modifier("/clients/", enModification, donnees);
      } else {
        await api.ajouter("/clients/", donnees);
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
      const client = clients.find((element) => element.id_client === id);
      if (!client) return;

      formulaire.elements.nom.value = client.nom;
      formulaire.elements.prenom.value = client.prenom;
      formulaire.elements.telephone.value = client.telephone;
      formulaire.elements.email.value = client.email ?? "";
      formulaire.elements.numero_permis.value = client.numero_permis;
      formulaire.elements.adresse.value = client.adresse ?? "";
      enModification = id;
      titre.textContent = "Modifier le client";
      btnValider.textContent = "Enregistrer";
      btnAnnuler.hidden = false;
      ouvrirFormulaire();
      formulaire.elements.nom.focus();
    }

    if (bouton.dataset.action === "supprimer") {
      if (!confirm("Supprimer ce client ?")) return;
      effacerMessage();
      try {
        await api.supprimer("/clients/", id);
        await charger();
      } catch (erreur) {
        afficherMessage(`Suppression impossible : ${messageErreur(erreur)}`);
      }
    }
  });

  charger();
}
