// TO DO [SUPABASE]: full list from the database, with correct styling.

// LIBRARIES
import { Link } from "react-router-dom";

export default function SpeciesList() {
  return (
    <section>
      <h2>Species List</h2>
      <p>Work in progress</p>
      <ul className="species-list">
        <li><Link to="/species/1">Species 1</Link></li>
        <li><Link to="/species/2">Species 2</Link></li>
        <li><Link to="/species/3">Species 3</Link></li>
      </ul>
    </section>
  )
}
