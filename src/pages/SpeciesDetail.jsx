import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import "./SpeciesDetail.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const SCALE_MAX_MM = 15;

const fmt3 = (val) => (val != null ? Number(val).toFixed(3) : "-");

const meanLen = (row) => {
  if (!row || row.min_len == null || row.max_len == null) return null;
  return (Number(row.min_len) + Number(row.max_len)) / 2;
};

const clamp01 = (x) => Math.min(1, Math.max(0, x));

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
          <strong>{label}:</strong>{" "}
          {fmt3(row.min_len)} – {fmt3(row.max_len)} mm
        </div>
      )}
    </div>
  );
}

export default function SpeciesDetail() {
  const { scientificName } = useParams();

  // Decode safely
  const decodedName = useMemo(() => {
    try {
      return decodeURIComponent(scientificName || "");
    } catch {
      return "";
    }
  }, [scientificName]);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [hoveredKey, setHoveredKey] = useState(null);

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!decodedName) return <p>Invalid species name in URL.</p>;
  if (!records.length) return <p>No data for this species.</p>;

  const base = records[0];
  if (!base) return <p>No usable record found.</p>;

  const female = records.find((r) => r.sex === "F");
  const male = records.find((r) => r.sex === "M");

  const SEX_BARS = [
    { key: "F", label: "Female", row: female, color: "sd-f" },
    { key: "M", label: "Male", row: male, color: "sd-m" },
  ];

  return (
    <div className="sd-page">
      <header className="sd-header">
        <h1 className="sd-title">
          <em>{base.scientific_name || decodedName}</em>
        </h1>
        {base.authority && <div className="sd-authority">{base.authority}</div>}
      </header>

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

      <section className="sd-length">
        <div className="sd-barsLayer">
          {SEX_BARS.map(({ key, label, row, color }) => (
            <div key={key} className={`sd-barRow sd-barRow--${key}`}>
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