// ##### IMPORTS #####
// LIB
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
// COMPONENTS
import Error from "./components/Error";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
// PAGES
import Home from "./pages/Home";
import Changelog from "./pages/Changelog";
import Identify from "./pages/Identify";
import SpeciesDetail from "./pages/SpeciesDetail";
import SpeciesList from "./pages/SpeciesList";
import Test from "./pages/Test";
// SERVICES
import { getIdentificationDataset } from "./services/dataService";
// TITLE & SUBTITLE
import { title, subtitle } from "../package.json";

export default function App() {


  // ##### PRE-LOAD DATASET #####
  // Triggers background dataset pre-fetching on mount.
  const [releaseInfo, setReleaseInfo] = useState(null);
  useEffect(() => {
    getIdentificationDataset()
    .then((res) => { if (res?.release) { setReleaseInfo(res.release); } })
    .catch((err) => { console.warn("Background dataset pre-fetch failed:", err); });
  }, []);


  // ##### RENDERING #####
  // Root Application Layout & Router Component
  // Coordinates top-level routes and the layout structure (Header, Main, Footer).
  return (
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

          <Route path="/changelog" element={<Changelog />} />
          <Route path="/identify" element={<Identify />} />
          <Route path="/species/:id" element={<SpeciesDetail />} />
          <Route path="/species" element={<SpeciesList />} />
          <Route path="/test" element={<Test />} />

          {/* Catch all: */}
          <Route path="*" element={<Error title="404" id="404" />} />
        </Routes>
      </main>

      {/* FOOTER */}
      <Footer releaseInfo={releaseInfo} />
    </div>
  );
}
