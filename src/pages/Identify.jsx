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
        <h3>Identify</h3>
        <p>Here I have to put filters (with check boxes) and traits (with accordions).</p>
      </div>


      {/* ===== RIGHT COLUMN ===== */}
      <div id="right-column">
        <h4 id="match-title">Matching Species</h4>
        <p>Here I have to put the matching species (and traits de-selection?).</p>
      </div>
    </section>
  )
}
