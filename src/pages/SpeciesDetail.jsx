import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./SpeciesDetail.css";

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

// Pick a record by sex ("F" / "M")
const findBySex = (records, sex) => records.find((r) => r.sex === sex);

// Bars config (pure; rendering uses CSS classes sd-barRow--F / sd-barRow--M)
const SEX_BARS = [
  { key: "F", label: "Female", color: "sd-f" },
  { key: "M", label: "Male", color: "sd-m" },
];

// ======================
// Local UI components
// ======================

// External links block (render only if at least one is valid)
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
function SexBar({ row, label, colorClass, scaleMax, barKey, hoveredKey, setHoveredKey }) {
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

// ======================
// Main page
// ======================
export default function SpeciesDetail() {
  const { scientificName } = useParams();

  // Decode safely (prevents crashes on malformed URL encoding)
  const decodedName = useMemo(() => {
    try {
      return decodeURIComponent(scientificName || "");
    } catch {
      return "";
    }
  }, [scientificName]);

  // ---- Page state ----
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Shared tooltip state for both bars
  const [hoveredKey, setHoveredKey] = useState(null); // "F" | "M" | null

  // ---- Data fetch ----
  useEffect(() => {
    if (!decodedName) {
      setLoading(false);
      setRecords([]);
      return;
    }

    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("species")
        .select(
          "id, scientific_name, authority, worms_link, razouls_link, family, genus, environment, sex, min_len, max_len"
        )
        .eq("scientific_name", decodedName)
        .order("sex", { ascending: true });

      if (!alive) return;

      if (error) {
        console.error(error);
        setError(error.message);
        setRecords([]);
      } else {
        setRecords(data || []);
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [decodedName]);

  // ---- Guard clauses ----
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!decodedName) return <p>Invalid species name in URL.</p>;
  if (!records.length) return <p>No data for this species.</p>;

  // ---- Derived data ----
  const base = records[0];
  if (!base) return <p>No usable record found.</p>;

  const female = findBySex(records, "F");
  const male = findBySex(records, "M");

  return (
    <div className="sd-page">
      {/* Header */}
      <header className="sd-header">
        <h1 className="sd-title">
          <em>{base.scientific_name || decodedName}</em>
        </h1>
        {base.authority && <div className="sd-authority">{base.authority}</div>}
      </header>

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

        <ExternalLinks wormsLink={base.worms_link} razoulsLink={base.razouls_link} />
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
  );
}