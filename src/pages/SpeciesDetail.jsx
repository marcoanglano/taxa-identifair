// ##### IMPORTS #####
// COMPONENTS
import ErrorComponent from "../components/Error";
import SD_card_syn_bas from "../components/SD_card_syn_bas.jsx";
import SD_card_taxonomy from "../components/SD_card_taxonomy.jsx";
import SD_card_env from "../components/SD_card_env.jsx";
import SD_card_map from "../components/SD_card_map.jsx";
import SD_card_ref from "../components/SD_card_ref.jsx";
import SD_length from "../components/SD_length";
import SD_links from "../components/SD_links";
import SD_traits from "../components/SD_traits";
import Skeleton from "../components/Skeleton";
// HOOKS
import { useGBIF, useOccurrencesGBIF } from "../hooks/useGBIF";
import { useSpeciesDetail } from "../hooks/useSpeciesDetail";
// LIB
import { useMemo } from "react";
import { useParams } from "react-router-dom";
// UTILS
import { calculateMean, getGBIFLink, getWormsLink, getOtherLink } from "../utils/speciesHelpers.jsx";

export default function SpeciesDetail() {


  // ##### HOOKS & VARIABLES #####
  // Species ID from URL
  const { id } = useParams();
  // Hooks (fetch/cache)
  const {species, traits, ref, loading: s_load, error: s_err} = useSpeciesDetail(id);
  const {taxonomy, basionym, synonyms, loading: g_load, error: g_err} = useGBIF(species?.gbif_key);
  const {loading: map_load, error: map_err} = useOccurrencesGBIF(species?.gbif_key);
  const isDataReady = !s_load && !g_load && (taxonomy || g_err); // Avoids loading problem (GBIF skeleton)
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
  const gbifUrl = getGBIFLink(species?.gbif_key);
  const wormsUrl = getWormsLink(species?.aphia_id);
  const otherUrl = getOtherLink(species?.other_id);


  // ##### ERROR (HARD DEPENDENCY) #####
  if (!s_load && !species) return <ErrorComponent title="404" message="Species not found" />;
  if (s_err) return <ErrorComponent title="Oh no!" message="Error fetching species details" />;
  
  
  // ##### RENDERING #####
  return (
    <section id="details-container">


      {/* ### LEFT COLUMN ### */}
      <div id="details-left">

          {/* Loading */}
          {s_load ? ( <Skeleton id="species-header" padding="10px" /> ) : (

            // Header (L)
            <div id="species-header">
              <div id="species-name-container">
                <h3 id="species-name">{species?.scientific_name}</h3>
                <h4 id="species-authority">{species?.authority}</h4>
              </div>

              {/* Links */}
              <SD_links gbifUrl={gbifUrl} wormsUrl={wormsUrl} otherUrl={otherUrl} />
            </div>
          )}

        {/* Error (SOFT DEPENDENCY, cards) */}
        {g_err ? ( <ErrorComponent title="Oh no!" message="Error in GBIF data recovery" id="gbif-error" /> ) : (

          // Loading cards
          <div id="species-card">
            {/* GBIF */}{!isDataReady ? ( <>
              <Skeleton className="card-section" count={3} />     {/* Synonyms & Basionym, Taxonomy, Environment */}
              <Skeleton className="card-section" height={400} />  {/* Occurrences */}
              <Skeleton className="card-section" height={140} />  {/* References */}
            </> ) : ( <>

              {/* Cards */}
              <SD_card_syn_bas basionym={basionym} synonyms={synonyms} />
              <SD_card_taxonomy taxonomy={taxonomy} />
              <SD_card_env environment={species?.filters?.environment} />
              { // Map
                map_load ? ( <Skeleton className="card-section" height={400} /> ) :
                map_err ? ( <ErrorComponent title="Oh no!" message="GBIF Map Service unavailable" id="gbif-error" /> ) :
                ( <SD_card_map gbifKey={species?.gbif_key} /> )
              }
              <SD_card_ref gbifKey={species?.gbif_key} customRef={ref} />
            </> )}
          </div>
        )}
      </div>


      {/* ### RIGHT COLUMN ### */}
      <div id="details-right">

        {/* Header (R) */}
        <div id="anat-header">
          <h4 id="anat-title">Anatomy</h4>
          <div id="anat-legend">
            <p><span className="bar f"></span> Female</p>
            <p><span className="bar m"></span> Male</p>
          </div>
        </div>

        { // Loading
          s_load ? ( <> <Skeleton id="length-section" /><Skeleton id="traits-section" /> </> ) :

          // Lenght Bars and Traits
          ( <> <SD_length data={lengthData} /><SD_traits traits={traits} /> </> )
        }
      </div>
    </section>
  )
}
