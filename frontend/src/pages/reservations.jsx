import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/reservations/";
const API_CLIENTS = "http://127.0.0.1:8000/api/clients/";
const API_VOITURES = "http://127.0.0.1:8000/api/voitures/";

const VIDE = {
  client: "",
  voiture: "",
  date_debut: "",
  date_fin: "",
  statut: "en_attente",
};

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [clients, setClients] = useState([]);
  const [voitures, setVoitures] = useState([]);
  const [form, setForm] = useState(VIDE);
  const [enModification, setEnModification] = useState(null);

  const charger = () => {
    axios.get(API).then((res) => setReservations(res.data));
  };

  useEffect(() => {
    charger();
    axios.get(API_CLIENTS).then((res) => setClients(res.data));
    axios.get(API_VOITURES).then((res) => setVoitures(res.data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const estimation = () => {
    if (!form.date_debut || !form.date_fin || !form.voiture) return null;
    const v = voitures.find((x) => String(x.id_voiture) === String(form.voiture));
    if (!v) return null;
    const jours = Math.max(
      1,
      Math.round((new Date(form.date_fin) - new Date(form.date_debut)) / 86400000)
    );
    return jours * Number(v.prix_jour);
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
        const data = err.response?.data;
        const message = data?.non_field_errors
          ? data.non_field_errors.join(" ")
          : JSON.stringify(data);
        alert("Erreur : " + message);
      });
  };

  const modifier = (r) => {
    setForm({
      client: r.client,
      voiture: r.voiture,
      date_debut: r.date_debut,
      date_fin: r.date_fin,
      statut: r.statut,
    });
    setEnModification(r.id_reservation);
  };

  const supprimer = (id) => {
    if (window.confirm("Supprimer cette réservation ?")) {
      axios
        .delete(`${API}${id}/`)
        .then(() => charger())
        .catch(() => {
          alert("Suppression impossible : cette réservation a peut-être des paiements.");
        });
    }
  };

  const annuler = () => {
    setForm(VIDE);
    setEnModification(null);
  };

  const total = estimation();

  return (
    <div>
      <h1>Gestion des réservations</h1>

      <form onSubmit={handleSubmit}>
        <h2>{enModification ? "Modifier la réservation" : "Nouvelle réservation"}</h2>

        <select name="client" value={form.client} onChange={handleChange} required>
          <option value="">-- Choisir un client --</option>
          {clients.map((c) => (
            <option key={c.id_client} value={c.id_client}>
              {c.nom} {c.prenom}
            </option>
          ))}
        </select>

        <select name="voiture" value={form.voiture} onChange={handleChange} required>
          <option value="">-- Choisir une voiture --</option>
          {voitures.map((v) => (
            <option key={v.id_voiture} value={v.id_voiture}>
              {v.marque} {v.modele} ({v.immatriculation}) - {Number(v.prix_jour).toLocaleString()} Ar/jour
            </option>
          ))}
        </select>

        <label>
          Du
          <input name="date_debut" type="date" value={form.date_debut} onChange={handleChange} required />
        </label>
        <label>
          Au
          <input name="date_fin" type="date" value={form.date_fin} onChange={handleChange} required />
        </label>

        <select name="statut" value={form.statut} onChange={handleChange}>
          <option value="en_attente">En attente</option>
          <option value="confirmee">Confirmée</option>
          <option value="terminee">Terminée</option>
          <option value="annulee">Annulée</option>
        </select>

        {total !== null && <p>Montant estimé : {total.toLocaleString()} Ar</p>}

        <button type="submit">{enModification ? "Enregistrer" : "Réserver"}</button>
        {enModification && (
          <button type="button" onClick={annuler}>Annuler</button>
        )}
      </form>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Voiture</th>
            <th>Du</th>
            <th>Au</th>
            <th>Statut</th>
            <th>Montant total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id_reservation}>
              <td>{r.id_reservation}</td>
              <td>{r.client_nom}</td>
              <td>{r.voiture_nom}</td>
              <td>{r.date_debut}</td>
              <td>{r.date_fin}</td>
              <td>{r.statut}</td>
              <td>{Number(r.montant_total).toLocaleString()} Ar</td>
              <td>
                <button onClick={() => modifier(r)}>Modifier</button>
                <button onClick={() => supprimer(r.id_reservation)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Reservations;