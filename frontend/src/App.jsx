import { useState } from "react";
import Clients from "./pages/clients";
import Categories from "./pages/categories";
import Voitures from "./pages/voitures";
import Reservations from "./pages/reservations";

function App() {
  const [page, setPage] = useState("clients");

  return (
    <div>
      <nav>
        <button onClick={() => setPage("clients")}>Clients</button>
        <button onClick={() => setPage("categories")}>Catégories</button>
        <button onClick={() => setPage("voitures")}>Voitures</button>
        <button onClick={() => setPage("reservations")}>Réservations</button>
      </nav>

      {page === "clients" && <Clients />}
      {page === "categories" && <Categories />}
      {page === "voitures" && <Voitures />}
      {page === "reservations" && <Reservations />}
    </div>
  );
}

export default App;