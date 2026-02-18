// TO DO [NAVBAR]: horizontal, fixed to the top.
// TO DO [FOOTER]: fixed to the bottom, auto-update version?

// LIBRARIES
import { Link, Route, Routes } from 'react-router-dom';

// PAGES
import Home from './pages/Home';
import Identify from './pages/Identify';
import SpeciesDetail from './pages/SpeciesDetail';
import SpeciesList from './pages/SpeciesList';

// STYLES
import './styles/App.css';

export default function App() {
  return (
    <>

      {/* HEADER */}
      <header className="app-header">
        <div className="app-brand">
          <h1>ZPid - ZooPlankton identifier</h1>
          <p>Interactive identification of adult Calanoida</p>
        </div>
        <nav className="app-nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/species">Species List</Link></li>
            <li><Link to="/identify">Identify</Link></li>
          </ul>
        </nav>
      </header>

      {/* ROUTES */}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/species" element={<SpeciesList />} />
          <Route path="/species/:id" element={<SpeciesDetail />} />
          <Route path="/identify" element={<Identify />} />
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} ZPid - ZooPlankton identifier - v0.03.05.00</p>
      </footer>
      
    </>
  );
}
