// ##### IMPORTS #####
// LIB
import { useState, useEffect } from "react";
// SERVICES
import { getSpeciesDetail, getSpeciesTraits, getSpeciesReferences } from "../services/dataService";

export function useSpeciesDetail(id) {


  // ##### STATES #####
  const [species, setSpecies] = useState(null);
  const [traits, setTraits] = useState([]);
  const [ref, setRef] = useState([]);
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

        // Species, Traits, References
        const [speciesData, traitsData, refData] = await Promise.all([
          getSpeciesDetail(id),
          getSpeciesTraits(id),
          getSpeciesReferences(id)
        ]);
        console.log("Custom References for", id, ":", refData);
        if (isMounted) {
          setSpecies(speciesData);
          setTraits(traitsData);
          setRef(refData);
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
  return { species, traits, ref, loading, error };
}
