import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Link } from "react-router-dom";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Identify() {
  const [traitsByCategory, setTraitsByCategory] = useState({});
  const [loadingTraits, setLoadingTraits] = useState(true);
  const [traitsError, setTraitsError] = useState(null);

  const [openCategory, setOpenCategory] = useState(null);

  // ✅ Multi-filters (ordine di selezione preservato)
  // [{ traitId, traitName, state }]
  const [selectedFilters, setSelectedFilters] = useState([]);

  // utile per evidenziare i bottoni attivi per ogni trait
  const selectedStateByTraitId = useMemo(() => {
    const obj = {};
    for (const f of selectedFilters) obj[f.traitId] = f.state;
    return obj;
  }, [selectedFilters]);

  const [matches, setMatches] = useState([]); // [{ species, notes }]
  const [noDataMatches, setNoDataMatches] = useState([]); // [{ species, notes }]
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchesError, setMatchesError] = useState(null);

  // tooltip trait (?)
  const [hoverTraitId, setHoverTraitId] = useState(null);
  // tooltip specie (i)
  const [hoverNoteKey, setHoverNoteKey] = useState(null); 
  // es: "speciesId__sex__match__t0"

  // Carica tutti i traits e raggruppali per trait_category
  useEffect(() => {
    async function loadTraits() {
      setLoadingTraits(true);
      setTraitsError(null);

      const { data, error } = await supabase
        .from("traits")
        .select(
          "id, trait_category, trait_name, description, possible_states, image_url"
        )
        .order("trait_category", { ascending: true })
        .order("trait_name", { ascending: true });

      if (error) {
        console.error(error);
        setTraitsError(error.message);
        setLoadingTraits(false);
        return;
      }

      const byCat = {};
      for (const row of data || []) {
        if (!row.possible_states || row.possible_states.length === 0) continue;

        const cat = row.trait_category || "Other";
        if (!byCat[cat]) byCat[cat] = [];
        byCat[cat].push(row);
      }

      setTraitsByCategory(byCat);
      setLoadingTraits(false);
    }

    loadTraits();
  }, []);

  // ✅ Carica matches con N filtri
  useEffect(() => {
    async function loadMatches() {
      if (!selectedFilters.length) {
        setMatches([]);
        setNoDataMatches([]);
        return;
      }

      setLoadingMatches(true);
      setMatchesError(null);

      const traitIds = selectedFilters.map((f) => f.traitId);

      const { data, error } = await supabase
        .from("species_traits")
        .select(
          `
          trait_id,
          state,
          notes,
          species:species_id (
            id,
            scientific_name,
            sex,
            family,
            genus
          )
        `
        )
        .in("trait_id", traitIds);

      if (error) {
        console.error(error);
        setMatchesError(error.message);
        setLoadingMatches(false);
        return;
      }

      // Mappa: speciesKey -> { species, byTrait: {trait_id: {state, notes}} }
      const bySpecies = new Map();

      for (const row of data || []) {
        if (!row.species) continue;

        const sp = row.species;
        const speciesKey = `${sp.id}__${sp.sex}`;

        if (!bySpecies.has(speciesKey)) {
          bySpecies.set(speciesKey, { species: sp, byTrait: {} });
        }

        bySpecies.get(speciesKey).byTrait[row.trait_id] = {
          state: row.state,
          notes: row.notes,
        };
      }

      const present = [];
      const noData = [];

      for (const entry of bySpecies.values()) {
        const sp = entry.species;
        const byTrait = entry.byTrait;

        let okAll = true;
        let hasAnyNoData = false;

        for (const f of selectedFilters) {
          const info = byTrait[f.traitId];

          // se manca proprio la riga per quel trait → trattiamo come no data
          if (!info) {
            hasAnyNoData = true;
            okAll = false;
            continue;
          }

          const states = info.state; // text[] oppure null
          const isNoData =
            states === null || (Array.isArray(states) && states.length === 0);

          if (isNoData) {
            hasAnyNoData = true;
            okAll = false;
            continue;
          }

          const hasSelected =
            Array.isArray(states) && states.includes(String(f.state));

          if (!hasSelected) {
            okAll = false;
          }
        }

        if (okAll) {
          // ⚠️ notes: per ora prendiamo la prima non-vuota trovata (semplice),
          // poi la gestiamo meglio quando mi spieghi la tua idea.
          const notesByTrait = selectedFilters.map((f) => {
            const n = byTrait[f.traitId]?.notes;
            return n != null && String(n).trim().length > 0 ? String(n).trim() : null;
          });

          // poi nel push:
          present.push({ species: sp, notesByTrait });
        } else if (hasAnyNoData) {
          const notesByTrait = selectedFilters.map((f) => {
            const n = byTrait[f.traitId]?.notes;
            return n != null && String(n).trim().length > 0 ? String(n).trim() : null;
          });

          noData.push({ species: sp, notesByTrait });
        }
      }

      const sortEntries = (list) =>
        list.slice().sort((a, b) => {
          const sa = a.species;
          const sb = b.species;
          if (sa.family !== sb.family) return sa.family.localeCompare(sb.family);
          if (sa.genus !== sb.genus) return sa.genus.localeCompare(sb.genus);
          if (sa.scientific_name !== sb.scientific_name)
            return sa.scientific_name.localeCompare(sb.scientific_name);
          return sa.sex.localeCompare(sb.sex);
        });

      setMatches(sortEntries(present));
      setNoDataMatches(sortEntries(noData));
      setLoadingMatches(false);
    }

    loadMatches();
  }, [selectedFilters]);

  const handleToggleCategory = (cat) => {
    setOpenCategory((prev) => (prev === cat ? null : cat));
  };

  // ✅ selezione: se trait già presente aggiorna solo lo state (mantiene ordine),
  // altrimenti aggiunge in fondo (nuovo numero)
  const handleSelectState = (trait, state) => {
    setSelectedFilters((prev) => {
      const idx = prev.findIndex((f) => f.traitId === trait.id);
      if (idx >= 0) {
        const copy = prev.slice();
        copy[idx] = { ...copy[idx], state };
        return copy;
      }
      return [...prev, { traitId: trait.id, traitName: trait.trait_name, state }];
    });
  };

  const hasNotes = (notes) => notes != null && String(notes).trim().length > 0;

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        gap: "40px",
        alignItems: "flex-start",
      }}
    >
      {/* Colonna sinistra: traits / tendine */}
      <div style={{ flex: 1, minWidth: "300px" }}>
        <h1>Identify</h1>

        {loadingTraits && <p>Loading traits...</p>}
        {traitsError && <p style={{ color: "red" }}>Error: {traitsError}</p>}

        {!loadingTraits && !Object.keys(traitsByCategory).length && (
          <p>No traits with possible_states found.</p>
        )}

        {Object.entries(traitsByCategory).map(([cat, traits]) => (
          <div
            key={cat}
            style={{
              border: "1px solid #ccc",
              borderRadius: "6px",
              marginBottom: "10px",
            }}
          >
            {/* Header tendina */}
            <button
              onClick={() => handleToggleCategory(cat)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                background: "#f5f5f5",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#222",
              }}
            >
              <span>{cat.toUpperCase()}</span>
              <span>{openCategory === cat ? "▴" : "▾"}</span>
            </button>

            {/* Contenuto tendina */}
            {openCategory === cat && (
              <div
                style={{
                  padding: "8px 10px",
                  background: "#fafafa",
                  color: "#222",
                }}
              >
                {traits.map((trait) => (
                  <div
                    key={trait.id}
                    style={{
                      marginBottom: "10px",
                      position: "relative",
                    }}
                  >
                    {/* Nome tratto + icona ? */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "4px",
                      }}
                    >
                      <div style={{ fontWeight: "bold" }}>
                        {trait.trait_name}
                      </div>

                      {trait.description && (
                        <div
                          onMouseEnter={() => setHoverTraitId(trait.id)}
                          onMouseLeave={() =>
                            setHoverTraitId((prev) =>
                              prev === trait.id ? null : prev
                            )
                          }
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            border: "1px solid #888",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            cursor: "default",
                            backgroundColor: "#f0f0f0",
                            color: "#333",
                          }}
                        >
                          ?
                        </div>
                      )}
                    </div>

                    {/* Tooltip descrizione tratto */}
                    {trait.description && hoverTraitId === trait.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: "0px",
                          left: "160px",
                          width: "260px",
                          background: "#ffffff",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          padding: "6px 8px",
                          fontSize: "0.8rem",
                          color: "#000",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                          zIndex: 20,
                          pointerEvents: "none",
                        }}
                      >
                        {trait.image_url && (
                          <div style={{ marginBottom: "6px", textAlign: "center" }}>
                            <img
                              src={trait.image_url}
                              alt={trait.trait_name}
                              style={{
                                maxWidth: "100%",
                                maxHeight: "280px",
                                objectFit: "contain",
                                borderRadius: "3px",
                              }}
                            />
                          </div>
                        )}
                        <div>{trait.description}</div>
                      </div>
                    )}

                    {/* Bottoni degli states */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {(trait.possible_states || []).map((state) => {
                        const isActive = selectedStateByTraitId[trait.id] === state;

                        return (
                          <button
                            key={state}
                            onClick={() => handleSelectState(trait, state)}
                            style={{
                              padding: "4px 10px",
                              fontSize: "0.85rem",
                              borderRadius: "12px",
                              border: isActive
                                ? "2px solid #0077cc"
                                : "1px solid #ccc",
                              backgroundColor: isActive
                                ? "#e6f2ff"
                                : "#f9f9f9",
                              color: "#222",
                              cursor: "pointer",
                              transition: "0.15s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                isActive ? "#d9eaff" : "#ececec";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                isActive ? "#e6f2ff" : "#f9f9f9";
                            }}
                          >
                            {state}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Colonna destra: risultati (specie) */}
      <div style={{ flex: 1 }}>
        <h2>Matching species:</h2>

        {!selectedFilters.length ? (
          <p>Select one or more trait states to see matching species.</p>
        ) : (
          <div style={{ fontSize: "0.9rem" }}>
            <div style={{ marginBottom: "6px" }}>
              Filters (order of selection):
            </div>
            <ol style={{ marginTop: 0, paddingLeft: "18px" }}>
              {selectedFilters.map((f, idx) => (
                <li key={`${f.traitId}__${idx}`}>
                  <strong>{f.traitName}</strong> = <code>{f.state}</code>
                </li>
              ))}
            </ol>
          </div>
        )}

        {loadingMatches && <p>Loading matching species...</p>}
        {matchesError && <p style={{ color: "red" }}>Error: {matchesError}</p>}

        {!loadingMatches && selectedFilters.length > 0 && matches.length === 0 && (
          <p>No species found for this combination.</p>
        )}

        {/* SPECIE MATCH */}
        {!loadingMatches && matches.length > 0 && (
          <div style={{ marginTop: "10px" }}>
            {matches.map((entry) => {
              const sp = entry.species;
              const key = `${sp.id}__${sp.sex}__match`;
              
              return (
                <div
                  key={key}
                  style={{
                    borderBottom: "1px solid #eee",
                    padding: "4px 0",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div>
                      <Link to={`/species/${encodeURIComponent(sp.scientific_name)}`}>
                        <em>{sp.scientific_name}</em>
                      </Link>{" "}
                      <span style={{ fontSize: "0.85rem" }}>({sp.sex})</span>
                    </div>

                    {/* Icone info per-tratto (i1, i2, ...) */}
                    {(entry.notesByTrait || []).map((note, idx) => {
                      if (note == null || String(note).trim().length === 0) return null;

                      const noteKey = `${sp.id}__${sp.sex}__${key}__t${idx}`;

                      return (
                        <span key={noteKey} style={{ position: "relative", display: "inline-block" }}>
                          <div
                            onMouseEnter={() => setHoverNoteKey(noteKey)}
                            onMouseLeave={() =>
                              setHoverNoteKey((prev) => (prev === noteKey ? null : prev))
                            }
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              border: "1px solid #888",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.7rem",
                              cursor: "default",
                              backgroundColor: "#eef3ff",
                              color: "#333",
                              marginLeft: "4px",
                              userSelect: "none",
                            }}
                          >
                            i{idx + 1}
                          </div>

                          {/* Tooltip */}
                          {hoverNoteKey === noteKey && (
                            <div
                              style={{
                                position: "absolute",
                                top: "24px",
                                left: "0px",
                                width: "260px",
                                background: "#ffffff",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                padding: "6px 8px",
                                fontSize: "0.8rem",
                                color: "#000",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                                zIndex: 50,
                                pointerEvents: "none",
                              }}
                            >
                              {note}
                            </div>
                          )}
                        </span>
                      );
                    })}
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "#555" }}>
                    {sp.family} – <i>{sp.genus}</i>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* NO DATA */}
        {!loadingMatches && selectedFilters.length > 0 && noDataMatches.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h3>No data:</h3>
            <p style={{ fontSize: "0.8rem", color: "#666" }}>
              Species for which at least one selected trait has no recorded state.
            </p>

            {noDataMatches.map((entry) => {
              const sp = entry.species;
              const key = `${sp.id}__${sp.sex}__nodata`;
              
              return (
                <div
                  key={key}
                  style={{
                    borderBottom: "1px dashed #eee",
                    padding: "4px 0",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div>
                      <Link to={`/species/${encodeURIComponent(sp.scientific_name)}`}>
                        <em>{sp.scientific_name}</em>
                      </Link>{" "}
                      <span style={{ fontSize: "0.85rem" }}>({sp.sex})</span>
                    </div>

                    {/* Icone info per-tratto (i1, i2, ...) */}
                    {(entry.notesByTrait || []).map((note, idx) => {
                      if (note == null || String(note).trim().length === 0) return null;

                      const noteKey = `${sp.id}__${sp.sex}__${key}__t${idx}`;

                      return (
                        <span key={noteKey} style={{ position: "relative", display: "inline-block" }}>
                          <div
                            onMouseEnter={() => setHoverNoteKey(noteKey)}
                            onMouseLeave={() =>
                              setHoverNoteKey((prev) => (prev === noteKey ? null : prev))
                            }
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              border: "1px solid #888",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.7rem",
                              cursor: "default",
                              backgroundColor: "#eef3ff",
                              color: "#333",
                              marginLeft: "4px",
                              userSelect: "none",
                            }}
                          >
                            i{idx + 1}
                          </div>

                          {/* Tooltip */}
                          {hoverNoteKey === noteKey && (
                            <div
                              style={{
                                position: "absolute",
                                top: "24px",
                                left: "0px",
                                width: "260px",
                                background: "#ffffff",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                padding: "6px 8px",
                                fontSize: "0.8rem",
                                color: "#000",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                                zIndex: 50,
                                pointerEvents: "none",
                              }}
                            >
                              {note}
                            </div>
                          )}
                        </span>
                      );
                    })}
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "#777" }}>
                    {sp.family} – <i>{sp.genus}</i>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}