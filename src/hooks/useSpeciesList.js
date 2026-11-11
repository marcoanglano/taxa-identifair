// ##### IMPORTS #####
// LIB
import { useEffect, useState } from "react";
// SERVICES
import { getFamilyCounts, getSpeciesByFamily } from "../services/dataService";

export function useFamilies() {


  // ##### STATES #####
  const [families, setFamilies] = useState([]);
  const [loadingFamilies, setLoadingFamilies] = useState(true);
  const [errorFamilies, setErrorFamilies] = useState(null);
  const [familyCache, setFamilyCache] = useState({});


  // ##### LOADING FAMILY #####
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const data = await getFamilyCounts();
        setFamilies(data);
      }
      catch (err) { setErrorFamilies(err.message); }
      finally { setLoadingFamilies(false); }
    }
    fetchInitialData();
  }, []);


  // ##### LOADING SPECIES #####
  const fetchFamilySpecies = async (family) => {
    if (familyCache[family]) return;
    try {
      const data = await getSpeciesByFamily(family);
      setFamilyCache((prev) => ({ ...prev, [family]: data }));
    } 
    catch (err) { console.error(`Error loading species for family ${family}:`, err); }
  };
  
  return {
    families,
    loadingFamilies,
    errorFamilies,
    familyCache,
    fetchFamilySpecies
  };
}
