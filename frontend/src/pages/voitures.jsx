import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/voitures/";
const API_CATEGORIES = "http://127.0.0.1:8000/api/categories/";

const VIDE = {
  immatriculation: "",
  marque: "",
  modele: "",
  annee: "",
  couleur: "",
  carburant: "Essence",
  prix_jour: "",
  statut: "disponible",
  categorie: "",
};

function Voitures() {
  const [voitures, setVoitures] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(VIDE);
  const [enModification, setEnModification] = useState(null);

  const charger = () => {
    axios.get(API).then((res) => setVoitures(res.data));
  };

  useEffect(() => {
    charger();
    axios.get(API_CATEGORIES).then((res) => setCategories(res.data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const donnees = {
      ...form,
      annee: form.annee || null,
      couleur: form.couleur || null,
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

  const modifier = (v) => {
    setForm({
      immatriculation: v.immatriculation,
      marque: v.marque,
      modele: v.modele,
      annee: v.annee || "",
      couleur: v.couleur || "",
      carburant: v.carburant,
      prix_jour: v.prix_jour,
      statut: v.statut,
      categorie: v.categorie,
    });
    setEnModification(v.id_voiture);
  };

  const supprimer = (id) => {
    if (window.confirm("Supprimer cette voiture ?")) {
      axios
        .delete(`${API}${id}/`)
        .then(() => charger())
        .catch(() => {
          alert("Suppression impossible : cette voiture a peut-être des réservations.");
        });
    }
  };

  const annuler = () => {
    setForm(VIDE);
    setEnModification(null);
  };

  return (
    <div>
      <h1>Gestion des voitures</h1>

      <form onSubmit={handleSubmit}>
        <h2>{enModification ? "Modifier la voiture" : "Ajouter une voiture"}</h2>

        <input name="immatriculation" placeholder="Immatriculation" value={form.immatriculation} onChange={handleChange} required />
        <input name="marque" placeholder="Marque" value={form.marque} onChange={handleChange} required />
        <input name="modele" placeholder="Modèle" value={form.modele} onChange={handleChange} required />
        <input name="annee" type="number" min="1990" max="2100" placeholder="Année" value={form.annee} onChange={handleChange} />
        <input name="couleur" placeholder="Couleur" value={form.couleur} onChange={handleChange} />

        <select name="carburant" value={form.carburant} onChange={handleChange}>
          <option value="Essence">Essence</option>
          <option value="Diesel">Diesel</option>
          <option value="Hybride">Hybride</option>
          <option value="Electrique">Électrique</option>
        </select>

        <input name="prix_jour" type="number" step="0.01" min="0" placeholder="Prix par jour" value={form.prix_jour} onChange={handleChange} required />

        <select name="statut" value={form.statut} onChange={handleChange}>
          <option value="disponible">Disponible</option>
          <option value="loue">Loué</option>
          <option value="maintenance">Maintenance</option>
        </select>

        <select name="categorie" value={form.categorie} onChange={handleChange} required>
          <option value="">-- Choisir une catégorie --</option>
          {categories.map((c) => (
            <option key={c.id_categorie} value={c.id_categorie}>
              {c.libelle}
            </option>
          ))}
        </select>

        <button type="submit">{enModification ? "Enregistrer" : "Ajouter"}</button>
        {enModification && (
          <button type="button" onClick={annuler}>Annuler</button>
        )}
      </form>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Immatriculation</th>
            <th>Marque</th>
            <th>Modèle</th>
            <th>Année</th>
            <th>Couleur</th>
            <th>Carburant</th>
            <th>Prix/jour</th>
            <th>Statut</th>
            <th>Catégorie</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {voitures.map((v) => (
            <tr key={v.id_voiture}>
              <td>{v.id_voiture}</td>
              <td>{v.immatriculation}</td>
              <td>{v.marque}</td>
              <td>{v.modele}</td>
              <td>{v.annee}</td>
              <td>{v.couleur}</td>
              <td>{v.carburant}</td>
              <td>{Number(v.prix_jour).toLocaleString()} Ar</td>
              <td>{v.statut}</td>
              <td>{v.categorie_libelle}</td>
              <td>
                <button onClick={() => modifier(v)}>Modifier</button>
                <button onClick={() => supprimer(v.id_voiture)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Voitures;