import { useState } from "react";
import Clients from "./pages/clients";
import Categories from "./pages/categories";
import Voitures from "./pages/voitures";
import Reservations from "./pages/reservations";
import Paiements from "./pages/paiement";
import Disponibilites from "./pages/disponibilites";

function App() {
  const [page, setPage] = useState("clients");

  return (
    <div>
      <nav>
        <button onClick={() => setPage("clients")}>Clients</button>
        <button onClick={() => setPage("categories")}>Catégories</button>
        <button onClick={() => setPage("voitures")}>Voitures</button>
        <button onClick={() => setPage("reservations")}>Réservations</button>
        <button onClick={() => setPage("paiements")}>Paiements</button>
        <button onClick={() => setPage("disponibilites")}>Disponibilités</button>
      </nav>

      {page === "clients" && <Clients />}
      {page === "categories" && <Categories />}
      {page === "voitures" && <Voitures />}
      {page === "reservations" && <Reservations />}
      {page === "paiements" && <Paiements />}
      {page === "disponibilites" && <Disponibilites />}
    </div>
  );
}

export default App;