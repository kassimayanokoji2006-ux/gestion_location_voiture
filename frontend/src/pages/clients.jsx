import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/clients/";

const VIDE = {
  nom: "",
  prenom: "",
  telephone: "",
  email: "",
  numero_permis: "",
  adresse: "",
};

function Clients() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(VIDE);
  const [enModification, setEnModification] = useState(null);

  const charger = () => {
    axios.get(API).then((res) => setClients(res.data));
  };

  useEffect(() => {
    charger();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const donnees = {
      ...form,
      email: form.email || null,
      adresse: form.adresse || null,
    };

    const requete = enModification
      ? axios.put(`${API}${enModification}/`, donnees)
      : axios.post(API, donnees);

    requete
      .then(() => {
        charger();
        annuler();
      })
      .catch((err) => {
        alert("Erreur : " + JSON.stringify(err.response?.data));
      });
  };

  const modifier = (c) => {
    setForm({
      nom: c.nom,
      prenom: c.prenom,
      telephone: c.telephone,
      email: c.email || "",
      numero_permis: c.numero_permis,
      adresse: c.adresse || "",
    });
    setEnModification(c.id_client);
  };

  const supprimer = (id) => {
    if (window.confirm("Supprimer ce client ?")) {
      axios
        .delete(`${API}${id}/`)
        .then(() => charger())
        .catch((err) => {
          alert("Erreur : " + JSON.stringify(err.response?.data));
        });
    }
  };

  const annuler = () => {
    setForm(VIDE);
    setEnModification(null);
  };

  return (
    <div>
      <h1>Gestion des clients</h1>

      <form onSubmit={handleSubmit}>
        <h2>{enModification ? "Modifier le client" : "Ajouter un client"}</h2>
        <input name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} required />
        <input name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleChange} required />
        <input name="telephone" placeholder="Téléphone" value={form.telephone} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="numero_permis" placeholder="Numéro de permis" value={form.numero_permis} onChange={handleChange} required />
        <input name="adresse" placeholder="Adresse" value={form.adresse} onChange={handleChange} />
        <button type="submit">{enModification ? "Enregistrer" : "Ajouter"}</button>
        {enModification && (
          <button type="button" onClick={annuler}>Annuler</button>
        )}
      </form>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Téléphone</th>
            <th>Email</th>
            <th>Permis</th>
            <th>Adresse</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id_client}>
              <td>{c.id_client}</td>
              <td>{c.nom}</td>
              <td>{c.prenom}</td>
              <td>{c.telephone}</td>
              <td>{c.email}</td>
              <td>{c.numero_permis}</td>
              <td>{c.adresse}</td>
              <td>
                <button onClick={() => modifier(c)}>Modifier</button>
                <button onClick={() => supprimer(c.id_client)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Clients;