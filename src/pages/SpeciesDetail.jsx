// src/pages/SpeciesDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { ICON_VERSION } from "../lib/assets";
import "../styles/SpeciesDetail.css";

// ======================
// Constants + helpers
// ======================
const SCALE_MAX_MM = 15;

// Render helper: 3 decimals or "-"
const fmt3 = (val) => (val != null ? Number(val).toFixed(3) : "-");

// Mean between min/max, null-safe
const meanLen = (row) =>
  !row || row.min_len == null || row.max_len == null
    ? null
    : (Number(row.min_len) + Number(row.max_len)) / 2;

const clamp01 = (x) => Math.min(1, Math.max(0, x));

const SEX_BARS = [
  { key: "F", label: "Female", color: "sd-f" },
  { key: "M", label: "Male", color: "sd-m" },
];

// Normalize arrays for safe comparisons (order doesn't matter)
const normArr = (arr) =>
  (Array.isArray(arr) ? arr : [])
    .map((x) => String(x))
    .filter(Boolean)
    .sort();

const sameArr = (a, b) => {
  const A = normArr(a);
  const B = normArr(b);
  if (A.length !== B.length) return false;
  for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) return false;
  return true;
};

const hasText = (v) => v != null && String(v).trim().length > 0;
const safeText = (v) => (hasText(v) ? String(v).trim() : "");

// ======================
// Local UI components
// ======================
function ExternalLinks({ wormsLink, razoulsLink }) {
  const hasWorms = wormsLink && String(wormsLink).trim() !== "";
  const hasRazouls =
    razoulsLink &&
    String(razoulsLink).trim() !== "" &&
    String(razoulsLink).trim().toLowerCase() !== "nan";

  if (!hasWorms && !hasRazouls) return null;

  return (
    <div className="sd-links">
      {hasWorms && (
        <div className="sd-linkRow">
          <strong>WoRMS page:</strong>{" "}
          <a href={wormsLink} target="_blank" rel="noreferrer">
            open link
          </a>
        </div>
      )}

      {hasRazouls && (
        <div className="sd-linkRow">
          <strong>Marine Planktonic Copepods page:</strong>{" "}
          <a href={razoulsLink} target="_blank" rel="noreferrer">
            open link
          </a>
        </div>
      )}
    </div>
  );
}

function Scale15mm() {
  return (
    <div className="sd-scaleWrap" aria-label="Total length scale 0–15 mm">
      <div className="sd-scaleLine">
        {Array.from({ length: 16 }, (_, i) => {
          const isMajor = i % 5 === 0;
          return (
            <div
              key={i}
              className={`sd-tick ${isMajor ? "sd-tickMajor" : "sd-tickMinor"}`}
              style={{ left: `${(i / 15) * 100}%` }}
            />
          );
        })}
      </div>

      <div className="sd-scaleLabels">
        <span>0</span>
        <span>5</span>
        <span>10</span>
        <span>15</span>
      </div>

      <div className="sd-scaleUnit">TL mm</div>
    </div>
  );
}

function SexBar({
  row,
  label,
  colorClass,
  scaleMax,
  barKey,
  hoveredKey,
  setHoveredKey,
}) {
  const avg = meanLen(row);
  const hasData = avg != null;
  const widthPct = hasData ? clamp01(avg / scaleMax) * 100 : 0;

  if (!hasData) {
    return (
      <div className={`sd-qmark ${colorClass}`}>
        <b>?</b>
      </div>
    );
  }

  return (
    <div
      className="sd-barWrap"
      onMouseEnter={() => setHoveredKey(barKey)}
      onMouseLeave={() =>
        setHoveredKey((prev) => (prev === barKey ? null : prev))
      }
    >
      <div
        className={`sd-bar ${colorClass} ${
          hoveredKey === barKey ? "sd-barHover" : ""
        }`}
        style={{ width: `${widthPct}%` }}
      />

      {hoveredKey === barKey && (
        <div className={`sd-tooltip ${colorClass}`}>
          <strong>{label}:</strong> {fmt3(row.min_len)} – {fmt3(row.max_len)} mm
        </div>
      )}
    </div>
  );
}

function TraitLegend() {
  return (
    <div className="sd-traitsLegend" aria-label="Sex legend">
      <div className="sd-legendRow">
        <span className="sd-legendSwatch sd-legendSwatch--f" aria-hidden="true" />
        <span>Female</span>
      </div>

      <div className="sd-legendRow">
        <span className="sd-legendSwatch sd-legendSwatch--m" aria-hidden="true" />
        <span>Male</span>
      </div>

      <div className="sd-legendRow">
        <span
          className="sd-legendSwatch sd-legendSwatch--both"
          aria-hidden="true"
        />
        <span>Both</span>
      </div>
    </div>
  );
}

function TraitsAccordion({ cat, isOpen, onToggle, children }) {
  return (
    <div className="sd-acc">
      <button
        className="sd-accHeader"
        type="button"
        onClick={() => onToggle(cat)}
      >
        <span>{String(cat).toUpperCase()}</span>
        <span className="sd-accChevron">{isOpen ? "▴" : "▾"}</span>
      </button>

      {isOpen && <div className="sd-accBody">{children}</div>}
    </div>
  );
}

// ======================
// Main page
// ======================
export default function SpeciesDetail() {
  const { id_species } = useParams();

  const decodedId = useMemo(() => {
    try {
      return decodeURIComponent(id_species || "");
    } catch {
      return "";
    }
  }, [id_species]);

  // ---- Page state ----
  const [base, setBase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bars tooltip state
  const [hoveredKey, setHoveredKey] = useState(null);

  // Traits sidebar state
  const [openTraitCategory, setOpenTraitCategory] = useState(null);
  const [hoverTipKey, setHoverTipKey] = useState(null);

  const [traitsByCategory, setTraitsByCategory] = useState({});
  const [traitStatesMeta, setTraitStatesMeta] = useState({}); // id_state -> { label, icon_url, trait_id }
  const [traitIconByTraitId, setTraitIconByTraitId] = useState({}); // id_trait -> trait_icon_url
  const [speciesTraitsByTrait, setSpeciesTraitsByTrait] = useState({}); // id_trait -> row

  // ---- Data fetch ----
  useEffect(() => {
    if (!decodedId) {
      setLoading(false);
      setBase(null);
      return;
    }

    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      // 1) base species
      const { data: sp, error: spErr } = await supabase
        .from("species")
        .select(
          "id_species, scientific_name, authority, worms_link, razouls_link, family, genus, environment, f_min, f_max, m_min, m_max"
        )
        .eq("id_species", decodedId)
        .single();

      if (!alive) return;

      if (spErr) {
        console.error(spErr);
        setError(spErr.message);
        setBase(null);
        setLoading(false);
        return;
      }

      setBase(sp || null);

      // 2) traits (for categories + neutral icon urls)
      const { data: traitsRows, error: traitsErr } = await supabase
        .from("traits")
        .select("id_trait, trait_category, trait_name, trait_icon_url")
        .order("trait_category", { ascending: true })
        .order("trait_name", { ascending: true });

      if (!alive) return;

      if (traitsErr) {
        console.error(traitsErr);
        setError(traitsErr.message);
        setLoading(false);
        return;
      }

      const byCat = {};
      const iconByTrait = {};
      for (const t of traitsRows || []) {
        const cat = t.trait_category || "Other";
        if (!byCat[cat]) byCat[cat] = [];
        byCat[cat].push(t);
        iconByTrait[t.id_trait] = t.trait_icon_url || "";
      }

      setTraitsByCategory(byCat);
      setTraitIconByTraitId(iconByTrait);

      // 3) trait_states (label + icon_url)
      const { data: stateRows, error: stateErr } = await supabase
        .from("trait_states")
        .select("id_trait, id_state, state_label, sort_order, state_icon_url")
        .order("id_trait", { ascending: true })
        .order("sort_order", { ascending: true });

      if (!alive) return;

      if (stateErr) {
        console.error(stateErr);
        setError(stateErr.message);
        setLoading(false);
        return;
      }

      const meta = {};
      for (const s of stateRows || []) {
        meta[String(s.id_state)] = {
          id_trait: s.id_trait,
          label: s.state_label || s.id_state,
          icon_url: s.state_icon_url || "",
        };
      }
      setTraitStatesMeta(meta);

      // 4) species_traits (for this species)
      const { data: stRows, error: stErr } = await supabase
        .from("species_traits")
        .select("id_trait, f_states, f_notes, f_notes_url, m_states, m_notes, m_notes_url")
        .eq("id_species", decodedId);

      if (!alive) return;

      if (stErr) {
        console.error(stErr);
        setError(stErr.message);
        setLoading(false);
        return;
      }

      const byTrait = {};
      for (const r of stRows || []) {
        byTrait[r.id_trait] = r;
      }
      setSpeciesTraitsByTrait(byTrait);

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [decodedId]);

  // ---- Guard clauses ----
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!decodedId) return <p>Invalid species id in URL.</p>;
  if (!base) return <p>No data for this species.</p>;

  // ---- Derived data (virtual rows for bars) ----
  const female = { min_len: base.f_min, max_len: base.f_max };
  const male = { min_len: base.m_min, max_len: base.m_max };

  const handleToggleTraitCategory = (cat) => {
    setOpenTraitCategory((prev) => (prev === cat ? null : cat));
  };

  // Build render rows for a single trait (F row then M row, or merged "both")
  const buildTraitRows = (trait) => {
    const traitId = trait.id_trait;
    const row = speciesTraitsByTrait[traitId];

    const fStates = row?.f_states ?? [];
    const mStates = row?.m_states ?? [];
    const fNotes = safeText(row?.f_notes);
    const mNotes = safeText(row?.m_notes);

    const neutralRaw = traitIconByTraitId[traitId];
    const neutralUrl = neutralRaw ? `${neutralRaw}?v=${ICON_VERSION}` : "";

    const resolveIcon = (id_state) => {
      const m = traitStatesMeta[String(id_state)];
      const raw = m?.icon_url;
      return raw ? `${raw}?v=${ICON_VERSION}` : neutralUrl;
    };

    const resolveLabel = (id_state) => {
      const m = traitStatesMeta[String(id_state)];
      return m?.label || String(id_state);
    };

    const makeIcons = (states) => {
      const arr = Array.isArray(states) ? states : [];
      if (arr.length === 0) {
        // “Not found / no data” case => neutral icon from traits.trait_icon_url
        return [
          {
            id_state: null,
            label: "No data",
            icon: neutralUrl,
          },
        ];
      }

      return arr.map((id_state) => ({
        id_state: String(id_state),
        label: resolveLabel(id_state),
        icon: resolveIcon(id_state),
      }));
    };

    const fIcons = makeIcons(fStates);
    const mIcons = makeIcons(mStates);

    const sameStates = sameArr(fStates, mStates);
    const sameNotes = fNotes === mNotes;

    // If identical => merge into "both"
    if (sameStates && sameNotes) {
      return [
        {
          key: `${traitId}__BOTH`,
          sexKey: "BOTH",
          traitName: trait.trait_name,
          icons: fIcons, // same as mIcons
          notes: fNotes,
        },
      ];
    }

    return [
      {
        key: `${traitId}__F`,
        sexKey: "F",
        traitName: trait.trait_name,
        icons: fIcons,
        notes: fNotes,
      },
      {
        key: `${traitId}__M`,
        sexKey: "M",
        traitName: trait.trait_name,
        icons: mIcons,
        notes: mNotes,
      },
    ];
  };

  // Tooltip text (for now: "test" if you want, or something more useful)
  const tooltipTextFor = (row) => {
    // If you literally want ONLY "test", return "test".
    // return "test";

    // Slightly more useful while still simple:
    const parts = [];
    parts.push(row.traitName);
    if (hasText(row.notes)) parts.push(row.notes);
    return parts.join(" — ") || "test";
  };

  return (
    <div className="sd-page">
      {/* Header */}
      <header className="sd-header">
        <h1 className="sd-title">
          <em>{base.scientific_name || decodedId}</em>
        </h1>
        {base.authority && <div className="sd-authority">{base.authority}</div>}
      </header>

      <div className="sd-grid">
        {/* LEFT (2/3) */}
        <div className="sd-col sd-colLeft">
          {/* Taxonomy + links */}
          <section className="sd-meta">
            <div className="sd-metaRow">
              <strong>Family:</strong> {base.family || "-"}
            </div>

            <div className="sd-metaRow">
              <strong>Genus:</strong> <em>{base.genus || "-"}</em>
            </div>

            {base.environment && (
              <div className="sd-metaRow">
                <strong>Environment:</strong> {base.environment}
              </div>
            )}

            <ExternalLinks
              wormsLink={base.worms_link}
              razoulsLink={base.razouls_link}
            />
          </section>

          {/* Length bars + scale */}
          <section className="sd-length">
            <div className="sd-barsLayer">
              {SEX_BARS.map(({ key, label, color }) => (
                <div key={key} className={`sd-barRow sd-barRow--${key}`}>
                  <SexBar
                    row={key === "F" ? female : male}
                    label={label}
                    colorClass={color}
                    scaleMax={SCALE_MAX_MM}
                    barKey={key}
                    hoveredKey={hoveredKey}
                    setHoveredKey={setHoveredKey}
                  />
                </div>
              ))}
            </div>

            <Scale15mm />
          </section>
        </div>

        {/* RIGHT (1/3) */}
        <aside className="sd-col sd-colRight" aria-label="Species detail sidebar">
          {/* Title must not vary */}
          <p>
            <b>Traits:</b>
          </p>

          {/* Legend */}
          <TraitLegend />

          {/* Accordion by category */}
          <div className="sd-traitsAccWrap">
            {Object.entries(traitsByCategory).map(([cat, traits]) => (
              <TraitsAccordion
                key={cat}
                cat={cat}
                isOpen={openTraitCategory === cat}
                onToggle={handleToggleTraitCategory}
              >
                <div className="sd-traitsList">
                  {(traits || []).flatMap((t) => buildTraitRows(t)).map((r) => {
                    const rowClass =
                      r.sexKey === "F"
                        ? "sd-traitRow--f"
                        : r.sexKey === "M"
                        ? "sd-traitRow--m"
                        : "sd-traitRow--both";

                    return (
                      <div key={r.key} className={`sd-traitRow ${rowClass}`}>
                        <div className="sd-traitRowTitle">{r.traitName}</div>

                        <div className="sd-traitIcons">
                          {(r.icons || []).map((ic, idx) => {
                            const tipKey = `${r.key}__${ic.id_state || "nodata"}__${idx}`;
                            return (
                              <div
                                key={tipKey}
                                className="sd-traitIconWrap"
                                onMouseEnter={() => setHoverTipKey(tipKey)}
                                onMouseLeave={() =>
                                  setHoverTipKey((prev) =>
                                    prev === tipKey ? null : prev
                                  )
                                }
                              >
                                <img
                                  className="sd-traitIcon"
                                  src={ic.icon}
                                  alt={ic.label}
                                />

                                {hoverTipKey === tipKey && (
                                  <div className="sd-traitTooltip">
                                    {tooltipTextFor(r)}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TraitsAccordion>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}