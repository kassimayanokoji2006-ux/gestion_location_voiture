import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/tableau-de-bord/";

const carte = {
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "16px",
  minWidth: "160px",
};

function nombreParStatut(liste, statut) {
  const ligne = liste.find((l) => l.statut === statut);
  return ligne ? ligne.nombre : 0;
}

function TableauDeBord() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(API).then((res) => setStats(res.data));
  }, []);

  if (stats === null) {
    return <p>Chargement...</p>;
  }

  const argent = (valeur) => Number(valeur).toLocaleString() + " Ar";

  return (
    <div>
      <h1>Tableau de bord</h1>

      <h2>Parc de voitures</h2>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div style={carte}>
          <h3>Disponibles</h3>
          <p>{nombreParStatut(stats.voitures, "disponible")}</p>
        </div>
        <div style={carte}>
          <h3>Louées</h3>
          <p>{nombreParStatut(stats.voitures, "loue")}</p>
        </div>
        <div style={carte}>
          <h3>En maintenance</h3>
          <p>{nombreParStatut(stats.voitures, "maintenance")}</p>
        </div>
      </div>

      <h2>Réservations</h2>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div style={carte}>
          <h3>En attente</h3>
          <p>{nombreParStatut(stats.reservations, "en_attente")}</p>
        </div>
        <div style={carte}>
          <h3>Confirmées</h3>
          <p>{nombreParStatut(stats.reservations, "confirmee")}</p>
        </div>
        <div style={carte}>
          <h3>Terminées</h3>
          <p>{nombreParStatut(stats.reservations, "terminee")}</p>
        </div>
        <div style={carte}>
          <h3>Annulées</h3>
          <p>{nombreParStatut(stats.reservations, "annulee")}</p>
        </div>
      </div>

      <h2>Finances</h2>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div style={carte}>
          <h3>Total facturé</h3>
          <p>{argent(stats.finances.total_facture)}</p>
        </div>
        <div style={carte}>
          <h3>Total encaissé</h3>
          <p>{argent(stats.finances.total_encaisse)}</p>
        </div>
        <div style={carte}>
          <h3>Reste à encaisser</h3>
          <p>{argent(stats.finances.total_reste)}</p>
        </div>
      </div>

      <h2>Top 5 des voitures les plus louées</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Voiture</th>
            <th>Immatriculation</th>
            <th>Réservations</th>
            <th>Chiffre d'affaires</th>
          </tr>
        </thead>
        <tbody>
          {stats.top_voitures.map((v) => (
            <tr key={v.immatriculation}>
              <td>{v.marque} {v.modele}</td>
              <td>{v.immatriculation}</td>
              <td>{v.nb_reservations}</td>
              <td>{argent(v.chiffre_affaires)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TableauDeBord;