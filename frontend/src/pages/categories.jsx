import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/categories/";

const VIDE = {
  libelle: "",
  description: "",
  tarif_base_jour: "",
};

function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(VIDE);
  const [enModification, setEnModification] = useState(null);

  const charger = () => {
    axios.get(API).then((res) => setCategories(res.data));
  };

  useEffect(() => {
    charger();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requete = enModification
      ? axios.put(`${API}${enModification}/`, form)
      : axios.post(API, form);

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
      libelle: c.libelle,
      description: c.description || "",
      tarif_base_jour: c.tarif_base_jour,
    });
    setEnModification(c.id_categorie);
  };

  const supprimer = (id) => {
    if (window.confirm("Supprimer cette catégorie ?")) {
      axios
        .delete(`${API}${id}/`)
        .then(() => charger())
        .catch(() => {
          alert("Suppression impossible : cette catégorie est peut-être utilisée par des voitures.");
        });
    }
  };

  const annuler = () => {
    setForm(VIDE);
    setEnModification(null);
  };

  return (
    <div>
      <h1>Gestion des catégories</h1>

      <form onSubmit={handleSubmit}>
        <h2>{enModification ? "Modifier la catégorie" : "Ajouter une catégorie"}</h2>
        <input name="libelle" placeholder="Libellé (ex. SUV)" value={form.libelle} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="tarif_base_jour" type="number" step="0.01" min="0" placeholder="Tarif par jour" value={form.tarif_base_jour} onChange={handleChange} required />
        <button type="submit">{enModification ? "Enregistrer" : "Ajouter"}</button>
        {enModification && (
          <button type="button" onClick={annuler}>Annuler</button>
        )}
      </form>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Libellé</th>
            <th>Description</th>
            <th>Tarif par jour</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id_categorie}>
              <td>{c.id_categorie}</td>
              <td>{c.libelle}</td>
              <td>{c.description}</td>
              <td>{Number(c.tarif_base_jour).toLocaleString()} Ar</td>
              <td>
                <button onClick={() => modifier(c)}>Modifier</button>
                <button onClick={() => supprimer(c.id_categorie)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Categories;