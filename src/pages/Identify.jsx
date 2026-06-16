// ========== IMPORTS ==========
// COMPONENTS
import Skeleton from "../components/Skeleton";
// STYLES
import "../styles/Identify.css";


export default function Identify() {


  // ========== RENDERING ==========
  return (
    <section id="identify-container">


      {/* ===== LEFT COLUMN ===== */}
      <div id="left-column">
        <h3 id="identify-title">Identify</h3>
        <div id="filters-traits-container">
          <div className="filters-color" id="filters-container">
            <h4>Filters</h4>
            <p>Here I have to put filters (with check boxes).</p>
          </div>
          <div id="traits-container">
            <h4>Traits</h4>
            <p>Here I have to put traits (with accordions).</p>
          </div>
        </div>
      </div>


      {/* ===== RIGHT COLUMN ===== */}
      <div id="right-column">
        <h4 id="match-title">Matching Species</h4>
        <p>Here I have to put the matching species (and traits de-selection?).</p>
      </div>
    </section>
  )
}
