// ##### IMPORTS #####
// LIB
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
// COMPONENTS
import Navbar from "./components/Navbar";
// PAGES
import Error from "./components/Error";
import Home from "./pages/Home";
import Identify from "./pages/Identify";
import SpeciesDetail from "./pages/SpeciesDetail";
import SpeciesList from "./pages/SpeciesList";
import Test from "./pages/Test";
// SERVICES
import { getIdentificationDataset } from "./services/dataService";
// VERSION
import { authors, title, subtitle, version } from "../package.json";

export default function App() {


  // ##### PRE-LOAD DATASET #####
  useEffect(() => {
    getIdentificationDataset().catch((err) => {
      console.warn("Pre-fetch del dataset fallito in background:", err);
    });
  }, []);


  // ##### FUNCTION: COPY CONTACT #####
  function copyContact() {
    navigator.clipboard.writeText(authors.email)
      .then(() => {
        alert("Email copied to clipboard!");
      })
      .catch((error) => {
        console.error("Failed to copy contact email:", error);
      });
  }


  // ##### RENDERING #####
  return (
    <>
      <div className="app-container">

        {/* HEADER */}
        <header id="app-header">
          <div id="app-brand">
            <h1 id="title">{title}</h1>
            <h2 id="subtitle">{subtitle}</h2>
          </div>
          <Navbar />
        </header>

        {/* MAIN & ROUTES */}
        <main id="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/species" element={<SpeciesList />} />
            <Route path="/species/:id" element={<SpeciesDetail />} />
            <Route path="/identify" element={<Identify />} />
            <Route path="/test" element={<Test />} />
            {/* Catch all: */}
            <Route path="*" element={<Error title="404" id="404" />} />
          </Routes>
        </main>

        {/* FOOTER */}
        <footer id="app-footer">
          <p id="footer-text">
            {title} v{version} © {authors.name}, 2025-{new Date().getFullYear()}.
            Contact: <span id="copy-contact" onClick={copyContact}>{authors.email}</span>
          </p>
        </footer>
      </div>
    </>
  );
}
