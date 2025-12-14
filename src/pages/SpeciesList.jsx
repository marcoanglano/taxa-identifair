import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import "./SpeciesList.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function SpeciesList() {
  // =========================
  // State: lista specie (uniche) + loading
  // =========================
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // Fetch: species (dedupe per scientific_name)
  // Nota: in DB hai F/M duplicati, qui vogliamo 1 voce per specie
  // =========================
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data } = await supabase
        .from("species")
        .select("family, genus, scientific_name")
        .order("family")
        .order("genus")
        .order("scientific_name");

      // Dedupe preservando l’ordine già ordinato dal DB
      const seen = new Set();
      const unique = [];
      for (const row of data || []) {
        if (seen.has(row.scientific_name)) continue;
        seen.add(row.scientific_name);
        unique.push(row);
      }

      if (!alive) return;
      setSpecies(unique);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  // =========================
  // Preparazione righe: decide quando mostrare Family / Genus
  // =========================
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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="sl-page">
      <h1 className="sl-title">Elenco specie</h1>

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
