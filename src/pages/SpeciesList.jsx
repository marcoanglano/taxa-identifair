// LIBRARIES & SUPABASE
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// COMPONENTS
import Accordion from "../components/Accordion";

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


  // GROUPING: group species by family to be used in the Accordion component
  const accordionItems = useMemo(() => {
    const groups = species.reduce((acc, sp) => {
      const fam = sp.family ?? "Unknown Family";
      if (!acc[fam]) acc[fam] = [];
      acc[fam].push(sp);
      return acc;
    }, {});

    return Object.entries(groups).map(([family, list]) => ({
      id: family,
      title: `${family} (${list.length})`,
      content: (
        <ul className="species-list">
          {list.map((sp) => (
            <li key={sp.id_species}>
              <Link to={`/species/${sp.id_species}`}>
                <span>
                  <em>{sp.scientific_name}</em>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )
    }));
  }, [species]);


  // RENDERING
  return (
    <section>
      <h2>Species List</h2>
      <p>Select a species to view details.</p>

      {loading && <p>Loading species...</p>}
      {!loading && error && <p style={{ color: "crimson" }}>{error}</p>}

      {/* ACCORDIONS FOR SPECIES LIST */}
      {!loading && !error && (
        <Accordion
          items={accordionItems}
          defaultAllOpen={false}
          singleOpen={true}
        />
      )}
    </section>
  );
}
