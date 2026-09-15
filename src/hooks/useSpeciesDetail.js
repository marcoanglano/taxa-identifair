// ##### IMPORTS #####
// LIB
import { useState, useEffect } from "react";
// SERVICES
import { getSpeciesDetail, getSpeciesTraits } from "../services/dataService";

export function useSpeciesDetail(id) {


  // ##### STATES #####
  const [species, setSpecies] = useState(null);
  const [traits, setTraits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // ##### DATA EXTRACTION #####
  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {

        // Species & Traits
        const [speciesData, traitsData] = await Promise.all([
          getSpeciesDetail(id),
          getSpeciesTraits(id)
        ]);
        if (isMounted) {
          setSpecies(speciesData);
          setTraits(traitsData);
        }

      } catch (err) {
        if (isMounted) {
          console.error("Error fetching species detail:", err);
          setError(err.message || "Error loading species details");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAllData();
    return () => { isMounted = false; };
  }, [id]);
  return { species, traits, loading, error };
}
