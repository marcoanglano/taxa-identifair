import { Routes, Route, Link } from "react-router-dom";

import Identify from "./pages/Identify";
import SpeciesDetail from "./pages/SpeciesDetail";
import SpeciesList from "./pages/SpeciesList";

export default function App() {
  return (
    <div>
      <nav style={{ padding: 10, borderBottom: "1px solid #ddd" }}>
        <Link to="/" style={{ marginRight: 10 }}>Home</Link>
        <Link to="/species" style={{ marginRight: 10 }}>Species</Link>
        <Link to="/identify">Identify</Link>
      </nav>

      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/identify" element={<Identify />} />
        <Route path="/species" element={<SpeciesList />} />
        {/* Dettaglio specie aggregato (maschio + femmina) identificato dal nome scientifico */}
        <Route path="/species/:scientificName" element={<SpeciesDetail />} />
      </Routes>
    </div>
  );
}