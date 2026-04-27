// ========== IMPORTS ==========
// COMPONENTS
import Error from "../components/Error";
import SD_cards from "../components/SD_cards";
import SD_length from "../components/SD_length";
import SD_links from "../components/SD_links";
import Skeleton from "../components/Skeleton";
import SD_traits from "../components/SD_traits";
// HOOKS
import { useGBIF } from "../hooks/useGBIF";
import { useSpeciesDetail } from "../hooks/useSpeciesDetail";
// LIB
import { use, useMemo } from "react";
import { useParams } from "react-router-dom";
// STYLES
import "../styles/SpeciesDetail.css";
// UTILS
import { calculateMean, getGBIFLink, getWormsLink, getRazoulsLink } from "../utils/speciesHelpers.jsx";

// ========== TESTS ==========
  const ts_err = false; // Simulate main DB error
  const tg_err = false; // Simulate GBIF error
  const ts_load = false; // Simulate main DB loading
  const tg_load = false; // Simulate GBIF loading


// ========== HOOKS & VARIABLES ==========
export default function SpeciesDetail() {
  // Species ID from URL
  const { id } = useParams();
  // Hooks (fetch/cache)
  const {species, traits, loading: s_load, error: s_err} = useSpeciesDetail(id);
  const {taxonomy, basionym, synonyms, loading: g_load, error: g_err} = useGBIF(species?.gbif_id);
  const isDataReady = !s_load && !g_load && !tg_load && (taxonomy || g_err || tg_err); // Avoids loading problem (GBIF skeleton)
  // Length data
  const lengthData = useMemo(() => {
    const fMin = species?.filters?.f_min ?? null;
    const fMax = species?.filters?.f_max ?? null;
    const mMin = species?.filters?.m_min ?? null;
    const mMax = species?.filters?.m_max ?? null;
    const fMean = calculateMean(fMin, fMax);
    const mMean = calculateMean(mMin, mMax);
    return { fMin: fMin, fMax: fMax, mMin: mMin, mMax: mMax, fMean: fMean, mMean: mMean };
  }, [species]);
  // URLs
  const gbifUrl = getGBIFLink(species?.gbif_id);
  const wormsUrl = getWormsLink(species?.worms_id);
  const razoulsUrl = getRazoulsLink(species?.razouls_id);


  // ERROR (HARD DEPENDENCY)
  if (!s_load && !species) return <Error title="404" message="Species not found" />;
  if (s_err || ts_err) return <Error title="Oh no!" message="Error fetching species details" />;
  

  
  // ========== RENDERING ==========
  return (
    <section id="details-container">


      {/* ===== LEFT COLUMN ===== */}
      <div id="left-column">
          {/* SUPABASE */}{s_load || ts_load ? ( <Skeleton id="species-header" padding="10px 0 10px 10px" /> ) : (
            <div id="species-header">
              <div id="species-name">
                <h3 className="SUP" id="scientific-name">{species?.scientific_name}</h3>
                <h4 className="SUP" id="authority">{species?.authority}</h4>
              </div>

              {/* Links */}
              <SD_links gbifUrl={gbifUrl} wormsUrl={wormsUrl} razoulsUrl={razoulsUrl} />
            </div>
          )}

        {/* Card */}
        {g_err || tg_err && ( /* Error (SOFT DEPENDENCY) */
          <Error title="Oh no!" message="Error in GBIF data recovery" id="gbif-error" />
        )}
        <div id="species-card">
          {/* GBIF */}{!isDataReady ? ( <Skeleton className="card-section" count={4} /> ) : (
            <>
              <SD_cards title="Synonyms & Basionym" classname="card-section GBI" id="synbas-section" basionym={basionym} synonyms={synonyms} />
              <SD_cards title="Taxonomy" classname="card-section GBI" id="taxonomy-section" taxonomy={taxonomy} />
              <SD_cards title="Environment" classname="card-section SUP" id="env-section" environment={species?.filters?.environment} />
              <SD_cards title="Test title" classname="card-section" id="test-section" content="Test content" />
            </>
          )}
        </div>
      </div>


      {/* ===== RIGHT COLUMN ===== */}
      <div id="right-column">
        <div id="anat-header">
          <h4 id="right-title">Anatomy</h4>
          <div id="legend">
            <p><span className="bordered" id="f-square"></span> Female</p>
            <p><span className="bordered" id="m-square"></span> Male</p>
          </div>
        </div>
        {/* SUPABASE */}{s_load || ts_load ? (
          <>
            <Skeleton id="length-section" />
            <Skeleton id="traits-section" />
          </>
        ) : (
          <>
            {/* Length data (only if any data) */}
            <SD_length data={lengthData} />

            {/* Traits */}
            <SD_traits traits={traits} />
          </>
        )}
      </div>
    </section>
  )
}
