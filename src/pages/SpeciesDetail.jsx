// IMAGES
import ErrorImage from "../assets/Error.png"

// LIBRARIES
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// STYLES
import "../styles/Error.css";
import "../styles/SpeciesDetail.css";

export default function SpeciesDetail() {
  // Gets species id from URL parameters
  const { id } = useParams();

  // ---- STATES
  const [species, setSpecies] = useState(null);
  const [traits, setTraits] = useState([]);
  const [error, setError] = useState(null);

  // ---- FETCHING SPECIES CARD
  useEffect(() => {
    const fetchSpecies = async () => {
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("species")
        .select("*")
        .eq("id_species", id)
        .single();

      if (supabaseError) {
        console.error("Error fetching species:", supabaseError.message);
        setError(supabaseError);
        setSpecies(null);
      } else {
        setSpecies(data);
      }
    };

    fetchSpecies();
  }, [id]);

  // ---- FETCHING TRAITS
  useEffect(() => {
    const fetchTraits = async () => {
      const { data, error: supabaseError } = await supabase
        .from("species_traits")
        .select(`
          f_states, 
          m_states,
          traits (
            trait_name,
            trait_states (
              id_state,
              state_label
            )
          )
        `)
        .eq("id_species", id);

      if (supabaseError) {
        console.error("Error fetching traits:", supabaseError.message);
      } else {
        // Avoids blocking the full page just for an error in traits
        setTraits(data || []);
      }
    };

    if (id) fetchTraits();
  }, [id]);

  // Calculate mean lengths for bars (if data exists)
  const fMean = species?.f_min ? (species.f_min + species.f_max) / 2 : null;
  const mMean = species?.m_min ? (species.m_min + species.m_max) / 2 : null;

  // Helpers to make id_states readable 
  const resolveLabels = (stateIds, allStates) => {
    if (!stateIds || !allStates) return "";
    return stateIds
      .map(sid => allStates.find(s => s.id_state === sid)?.state_label || sid)
      .join(", ");
  };

  // ---- RENDERING
  return (
    <section>
        {/* Error */}
        {error && (
          <div className="error-container">
            <div className="error-left">
              <img src={ErrorImage} alt="Sheldon J. Plankton is really sad" />
            </div>
            <div className="error-right">
              <h3>404</h3>
              <p>Error fetching species details: {error.message}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {!error && !species && (
          <h3>Loading species details...</h3>
        )}
        
        {/* Species Details */}
        {!error && species && (
          <div>
            <h3 className="scientific-name">{species.scientific_name}</h3>
            <h4>{species.authority}</h4>

            <div className="details-container">
              {/* Species Card */}
              <div className="left-column">
                <h5>Environment:</h5>
                <p>{species.environment}</p>

                <h5 className="gap">Useful links:</h5>
                <ul>
                  <li>
                    WoRMS: 
                    <a href={species.worms_link} target="_blank" rel="noreferrer"> link</a>
                  </li>
                  <li>
                    Razouls: 
                    <a href={species.razouls_link} target="_blank" rel="noreferrer"> link</a>
                  </li>
                </ul>

                {/* Length data */}
                <h5 className="gap">Total length (mm):</h5>
                <ul className="length-list">
                  <li className="f-length">
                    <span className="f-square"></span>
                    <span className="f-label">
                      Female:
                      {species.f_min ? ` ${species.f_min.toFixed(3)}-${species.f_max.toFixed(3)}` : " No data"}
                    </span>
                  </li>
                  <li className="m-length">
                    <span className="m-square"></span>
                    <span className="m-label">
                      Male:
                      {species.m_min ? ` ${species.m_min.toFixed(3)}-${species.m_max.toFixed(3)}` : " No data"}
                    </span>
                  </li>
                </ul>
                
                {/* Length bars, only if any data */}
                {(fMean ?? mMean) !== null && 
                  <div className="length-bars">
                    {fMean !== null && <div className="bar f-bar" style={{ width: `${fMean / 15 * 100}%` }}></div>}
                    {mMean !== null && <div className="bar m-bar" style={{ width: `${mMean / 15 * 100}%` }}></div>}
                    <div className="scale-bar">
                      <span className="bar-seg">5</span>
                      <span className="bar-seg">10</span>
                      <span className="bar-seg">15</span>
                    </div>
                  </div>
                }
              </div>

              {/* Species Traits */}
              <div className="right-column">
                <h5>Species Traits:</h5>
                
                {/* Mapping all traits */}
                {traits.length > 0 ? (
                  traits.map((item, index) => (
                    <div key={index}>
                      <p>- {item.traits?.trait_name}:</p>
                      <ul>
                        {item.f_states?.length > 0 && (
                          <li className="f">
                            {resolveLabels(item.f_states, item.traits?.trait_states)}
                          </li>
                        )}
                        {item.m_states?.length > 0 && (
                          <li className="m">
                            {resolveLabels(item.m_states, item.traits?.trait_states)}
                          </li>
                        )}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p>No traits available for this species.</p>
                )}
              </div>
            </div>
          </div>
        )}
    </section>
  )
}
