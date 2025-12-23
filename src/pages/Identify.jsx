import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import "../styles/Identify.css";

// ======================
// Helpers (pure functions)
// ======================
const hasText = (v) => v != null && String(v).trim().length > 0;

// In v0.2 states are always arrays (default '{}'), but keep it safe:
const isNoDataState = (states) =>
  states === null || (Array.isArray(states) && states.length === 0);

const includesSelected = (states, selectedIdState) =>
  Array.isArray(states) && states.includes(String(selectedIdState));

const buildNotesByTrait = (selectedFilters, byTrait) =>
  selectedFilters.map((f) => {
    const n = byTrait[f.traitId]?.notes;
    return hasText(n)
      ? { note: String(n).trim(), traitIconUrl: f.traitIconUrl ?? null }
      : null;
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
    if (!note || !hasText(note.note)) return null;

    const noteKey = `${sp.id_species}__${sp.sex}__${rowKey}__t${idx}`;

    return (
      <span key={noteKey} className="id-noteWrap">
        <div
          className="id-noteIcon"
          onMouseEnter={() => setHoverNoteKey(noteKey)}
          onMouseLeave={() =>
            setHoverNoteKey((prev) => (prev === noteKey ? null : prev))
          }
        >
          {note.traitIconUrl ? (
            <span
              className="id-noteTraitIconMask"
              style={{ "--icon-url": `url(${note.traitIconUrl})` }}
            />
          ) : (
            "i"
          )}
        </div>

        {hoverNoteKey === noteKey && (
          <div className="id-noteTooltip">{note.note}</div>
        )}
      </span>
    );
  });
}

function SpeciesRow({ entry, type, hoverNoteKey, setHoverNoteKey }) {
  const sp = entry.species;
  const sex = String(sp.sex || "").toUpperCase();
  const sexClass = sex === "F" ? "is-f" : "is-m";
  const rowKey = `${sp.id_species}__${sp.sex}__${type}`;

  return (
    <div
      className={`id-resultCard ${sexClass} ${
        type === "nodata" ? "is-nodata" : ""
      }`}
    >
      <div className="id-resultTop">
        <div className="id-resultText">
          <div className="id-resultSci">
            <Link
              className="id-resultLink"
              to={`/species/${encodeURIComponent(sp.id_species)}`}
            >
              <em>{sp.scientific_name}</em>
            </Link>
          </div>

          <div className="id-resultMeta">
            {sp.family} — <em>{sp.genus}</em>
          </div>
        </div>

        <div className="id-resultRightBits">
          <div className="id-resultSex" aria-label={`Sex ${sex}`}>
            {sex}
          </div>

          <div className="id-resultIconSlot" aria-hidden="true">
            <NoteIcons
              notesByTrait={entry.notesByTrait}
              rowKey={rowKey}
              sp={sp}
              hoverNoteKey={hoverNoteKey}
              setHoverNoteKey={setHoverNoteKey}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TraitBlock({
  trait,
  selectedStateId,
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
            onMouseEnter={() => setHoverTraitId(trait.id_trait)}
            onMouseLeave={() =>
              setHoverTraitId((prev) => (prev === trait.id_trait ? null : prev))
            }
          >
            ?
          </div>
        )}
      </div>

      {/* Tooltip (trait description + optional icon) */}
      {trait.description && hoverTraitId === trait.id_trait && (
        <div className="id-traitTooltip">
          {trait.description_url && (
            <div className="id-traitTooltipImgWrap">
              <img
                src={trait.description_url}
                alt={trait.trait_name}
                className="id-traitTooltipImg"
              />
            </div>
          )}
          <div>{trait.description}</div>
        </div>
      )}

      {/* State buttons (from trait_states) */}
      <div className="id-states">
        {(trait.states || []).map((st) => {
          const isActive = selectedStateId === st.id_state;

          return (
            <button
              key={`${trait.id_trait}__${st.id_state}`}
              type="button"
              className={`id-accIconBtn ${isActive ? "is-selected" : ""}`}
              onClick={() => onSelectState(trait, st)}
              aria-label={st.state_label}
              data-tooltip={st.state_label}
            >
              <span
                className="id-traitIconMask"
                style={{ "--icon-url": `url(${st.state_icon_url})` }}
              />
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
              key={trait.id_trait}
              trait={trait}
              selectedStateId={selectedStateByTraitId[trait.id_trait]}
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
  // [{ traitId, traitName, stateId, stateLabel }]
  const [selectedFilters, setSelectedFilters] = useState([]);

  // traitId -> selected stateId (for "active" UI)
  const selectedStateByTraitId = useMemo(() => {
    const obj = {};
    for (const f of selectedFilters) obj[f.traitId] = f.stateId;
    return obj;
  }, [selectedFilters]);

  // ---- Results state ----
  const [matches, setMatches] = useState([]); // [{ species, notesByTrait }]
  const [noDataMatches, setNoDataMatches] = useState([]); // [{ species, notesByTrait }]
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchesError, setMatchesError] = useState(null);

  // ---- Tooltip state ----
  const [hoverTraitId, setHoverTraitId] = useState(null);
  const [hoverNoteKey, setHoverNoteKey] = useState(null);

  // ======================
  // Fetch: traits + trait_states (grouped by category)
  // ======================
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingTraits(true);
      setTraitsError(null);

      const { data, error } = await supabase
        .from("traits")
        .select(
          `
          id_trait,
          trait_category,
          trait_name,
          description,
          description_url,
          trait_icon_url,
          trait_states (
            id_state,
            state_label,
            sort_order,
            state_icon_url
          )
        `
        )
        .order("trait_category", { ascending: true })
        .order("trait_name", { ascending: true })
        .order("sort_order", { foreignTable: "trait_states", ascending: true });

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
        const states = Array.isArray(row.trait_states) ? row.trait_states : [];
        if (states.length === 0) continue;

        const cat = row.trait_category || "Other";
        if (!byCat[cat]) byCat[cat] = [];

        byCat[cat].push({
          ...row,
          states,
        });
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
          id_species,
          id_trait,
          f_states,
          f_notes,
          m_states,
          m_notes,
          species:species (
            id_species,
            scientific_name,
            family,
            genus
          )
        `
        )
        .in("id_trait", traitIds);

      if (!alive) return;

      if (error) {
        console.error(error);
        setMatchesError(error.message);
        setLoadingMatches(false);
        return;
      }

      // Build 2 “virtual entries” per species (F and M)
      const bySpeciesSex = new Map();

      for (const row of data || []) {
        if (!row.species) continue;

        const spBase = row.species;

        // FEMALE
        {
          const key = `${spBase.id_species}__F`;
          if (!bySpeciesSex.has(key)) {
            bySpeciesSex.set(key, {
              species: { ...spBase, sex: "F" },
              byTrait: {},
            });
          }
          bySpeciesSex.get(key).byTrait[row.id_trait] = {
            state: row.f_states,
            notes: row.f_notes,
          };
        }

        // MALE
        {
          const key = `${spBase.id_species}__M`;
          if (!bySpeciesSex.has(key)) {
            bySpeciesSex.set(key, {
              species: { ...spBase, sex: "M" },
              byTrait: {},
            });
          }
          bySpeciesSex.get(key).byTrait[row.id_trait] = {
            state: row.m_states,
            notes: row.m_notes,
          };
        }
      }

      const present = [];
      const noData = [];

      for (const entry of bySpeciesSex.values()) {
        const sp = entry.species;
        const byTrait = entry.byTrait;

        let okAll = true;
        let hasAnyNoData = false;

        for (const f of selectedFilters) {
          const info = byTrait[f.traitId];

          if (!info) {
            hasAnyNoData = true;
            okAll = false;
            continue;
          }

          const states = info.state;

          if (isNoDataState(states)) {
            hasAnyNoData = true;
            okAll = false;
            continue;
          }

          if (!includesSelected(states, f.stateId)) okAll = false;
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
  const handleSelectState = (trait, st) => {
    setSelectedFilters((prev) => {
      const idx = prev.findIndex((f) => f.traitId === trait.id_trait);
      if (idx >= 0) {
        const copy = prev.slice();
        copy[idx] = {
          ...copy[idx],
          stateId: st.id_state,
          stateLabel: st.state_label,
          traitIconUrl: trait.trait_icon_url ?? copy[idx].traitIconUrl ?? null,
        };
        return copy;
      }
      return [
        ...prev,
        {
          traitId: trait.id_trait,
          traitName: trait.trait_name,
          stateId: st.id_state,
          stateLabel: st.state_label,
          traitIconUrl: trait.trait_icon_url ?? null,
        },
      ];
    });
  };

  return (
    <div className="id-page">
      {/* LEFT: traits accordion */}
      <div className="id-left">
        <header className="page-header">
          <h1>Identify</h1>
          <p className="page-subtitle">Key for adult calanoid copepods only.</p>
        </header>

        {loadingTraits && <p>Loading traits...</p>}
        {traitsError && <p className="id-err">Error: {traitsError}</p>}

        {!loadingTraits && !Object.keys(traitsByCategory).length && (
          <p>No traits with states found.</p>
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
                  <strong>{f.traitName}</strong> = <code>{f.stateLabel}</code>
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
                key={`${entry.species.id_species}__${entry.species.sex}__match`}
                entry={entry}
                type="match"
                hoverNoteKey={hoverNoteKey}
                setHoverNoteKey={setHoverNoteKey}
              />
            ))}
          </div>
        )}

        {!loadingMatches &&
          selectedFilters.length > 0 &&
          noDataMatches.length > 0 && (
            <div className="id-nodata">
              <h3 className="id-nodataTitle">No data:</h3>
              <p className="id-nodataHelp">
                Species for which at least one selected trait has no recorded
                state.
              </p>

              {noDataMatches.map((entry) => (
                <SpeciesRow
                  key={`${entry.species.id_species}__${entry.species.sex}__nodata`}
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
