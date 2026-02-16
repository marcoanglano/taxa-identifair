// TO DO [SUPABASE]: accordions.

// LIBRARIES & SUPABASE
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// STYLES
import "../styles/SpeciesList.css";

export default function SpeciesList() {
  // STATES
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FETCHING DATA
  useEffect(() => {
    async function fetchSpecies(){
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
      .from("species")
      .select("id_species, scientific_name, family, genus")
      .order("family", { ascending: true })
      .order("genus", { ascending: true })
      .order("scientific_name", { ascending: true });
      
      if (error) {
        setError(error.message);
        setSpecies([]);
      } else {
        setSpecies(data ?? []);
      }

      setLoading(false);
    }
  
    fetchSpecies();
  }, []);

  // RENDERING
  return (
    <section>
      <h2>Species List</h2>
      <p>Select a species to view details.</p>

      {loading && <p>Loading species...</p>}
      {!loading && error && <p style={{ color: "crimson" }}>{error}</p>}

      {/* SPECIES LIST */}
      {!loading && !error && (
        <ul className="species-list">
          {species.map((sp) => (
            <li key={sp.id_species}>
              <Link to={`/species/${sp.id_species}`}>
                <span>
                  <b>{sp.family}: </b><em>{sp.scientific_name}</em>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
