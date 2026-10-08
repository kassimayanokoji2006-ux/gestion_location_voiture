import { useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/voitures-disponibles/";

function Disponibilites() {
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");
  const [voitures, setVoitures] = useState(null);

  const rechercher = (e) => {
    e.preventDefault();

    axios
      .get(API, { params: { debut, fin } })
      .then((res) => setVoitures(res.data))
      .catch((err) => {
        setVoitures(null);
        alert(err.response?.data?.erreur || "Erreur lors de la recherche.");
      });
  };

  return (
    <div>
      <h1>Voitures disponibles</h1>

      <form onSubmit={rechercher}>
        <label>
          Du
          <input type="date" value={debut} onChange={(e) => setDebut(e.target.value)} required />
        </label>
        <label>
          Au
          <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} required />
        </label>
        <button type="submit">Rechercher</button>
      </form>

      {voitures !== null && (
        <>
          <p>{voitures.length} voiture(s) disponible(s) du {debut} au {fin}</p>

          <table border="1" cellPadding="8">
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
              {voitures.map((v) => (
                <tr key={v.id_voiture}>
                  <td>{v.immatriculation}</td>
                  <td>{v.marque}</td>
                  <td>{v.modele}</td>
                  <td>{v.categorie_libelle}</td>
                  <td>{v.carburant}</td>
                  <td>{Number(v.prix_jour).toLocaleString()} Ar</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default Disponibilites;