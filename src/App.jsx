import { Routes, Route, Link } from "react-router-dom";

import "./App.css";

import Identify from "./pages/Identify";
import SpeciesDetail from "./pages/SpeciesDetail";
import SpeciesList from "./pages/SpeciesList";

export default function App() {
  return (
    <div>
      <nav className="app-nav">
        <div className="app-navInner">
          <Link to="/" className="app-link">Home</Link>
          <Link to="/species" className="app-link">Species</Link>
          <Link to="/identify" className="app-link">Identify</Link>
        </div>
      </nav>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<h1>Home</h1>} />
          <Route path="/identify" element={<Identify />} />
          <Route path="/species" element={<SpeciesList />} />
          {/* Dettaglio specie aggregato (maschio + femmina) identificato dal nome scientifico */}
          <Route path="/species/:scientificName" element={<SpeciesDetail />} />
        </Routes>
      </main>
    </div>
  );
}