import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/paiements/";
const API_RESERVATIONS = "http://127.0.0.1:8000/api/reservations/";

const VIDE = {
  reservation: "",
  montant: "",
  mode_paiement: "especes",
  reference: "",
};

function Paiements() {
  const [paiements, setPaiements] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState(VIDE);
  const [enModification, setEnModification] = useState(null);

  const charger = () => {
    axios.get(API).then((res) => setPaiements(res.data));
  };

  useEffect(() => {
    charger();
    axios.get(API_RESERVATIONS).then((res) => setReservations(res.data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resteAPayer = () => {
    const r = reservations.find(
      (x) => String(x.id_reservation) === String(form.reservation)
    );
    if (!r) return null;
    const dejaPaye = paiements
      .filter(
        (p) =>
          String(p.reservation) === String(form.reservation) &&
          p.id_paiement !== enModification
      )
      .reduce((somme, p) => somme + Number(p.montant), 0);
    return Number(r.montant_total) - dejaPaye;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const donnees = { ...form, reference: form.reference || null };

    const requete = enModification
      ? axios.put(`${API}${enModification}/`, donnees)
      : axios.post(API, donnees);

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

  const modifier = (p) => {
    setForm({
      reservation: p.reservation,
      montant: p.montant,
      mode_paiement: p.mode_paiement,
      reference: p.reference || "",
    });
    setEnModification(p.id_paiement);
  };

  const supprimer = (id) => {
    if (window.confirm("Supprimer ce paiement ?")) {
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

  const reste = resteAPayer();

  return (
    <div>
      <h1>Gestion des paiements</h1>

      <form onSubmit={handleSubmit}>
        <h2>{enModification ? "Modifier le paiement" : "Nouveau paiement"}</h2>

        <select name="reservation" value={form.reservation} onChange={handleChange} required>
          <option value="">-- Choisir une réservation --</option>
          {reservations.map((r) => (
            <option key={r.id_reservation} value={r.id_reservation}>
              #{r.id_reservation} - {r.client_nom} - {r.voiture_nom} ({Number(r.montant_total).toLocaleString()} Ar)
            </option>
          ))}
        </select>

        {reste !== null && <p>Reste à payer : {reste.toLocaleString()} Ar</p>}

        <input name="montant" type="number" step="0.01" min="0.01" placeholder="Montant" value={form.montant} onChange={handleChange} required />

        <select name="mode_paiement" value={form.mode_paiement} onChange={handleChange}>
          <option value="especes">Espèces</option>
          <option value="mobile_money">Mobile Money</option>
          <option value="carte">Carte</option>
          <option value="virement">Virement</option>
        </select>

        <input name="reference" placeholder="Référence (facultatif)" value={form.reference} onChange={handleChange} />

        <button type="submit">{enModification ? "Enregistrer" : "Payer"}</button>
        {enModification && (
          <button type="button" onClick={annuler}>Annuler</button>
        )}
      </form>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Réservation</th>
            <th>Date</th>
            <th>Montant</th>
            <th>Mode</th>
            <th>Référence</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paiements.map((p) => (
            <tr key={p.id_paiement}>
              <td>{p.id_paiement}</td>
              <td>{p.reservation_info}</td>
              <td>{p.date_paiement}</td>
              <td>{Number(p.montant).toLocaleString()} Ar</td>
              <td>{p.mode_paiement}</td>
              <td>{p.reference}</td>
              <td>
                <button onClick={() => modifier(p)}>Modifier</button>
                <button onClick={() => supprimer(p.id_paiement)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Paiements;