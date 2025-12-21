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

// Bars config
const SEX_BARS = [
  { key: "F", label: "Female", color: "sd-f" },
  { key: "M", label: "Male", color: "sd-m" },
];

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
      onMouseLeave={() => setHoveredKey((prev) => (prev === barKey ? null : prev))}
    >
      <div
        className={`sd-bar ${colorClass} ${hoveredKey === barKey ? "sd-barHover" : ""}`}
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
        <span className="sd-legendSwatch sd-legendSwatch--both" aria-hidden="true" />
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

  // Decode safely (prevents crashes on malformed URL encoding)
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

  // Shared tooltip state for both bars
  const [hoveredKey, setHoveredKey] = useState(null); // "F" | "M" | null

  // Traits sidebar (scaffold)
  const [openTraitCategory, setOpenTraitCategory] = useState(null);
  const [hoverTipKey, setHoverTipKey] = useState(null);

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

      const { data, error } = await supabase
        .from("species")
        .select(
          "id_species, scientific_name, authority, worms_link, razouls_link, family, genus, environment, f_min, f_max, m_min, m_max"
        )
        .eq("id_species", decodedId)
        .single();

      if (!alive) return;

      if (error) {
        console.error(error);
        setError(error.message);
        setBase(null);
      } else {
        setBase(data || null);
      }

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

  // MOCK categories for scaffold (replace with real fetched categories later)
  const traitCategories = [
    { cat: "Prosome", items: [1, 2, 3] },
    { cat: "Urosome", items: [1, 2] },
  ];

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
          <p><b>Traits:</b></p>

          {/* Legend */}
          <TraitLegend />

          {/* Accordion */}
          <div className="sd-traitsAccWrap">
            {traitCategories.map(({ cat, items }) => (
              <TraitsAccordion
                key={cat}
                cat={cat}
                isOpen={openTraitCategory === cat}
                onToggle={handleToggleTraitCategory}
              >
                {/* Placeholder state icons (temporary) */}
                <div className="sd-traitsGrid">
                  {items.map((n) => {
                    const tipKey = `${cat}__${n}`;
                    return (
                      <div key={tipKey} className="sd-traitState">
                        <img
                          className="sd-traitIcon"
                          src={`https://fraywmircvjqozsywdfx.supabase.co/storage/v1/object/public/icons/Prosome/Prosome%20somites/PR_som_5i.svg?v=${ICON_VERSION}`}
                          alt="State icon test"
                        />

                        <div
                          className="sd-traitTipTarget"
                          onMouseEnter={() => setHoverTipKey(tipKey)}
                          onMouseLeave={() =>
                            setHoverTipKey((prev) => (prev === tipKey ? null : prev))
                          }
                          aria-label="Trait tooltip"
                        >
                          ?
                        </div>

                        {hoverTipKey === tipKey && (
                          <div className="sd-traitTooltip">test</div>
                        )}
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