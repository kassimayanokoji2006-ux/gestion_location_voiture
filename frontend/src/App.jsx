import { useState } from "react";
import Clients from "./pages/clients";
import Categories from "./pages/categories";

function App() {
  const [page, setPage] = useState("clients");

  return (
    <div>
      <nav>
        <button onClick={() => setPage("clients")}>Clients</button>
        <button onClick={() => setPage("categories")}>Catégories</button>
      </nav>

      {page === "clients" && <Clients />}
      {page === "categories" && <Categories />}
    </div>
  );
}

export default App;