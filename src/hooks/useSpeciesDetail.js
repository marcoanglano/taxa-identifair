// LIB
import { useState, useEffect } from "react";

// SERVICES
import { getSpeciesDetail, getSpeciesTraits } from "../services/dataService";


export function useSpeciesDetail(id) {
  // STATES
  const [species, setSpecies] = useState(null);
  const [traits, setTraits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Both calls at the same time, for efficiency
        const [speciesData, traitsData] = await Promise.all([
          getSpeciesDetail(id),
          getSpeciesTraits(id)
        ]);
        
        setSpecies(speciesData);
        setTraits(traitsData);
      } catch (err) {
        console.error("Error fetching species detail:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  return { species, traits, loading, error };
}
