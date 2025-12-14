import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import "./SpeciesDetail.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ======================
// Helpers (pure functions)
// ======================
const fmt3 = (val) => (val != null ? Number(val).toFixed(3) : "-");

// Mean between min/max, null-safe
const meanLen = (row) => {
  if (!row) return null;
  if (row.min_len == null || row.max_len == null) return null;
  return (Number(row.min_len) + Number(row.max_len)) / 2;
};

const clamp01 = (x) => Math.min(1, Math.max(0, x));

// ======================
// UI components (local)
// ======================

// External links block (only if link exists and is meaningful)
function ExternalLinks({ wormsLink, razoulsLink }) {
  const hasWorms = wormsLink != null && String(wormsLink).trim() !== "";
  const hasRazouls =
    razoulsLink != null &&
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

// Scale 0–15 mm (ticks + labels + TL mm)
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

// One bar (F or M). If missing length -> show "?"
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
  const widthPct = avg == null ? 0 : clamp01(avg / scaleMax) * 100;
  const hasData = avg != null;

  // No numeric data → just show "?"
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

      {/* Tooltip: appears instantly when hoveredKey matches */}
      {hoveredKey === barKey && (
        <div className={`sd-tooltip ${colorClass}`}>
          <strong>{label}:</strong> {fmt3(row.min_len)} – {fmt3(row.max_len)} mm
        </div>
      )}
    </div>
  );
}

// ======================
// Main page
// ======================
export default function SpeciesDetail() {
  const { scientificName } = useParams();
  const decodedName = decodeURIComponent(scientificName || "");

  // ---- Page state ----
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tooltip hover state (shared between the 2 bars)
  const [hoveredKey, setHoveredKey] = useState(null); // "F" | "M" | null

  // Fixed scale for now
  const SCALE_MAX_MM = 15;

  // ---- Data fetch ----
  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("species")
        .select(
          "id, scientific_name, authority, worms_link, razouls_link, family, genus, environment, sex, min_len, max_len"
        )
        .eq("scientific_name", decodedName)
        .order("sex", { ascending: true });

      if (error) {
        console.error(error);
        setError(error.message);
        setRecords([]);
      } else {
        setRecords(data || []);
      }

      setLoading(false);
    }

    if (decodedName) loadDetail();
  }, [decodedName]);

  // ---- Guard clauses ----
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!records.length) return <p>No data for this species.</p>;

  // ---- Derived data (F/M rows) ----
  const base = records[0];
  const female = records.find((r) => r.sex === "F");
  const male = records.find((r) => r.sex === "M");

  // Config for loop-based rendering of sex bars
  const SEX_BARS = [
    { key: "F", label: "Female", row: female, color: "sd-f", top: 0 },
    { key: "M", label: "Male", row: male, color: "sd-m", top: 10 },
  ];

  return (
    <div className="sd-page">
      {/* =========
          HEADER
          ========= */}
      <header className="sd-header">
        <h1 className="sd-title">
          <em>{base.scientific_name}</em>
        </h1>
        {base.authority && <div className="sd-authority">{base.authority}</div>}
      </header>

      {/* ===================
          TAXONOMY + LINKS
          =================== */}
      <section className="sd-meta">
        <div className="sd-metaRow">
          <strong>Family:</strong> {base.family}
        </div>
        <div className="sd-metaRow">
          <strong>Genus:</strong> <em>{base.genus}</em>
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

      {/* ======================
          LENGTH BARS + SCALE
          ====================== */}
      <section className="sd-length">
        {/* Bars layer (above the scale) */}
        <div className="sd-barsLayer">
          {SEX_BARS.map(({ key, label, row, color, top }) => (
            <div key={key} className="sd-barRow" style={{ top }}>
              <SexBar
                row={row}
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
  );
}