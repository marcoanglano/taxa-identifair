// LIBRARIES
import { Route, Routes } from "react-router-dom";

// COMPONENTS
import Navbar from "./components/Navbar";

// PAGES
import Error from "./pages/Error";
import Home from "./pages/Home";
import Identify from "./pages/Identify";
import SpeciesDetail from "./pages/SpeciesDetail";
import SpeciesList from "./pages/SpeciesList";

// STYLES
import "./styles/App.css";

export default function App() {
  return (
    <>
      <div className="app-container">
        {/* HEADER */}
        <header className="app-header">
          <div className="app-brand">
            <h1>ZPid - ZooPlankton identifier</h1>
            <h2>Interactive identification of adult Calanoida</h2>
          </div>
          <Navbar />
        </header>

        {/* ROUTES */}
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/species" element={<SpeciesList />} />
            <Route path="/species/:id" element={<SpeciesDetail />} />
            <Route path="/identify" element={<Identify />} />
            {/* Catch all: */}
            <Route path="*" element={<Error />} />
          </Routes>
        </main>

        {/* FOOTER */}
        <footer className="app-footer">
          ZPid - ZooPlankton identifier v0.03.11.00 © copyright 2025-{new Date().getFullYear()}
        </footer>
      </div>
    </>
  );
}
