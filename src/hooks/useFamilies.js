// LIB
import { useState, useEffect, useRef } from "react";

// SERVICES
import { getFamilyCounts, getSpeciesByFamily } from "../services/dataService";


export function useFamilies() {
  // STATES
  const [families, setFamilies] = useState([]);
  const [loadingFamilies, setLoadingFamilies] = useState(true);
  const [errorFamilies, setErrorFamilies] = useState(null);
  const [familyCache, setFamilyCache] = useState({});
  const [familyStatus, setFamilyStatus] = useState({});
  const requestSeq = useRef(0);

  // --- 1. LOADING FAMILY
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const data = await getFamilyCounts();
        setFamilies(data);
      } catch (err) {
        setErrorFamilies(err.message);
      } finally {
        setLoadingFamilies(false);
      }
    }
    fetchInitialData();
  }, []);

  // --- 2. PROGRESS SIMULATION (Helper)
  const startProgress = (family) => {
    let p = 0;
    setFamilyStatus((prev) => ({
      ...prev,
      [family]: { loading: true, loaded: false, progress: 0 },
    }));
    const t = setInterval(() => {
      p = Math.min(90, p + Math.random() * 12);
      setFamilyStatus((prev) => {
        const cur = prev[family];
        if (!cur || !cur.loading) return prev;
        return { ...prev, [family]: { ...cur, progress: p } };
      });
    }, 180);
    return () => clearInterval(t);
  };

  // --- 3. LOADING SPECIES
  const fetchFamilySpecies = async (family) => {
    if (familyCache[family]?.length || familyStatus[family]?.loading) return;

    const seq = ++requestSeq.current;
    const stop = startProgress(family);

    try {
      const data = await getSpeciesByFamily(family);
      if (seq !== requestSeq.current) return;
      
      setFamilyCache((prev) => ({ ...prev, [family]: data }));
      setFamilyStatus((prev) => ({
        ...prev,
        [family]: { loading: false, loaded: true, progress: 100 },
      }));
    } catch (err) {
      setFamilyStatus((prev) => ({
        ...prev,
        [family]: { loading: false, loaded: false, progress: 0, error: err.message },
      }));
    } finally {
      stop();
    }
  };

  return {
    families,
    loadingFamilies,
    errorFamilies,
    familyCache,
    familyStatus,
    fetchFamilySpecies
  };
}
