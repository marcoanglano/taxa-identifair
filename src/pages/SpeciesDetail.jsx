// TO DO [SUPABASE]: try importing the species details and display them here.

// LIBRARIES
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// STYLES
import "../styles/SpeciesDetail.css";

export default function SpeciesDetail() {
  {/* Gets species id from URL parameters */}
  const { id } = useParams();

  {/* STATES */}
  const [species, setSpecies] = useState(null);
  const [error, setError] = useState(null);

  {/* FETCHING */}
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

  {/* RENDERING */}
  return (
    <section>
        {/* Error */}
        {error && (
          <>
            <h3>Error</h3>
            <p style={{ color: "var(--error-color)" }}>Error fetching species details: {error.message}</p>
          </>
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
                    <a href={species.worms_link} target="_blank"> link</a>
                  </li>
                  <li>
                    Razouls: 
                    <a href={species.razouls_link} target="_blank"> link</a>
                  </li>
                </ul>

                <h5 className="gap">Total legth:</h5>
                <p>Female:
                  {species.f_min ? (
                    ` ${species.f_min.toFixed(3)}-${species.f_max.toFixed(3)} mm`
                  ) : ' No data'}
                </p>
                <p>Male:
                  {species.m_min ? (
                    ` ${species.m_min.toFixed(3)}-${species.m_max.toFixed(3)} mm`
                  ) : ' No data'}
                </p>
              </div>

              {/* Species Traits */}
              <div className="right-column">
                <h5>Species Traits:</h5>
                <p>Work in progress</p>
              </div>
            </div>
          </div>
        )}
    </section>
  )
}
