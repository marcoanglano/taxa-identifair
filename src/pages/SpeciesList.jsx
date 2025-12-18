import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import "../styles/SpeciesList.css";

export default function SpeciesList() {
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("species")
        .select("family, genus, scientific_name")
        .order("family")
        .order("genus")
        .order("scientific_name");

      if (!alive) return;

      if (error) {
        console.error(error);
        setError(error.message);
        setSpecies([]);
        setLoading(false);
        return;
      }

      const seen = new Set();
      const unique = [];
      for (const row of data || []) {
        if (seen.has(row.scientific_name)) continue;
        seen.add(row.scientific_name);
        unique.push(row);
      }

      setSpecies(unique);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ✅ Hook sempre chiamato (anche quando loading=true)
  const rows = useMemo(() => {
    let lastFamily = null;
    let lastGenus = null;

    return species.map((sp) => {
      const showFamily = sp.family !== lastFamily;
      const showGenus = showFamily || sp.genus !== lastGenus;

      lastFamily = sp.family;
      lastGenus = sp.genus;

      return {
        ...sp,
        showFamily,
        showGenus,
        key: `${sp.family}__${sp.genus}__${sp.scientific_name}`,
        encodedName: encodeURIComponent(sp.scientific_name),
      };
    });
  }, [species]);

  // ---- Guard clauses (dopo gli hook) ----
  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!rows.length) return <p>No species found.</p>;

  return (
    <div className="sl-page">
      <h1 className="sl-title">Species List</h1>

      {rows.map((sp) => (
        <div key={sp.key} className="sl-item">
          {sp.showFamily && <h2 className="sl-family">{sp.family}</h2>}
          {sp.showGenus && <h3 className="sl-genus">{sp.genus}</h3>}

          <div className="sl-species">
            <Link to={`/species/${sp.encodedName}`}>
              <em>{sp.scientific_name}</em>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
