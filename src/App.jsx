import { Routes, Route, Link } from "react-router-dom";

import "./styles/App.css";

import Identify from "./pages/Identify";
import SpeciesDetail from "./pages/SpeciesDetail";
import SpeciesList from "./pages/SpeciesList";

export default function App() {
  return (
    <div className="app-root">
      <nav className="app-nav">
        <div className="app-navInner">
          {/* Brand (centrato) */}
          <div className="app-brand">
            <span className="app-brandTitle">ZP id - ZooPlankton identifier</span>
            <span className="app-brandSubtitle">Calanoida</span>
          </div>

          {/* Links (a sinistra) */}
          <div className="app-navLinks">
            <Link to="/" className="app-link">Home</Link>
            <Link to="/species" className="app-link">Species</Link>
            <Link to="/identify" className="app-link">Identify</Link>
          </div>
        </div>
      </nav>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<h1>Home</h1>} />
          <Route path="/identify" element={<Identify />} />
          <Route path="/species" element={<SpeciesList />} />
          <Route path="/species/:id_species" element={<SpeciesDetail />} />
        </Routes>
      </main>
      
      {/* Footer */}
      <footer className="app-footer">
        <div className="app-footerInner">
          {/* Left */}
          <div className="app-footerLeft"></div>

          {/* Center */}
          <div className="app-footerCenter">
            ZP id - ZooPlankton identifier © Marco Anglano 2025
          </div>

          {/* Right */}
          <div className="app-footerRight">
            v0.2.01
          </div>
        </div>
      </footer>
    </div>
  );
}