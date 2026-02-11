// IMPORTS
import Home from "./pages/Home";
import Identify from "./pages/Identify";
import SpeciesDetail from "./pages/SpeciesDetail";
import SpeciesList from "./pages/SpeciesList";

import "./styles/App.css";

import { Link, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <>

      {/* TITLE, SUBTITLE, NAVBAR */}
      {/* TO DO: horizontal navbar */}
      <header>
        <h1>ZPid - ZooPlankton identifier</h1>
        <p>Interactive identification of adult Calanoida</p>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/species">Species List</Link></li>
            <li><Link to="/identify">Identify</Link></li>
          </ul>
        </nav>
      </header>

      {/* ROUTES */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/species" element={<SpeciesList />} />
          <Route path="/species/:id" element={<SpeciesDetail />} />
          <Route path="/identify" element={<Identify />} />
        </Routes>
      </main>

      {/* COPYRIGHT, VERSION */}
      {/* TO DO: fixed to the bottom, auto-update version? */}
      <footer>
        <p>© 2026 ZPid - ZooPlankton identifier - v0.03.01.00</p>
      </footer>
      
    </>
  );
}
