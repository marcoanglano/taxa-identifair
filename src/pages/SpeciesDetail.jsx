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

  // Mean lenghts, URL to GBIF
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
  // ---- ERROR
  if (s_error || g_error || !species) return (
    <div className="error-container">
      <div className="error-left">
        <img src={ErrorImage} alt="Sheldon J. Plankton is really sad" />
      </div>
      <div className="error-right">
        <h3>404</h3>
        <p>Error fetching species details</p> {/* Here I need to display the right error.message*/}
      </div>
    </div>
  );

  // ---- RENDERING
  return (
    <section>
      <div>
        <h3 id="scientific-name">{species?.scientific_name}</h3>
        <h4 id="authority">{species?.authority}</h4>

        <div className="details-container">
          {/* Species Card */}
          <div className="left-column">
            <h5>Taxonomy:</h5>
            <p>{taxonomy?.kingdom} &gt; {taxonomy?.phylum} &gt; {taxonomy?.class} &gt;
              &nbsp;{taxonomy?.order} &gt; {taxonomy?.family} &gt; <em>{taxonomy?.genus}</em></p>

            <h5>Environment:</h5>
            <p>{species?.filters?.environment?.join(', ')}</p>

            <h5 className="gap">Useful links:</h5>
            <ul>
              <li>
                GBIF:&nbsp;
                <a href={gbifUrl} target="_blank" rel="noopener noreferrer">link</a>
              </li>
              <li>
                WoRMS:&nbsp;
                <a href={wormsUrl} target="_blank" rel="noopener noreferrer">link</a>
              </li>
              <li>
                Marine Planktonic Copepods:&nbsp;
                <a href={razoulsUrl} target="_blank" rel="noopener noreferrer">link</a>
              </li>
            </ul>

            {/* Length data */}
            <h5 className="gap">Total length (mm):</h5>
            <ul className="length-list">
              <li className="f-length">
                <span className="f-square"></span>
                <span className="f-label">
                  Female:{formatLength(species?.filters?.f_min, species?.filters?.f_max)}
                </span>
              </li>
              <li className="m-length">
                <span className="m-square"></span>
                <span className="m-label">
                  Male:{formatLength(species?.filters?.m_min, species?.filters?.m_max)}
                </span>
              </li>
            </ul>
            
            {/* Length bars, only if any data */}
            {(fMean ?? mMean) !== null && 
              <div className="length-bars">
                {fMean !== null && <div className="bar f-bar" style={{ width: `${fMean / 15 * 100}%` }}></div>}
                {mMean !== null && <div className="bar m-bar" style={{ width: `${mMean / 15 * 100}%` }}></div>}
                <div className="scale-bar scale-bd">
                  <span className="bar-seg">5</span>
                  <span className="bar-seg">10</span>
                  <span className="bar-seg">15</span>
                </div>
              </div>
            }
          </div>

          {/* Species Traits */}
          <div className="right-column right-bd">
            <h5>Species Traits:</h5>
            
            {traits.length > 0 ? (
              <Accordion 
                items={accordionItems} 
                singleOpen={false}
                defaultAllOpen={false} 
              />
            ) : (
              <p>No traits available for this species.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
