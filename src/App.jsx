// LIBRARIES
import { Route, Routes } from 'react-router-dom';

// COMPONENTS
import Navbar from './components/Navbar';

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
      <div className='app-container'>
        {/* HEADER */}
        <header className='app-header'>
          <div className='app-brand'>
            <h1>ZPid - ZooPlankton identifier</h1>
            <p>Interactive identification of adult Calanoida</p>
          </div>
          <Navbar />
        </header>

        {/* ROUTES */}
        <main className='app-main'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/species' element={<SpeciesList />} />
            <Route path='/species/:id' element={<SpeciesDetail />} />
            <Route path='/identify' element={<Identify />} />
          </Routes>
        </main>

        {/* FOOTER */}
        <footer className='app-footer'>
          ZPid - ZooPlankton identifier v0.03.05.02 © copyright 2025-{new Date().getFullYear()}
        </footer>
      </div>
    </>
  );
}
