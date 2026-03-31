// LOGOS SOURCES:
//    GBIF LOGO: downloaded from https://www.gbif.org/logos
//    WoRMS LOGO: Downloaded from https://www.marinespecies.org/images/layout/worms_logo.png, edited (color)
//    Marine Planktonic Copepods LOGO: Downloaded from https://www.obs-banyuls.fr/images/logo-OOB.gif,
//        edited (Logo from Observatoire Océanologique de Banyuls-sur-Mer, text substituted with "MPC", colors)

// ASSETS
import ErrorImage from "../assets/Error.png"

// COMPONENTS
import Accordion from "../components/Accordion";

// HOOKS
import { useGBIF } from "../hooks/useGBIF";
import { useSpeciesDetail } from "../hooks/useSpeciesDetail";

// LIB
import { useMemo } from "react";
import { useParams } from "react-router-dom";

// STYLES
import "../styles/Error.css";
import "../styles/SpeciesDetail.css";

// UTILS
import { calculateMean, formatLength, resolveLabels, getGBIFLink, getWormsLink, getRazoulsLink } from "../utils/speciesHelpers"


export default function SpeciesDetail() {
  // Gets species id from URL parameters
  const { id } = useParams();

  // Fetching-caching species card and traits
  const {species, traits, loading: s_loading, error: s_error} = useSpeciesDetail(id);
  const {taxonomy, loading: g_loading, error: g_error} = useGBIF(species?.gbif_id);

  // Mean lenghts, URLs
  const fMean = useMemo(() => calculateMean(species?.filters?.f_min, species?.filters?.f_max), [species]);
  const mMean = useMemo(() => calculateMean(species?.filters?.m_min, species?.filters?.m_max), [species]);
  const gbifUrl = getGBIFLink(species?.gbif_id);
  const wormsUrl = getWormsLink(species?.worms_id);
  const razoulsUrl = getRazoulsLink(species?.razouls_id);

  // TRAIT ACCORDIONS
  const accordionItems = useMemo(() => {
    // 1. Creates categories
    const grouped = traits.reduce((acc, item) => {
      const category = item.traits?.trait_category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    // 2. Adds traits to categories
    return Object.entries(grouped).map(([categoryName, traits]) => ({
      id: categoryName,
      title: categoryName.toUpperCase(),
      content: (
        <div className="traits-group">
          {traits.map((t, idx) => (
            <div key={idx}>
              <p id="trait-name">- <strong>{t.traits?.trait_name}</strong>:</p>
              <ul>
                {t.f_states?.length > 0 && (
                  <li className="f">
                    {resolveLabels(t.f_states, t.traits?.trait_states)}
                  </li>
                )}
                {t.m_states?.length > 0 && (
                  <li className="m">
                    {resolveLabels(t.m_states, t.traits?.trait_states)}
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )
    }));
  }, [traits]);

  // ---- LOADING
  if (s_loading || g_loading) return <h3>Loading species details...</h3>;
  // ---- ERROR (HARD DEPENDENCY)
  if (s_error || !species) return (
    <div className="error-container">
      <div className="error-left">
        <img src={ErrorImage} alt="Sheldon J. Plankton is really sad" />
      </div>
      <div className="error-right">
        <h3>404</h3>
        <p>Error fetching species details</p>
      </div>
    </div>
  );

  const g_error_test = true;

  // ---- RENDERING
  return (
    <section id="details-container">

      {/* ========== LEFT COLUMN ========== */}
      <div id="left-column">

        {/* Header (L) */}
        <div id="species-header">
          <div id="species-name">
            <h3 className="SUP" id="scientific-name">{species?.scientific_name}</h3>
            <h4 className="SUP" id="authority">{species?.authority}</h4>
          </div>
          <div id="species-logos">
            { species?.gbif_id && (
              <a className="logo-button" id="gbif-logo" href={gbifUrl} target="_blank" rel="noopener noreferrer">
                <img className="logo SUP" src="/gbif_logo.png" alt="GBIF logo" />
              </a>
            )}
            { species?.worms_id && (
              <a className="logo-button" id="worms-logo" href={wormsUrl} target="_blank" rel="noopener noreferrer">
                <img className="logo SUP" src="/worms_logo.png" alt="WoRMS logo" />
              </a>
            )}
            { species?.razouls_id && (
              <a className="logo-button" id="razouls-logo" href={razoulsUrl} target="_blank" rel="noopener noreferrer">
                <img className="logo SUP" src="/razouls_logo.png" alt="Razouls logo" />
              </a>
            )}
          </div>
        </div>

        {/* Card */}
        {!g_error_test ? (
          <div id="species-card">
            <div className="card-section GBI" id="taxonomy-section">
              <h5>Taxonomy:</h5>
              <p>{taxonomy?.kingdom} &gt; {taxonomy?.phylum} &gt; {taxonomy?.class} &gt; {taxonomy?.order} &gt; {taxonomy?.family} &gt; <em>{taxonomy?.genus}</em></p>
            </div>
            <div className="card-section SUP" id="env-section">
              <h5>Environment:</h5>
              <p>{species?.filters?.environment?.join(', ')}</p>
            </div>
            <div className="card-section" id="test-section">
              <h5>Test section 1:</h5>
              <p>Test</p>
            </div>
            <div className="card-section" id="test-section">
              <h5>Test section 2:</h5>
              <p>Test</p>
            </div>
          </div>
        ) : (
          <div className="error-container" id="gbif-error">
            <div className="error-left">
              <img src={ErrorImage} alt="Sheldon J. Plankton is really sad" />
            </div>
            <div className="error-right">
              <h3>Error</h3>
              <p>Error in GBIF data recovery</p>
            </div>
          </div>
        )}
      </div>

      {/* ========== RIGHT COLUMN ========== */}
      <div id="right-column">

        {/* Header (R) */}
        <div id="anat-header">
          <h4 id="right-title">Anatomy</h4>
          <div id="legend">
            <p><span className="bordered" id="f-square"></span> Female</p>
            <p><span className="bordered" id="m-square"></span> Male</p>
          </div>
        </div>

        {/* Length data (only if any data) */}
        {(fMean ?? mMean) !== null && 
          <div className="SUP" id="length-section">
            <h5>Total length (mm):</h5>
            <div id="bar-bg">
              {fMean !== null &&
                <p>
                  <span className="bar bordered" id="f-bar" style={{ width: `${fMean / 15 * 100}%` }}></span>
                  {formatLength(species?.filters?.f_min, species?.filters?.f_max)}
                </p>
              }
              {mMean !== null &&
                <p>
                  <span className="bar bordered" id="m-bar" style={{ width: `${mMean / 15 * 100}%` }}></span>
                  {formatLength(species?.filters?.m_min, species?.filters?.m_max)}
                </p>
              }
            </div>
            <div className="scale-line" id="scale-bar">
              <span className="scale-seg">5</span>
              <span className="scale-seg">10</span>
              <span className="scale-seg">15</span>
            </div>
          </div>
        }

        {/* Traits */}
        <div className="SUP" id="traits-section">
          <h5>Species Traits:</h5>
          {traits.length > 0 ? (
            <Accordion
              className="traits-accordion" 
              items={accordionItems} 
              singleOpen={false}
              defaultAllOpen={false} 
            />
          ) : (
            <p>No traits available for this species.</p>
          )}
        </div>
      </div>
    </section>
  )
}
