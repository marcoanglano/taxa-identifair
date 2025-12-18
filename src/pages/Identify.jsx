import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import "../styles/Identify.css";

// ======================
// Helpers (pure functions)
// ======================
const hasText = (v) => v != null && String(v).trim().length > 0;

const isNoDataState = (states) =>
  states === null || (Array.isArray(states) && states.length === 0);

const includesSelected = (states, selected) =>
  Array.isArray(states) && states.includes(String(selected));

const buildNotesByTrait = (selectedFilters, byTrait) =>
  selectedFilters.map((f) => {
    const n = byTrait[f.traitId]?.notes;
    return hasText(n) ? String(n).trim() : null;
  });

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

// ======================
// Small UI bits (local)
// ======================
function NoteIcons({ notesByTrait, rowKey, sp, hoverNoteKey, setHoverNoteKey }) {
  return (notesByTrait || []).map((note, idx) => {
    if (!hasText(note)) return null;

    const noteKey = `${sp.id}__${sp.sex}__${rowKey}__t${idx}`;

    return (
      <span key={noteKey} className="id-noteWrap">
        <div
          className="id-noteIcon"
          onMouseEnter={() => setHoverNoteKey(noteKey)}
          onMouseLeave={() =>
            setHoverNoteKey((prev) => (prev === noteKey ? null : prev))
          }
        >
          i{idx + 1}
        </div>

        {hoverNoteKey === noteKey && (
          <div className="id-noteTooltip">{note}</div>
        )}
      </span>
    );
  });
}

function SpeciesRow({ entry, type, hoverNoteKey, setHoverNoteKey }) {
  const sp = entry.species;
  const rowKey = `${sp.id}__${sp.sex}__${type}`;
  const rowClass = type === "match" ? "id-row--match" : "id-row--nodata";

  return (
    <div className={`id-row ${rowClass}`}>
      <div className="id-rowTop">
        <div className="id-rowName">
          <Link to={`/species/${encodeURIComponent(sp.scientific_name)}`}>
            <em>{sp.scientific_name}</em>
          </Link>{" "}
          <span className="id-rowSex">({sp.sex})</span>
        </div>

        <NoteIcons
          notesByTrait={entry.notesByTrait}
          rowKey={rowKey}
          sp={sp}
          hoverNoteKey={hoverNoteKey}
          setHoverNoteKey={setHoverNoteKey}
        />
      </div>

      <div className={`id-rowMeta ${type === "match" ? "id-rowMeta--match" : "id-rowMeta--nodata"}`}>
        {sp.family} – <i>{sp.genus}</i>
      </div>
    </div>
  );
}

function TraitBlock({
  trait,
  selectedState,
  onSelectState,
  hoverTraitId,
  setHoverTraitId,
}) {
  return (
    <div className="id-traitBlock">
      {/* Title + "?" tooltip */}
      <div className="id-traitHeader">
        <div className="id-traitName">{trait.trait_name}</div>

        {trait.description && (
          <div
            className="id-qIcon"
            onMouseEnter={() => setHoverTraitId(trait.id)}
            onMouseLeave={() =>
              setHoverTraitId((prev) => (prev === trait.id ? null : prev))
            }
          >
            ?
          </div>
        )}
      </div>

      {/* Tooltip (trait description + optional image) */}
      {trait.description && hoverTraitId === trait.id && (
        <div className="id-traitTooltip">
          {trait.image_url && (
            <div className="id-traitTooltipImgWrap">
              <img
                src={trait.image_url}
                alt={trait.trait_name}
                className="id-traitTooltipImg"
              />
            </div>
          )}
          <div>{trait.description}</div>
        </div>
      )}

      {/* State buttons */}
      <div className="id-states">
        {(trait.possible_states || []).map((state) => {
          const isActive = selectedState === state;

          return (
            <button
              key={state}
              onClick={() => onSelectState(trait, state)}
              className={`id-stateBtn ${isActive ? "id-stateBtn--active" : ""}`}
              type="button"
            >
              {state}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TraitCategoryAccordion({
  cat,
  traits,
  isOpen,
  onToggle,
  selectedStateByTraitId,
  onSelectState,
  hoverTraitId,
  setHoverTraitId,
}) {
  return (
    <div className="id-acc">
      <button
        className="id-accHeader"
        onClick={() => onToggle(cat)}
        type="button"
      >
        <span>{cat.toUpperCase()}</span>
        <span className="id-accChevron">{isOpen ? "▴" : "▾"}</span>
      </button>

      {isOpen && (
        <div className="id-accBody">
          {traits.map((trait) => (
            <TraitBlock
              key={trait.id}
              trait={trait}
              selectedState={selectedStateByTraitId[trait.id]}
              onSelectState={onSelectState}
              hoverTraitId={hoverTraitId}
              setHoverTraitId={setHoverTraitId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ======================
// Main page
// ======================
export default function Identify() {
  // ---- Traits state ----
  const [traitsByCategory, setTraitsByCategory] = useState({});
  const [loadingTraits, setLoadingTraits] = useState(true);
  const [traitsError, setTraitsError] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);

  // ---- Multi-filters (order preserved) ----
  // [{ traitId, traitName, state }]
  const [selectedFilters, setSelectedFilters] = useState([]);

  // traitId -> selected state (for "active" UI)
  const selectedStateByTraitId = useMemo(() => {
    const obj = {};
    for (const f of selectedFilters) obj[f.traitId] = f.state;
    return obj;
  }, [selectedFilters]);

  // ---- Results state ----
  const [matches, setMatches] = useState([]); // [{ species, notesByTrait }]
  const [noDataMatches, setNoDataMatches] = useState([]); // [{ species, notesByTrait }]
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchesError, setMatchesError] = useState(null);

  // ---- Tooltip state ----
  const [hoverTraitId, setHoverTraitId] = useState(null); // "?"
  const [hoverNoteKey, setHoverNoteKey] = useState(null); // (i1), (i2), ...

  // ======================
  // Fetch: traits (grouped by category)
  // ======================
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingTraits(true);
      setTraitsError(null);

      const { data, error } = await supabase
        .from("traits")
        .select("id, trait_category, trait_name, description, possible_states, image_url")
        .order("trait_category", { ascending: true })
        .order("trait_name", { ascending: true });

      if (!alive) return;

      if (error) {
        console.error(error);
        setTraitsError(error.message);
        setTraitsByCategory({});
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
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ======================
  // Fetch + matching: species_traits for N filters
  // ======================
  useEffect(() => {
    let alive = true;

    (async () => {
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

      if (!alive) return;

      if (error) {
        console.error(error);
        setMatchesError(error.message);
        setLoadingMatches(false);
        return;
      }

      // speciesKey -> { species, byTrait: { traitId: { state, notes } } }
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

          // Missing row -> treat as "no data"
          if (!info) {
            hasAnyNoData = true;
            okAll = false;
            continue;
          }

          const states = info.state; // text[] or null

          if (isNoDataState(states)) {
            hasAnyNoData = true;
            okAll = false;
            continue;
          }

          if (!includesSelected(states, f.state)) okAll = false;
        }

        const notesByTrait = buildNotesByTrait(selectedFilters, byTrait);

        if (okAll) present.push({ species: sp, notesByTrait });
        else if (hasAnyNoData) noData.push({ species: sp, notesByTrait });
      }

      setMatches(sortEntries(present));
      setNoDataMatches(sortEntries(noData));
      setLoadingMatches(false);
    })();

    return () => {
      alive = false;
    };
  }, [selectedFilters]);

  // ======================
  // UI handlers
  // ======================
  const handleToggleCategory = (cat) => {
    setOpenCategory((prev) => (prev === cat ? null : cat));
  };

  // If trait already selected: update state (keep order). Else: push at end.
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

  return (
    <div className="id-page">
      {/* LEFT: traits accordion */}
      <div className="id-left">
        <h1 className="id-title">Identify</h1>

        {loadingTraits && <p>Loading traits...</p>}
        {traitsError && <p className="id-err">Error: {traitsError}</p>}

        {!loadingTraits && !Object.keys(traitsByCategory).length && (
          <p>No traits with possible_states found.</p>
        )}

        {Object.entries(traitsByCategory).map(([cat, traits]) => (
          <TraitCategoryAccordion
            key={cat}
            cat={cat}
            traits={traits}
            isOpen={openCategory === cat}
            onToggle={handleToggleCategory}
            selectedStateByTraitId={selectedStateByTraitId}
            onSelectState={handleSelectState}
            hoverTraitId={hoverTraitId}
            setHoverTraitId={setHoverTraitId}
          />
        ))}
      </div>

      {/* RIGHT: results */}
      <div className="id-right">
        <h2 className="id-subtitle">Matching species:</h2>

        {!selectedFilters.length ? (
          <p>Select one or more trait states to see matching species.</p>
        ) : (
          <div className="id-filters">
            <div className="id-filtersTitle">Filters (order of selection):</div>
            <ol className="id-filtersList">
              {selectedFilters.map((f, idx) => (
                <li key={`${f.traitId}__${idx}`}>
                  <strong>{f.traitName}</strong> = <code>{f.state}</code>
                </li>
              ))}
            </ol>
          </div>
        )}

        {loadingMatches && <p>Loading matching species...</p>}
        {matchesError && <p className="id-err">Error: {matchesError}</p>}

        {!loadingMatches && selectedFilters.length > 0 && matches.length === 0 && (
          <p>No species found for this combination.</p>
        )}

        {!loadingMatches && matches.length > 0 && (
          <div className="id-results">
            {matches.map((entry) => (
              <SpeciesRow
                key={`${entry.species.id}__${entry.species.sex}__match`}
                entry={entry}
                type="match"
                hoverNoteKey={hoverNoteKey}
                setHoverNoteKey={setHoverNoteKey}
              />
            ))}
          </div>
        )}

        {!loadingMatches && selectedFilters.length > 0 && noDataMatches.length > 0 && (
          <div className="id-nodata">
            <h3 className="id-nodataTitle">No data:</h3>
            <p className="id-nodataHelp">
              Species for which at least one selected trait has no recorded state.
            </p>

            {noDataMatches.map((entry) => (
              <SpeciesRow
                key={`${entry.species.id}__${entry.species.sex}__nodata`}
                entry={entry}
                type="nodata"
                hoverNoteKey={hoverNoteKey}
                setHoverNoteKey={setHoverNoteKey}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
