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
            <h2>Error</h2>
            <p style={{ color: "var(--error-color)" }}>Error fetching species details: {error.message}</p>
          </>
        )}

        {/* Loading */}
        {!error && !species && (
          <h2>Loading species details...</h2>
        )}
        
        {/* Species Details */}
        {!error && species && (
          <div>
            <h2>{species.scientific_name}</h2>
            <p>Authority: {species.authority}</p>

            <p>Family: {species.family}</p>
            <p>Genus: {species.genus}</p>
            <p>Environment: {species.environment}</p>

            <p>
              WoRMS: 
              <a href={species.worms_link} target="_blank"> link</a>
            </p>
            <p>
              Razouls: 
              <a href={species.razouls_link} target="_blank"> link</a>
            </p>
            
            <p>Female legth:
              {species.f_min ? (
                ` ${species.f_min}-${species.f_max} mm`
              ) : ' No data'}
            </p>
            <p>Male legth:
              {species.m_min ? (
                ` ${species.m_min}-${species.m_max} mm`
              ) : ' No data'}
            </p>
          </div>
        )}
    </section>
  )
}
