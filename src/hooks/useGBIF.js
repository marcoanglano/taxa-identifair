// ##### IMPORTS #####
// LIB
import { useEffect, useState } from 'react';
// SERVICES
import { checkStatusGBIF, getTaxonomyGBIF } from '../services/dataService';


// ##### NOMENCLATURE & TAXONOMY #####
export const useGBIF = (gbifID) => {

  // ### STATES ###
  const [basionym, setBasionym] = useState(null);
  const [synonyms, setSynonyms] = useState([]);
  const [taxonomy, setTaxonomyGBIF] = useState(null);
  const [loading, setLoadingGBIF] = useState(false);
  const [error, setErrorGBIF] = useState(null);

  // ### DATA EXTRACTION ###
  useEffect(() => {
    if (!gbifID) return;
    const controller = new AbortController();
    const fetchGBIFData = async () => {
      setLoadingGBIF(true);
      setErrorGBIF(null);

      try {
        const info = await getTaxonomyGBIF(gbifID, { signal: controller.signal });
        // Taxonomy
        setTaxonomyGBIF({
          kingdom: info.kingdom,
          phylum: info.phylum,
          class: info.class,
          order: info.order,
          family: info.family,
          genus: info.genus
        });
        // Nomenclature
        setSynonyms(info.synonyms);
        setBasionym(info.basionym);
      }
      catch (err) { if (error.name !== "AbortError") setErrorGBIF(error.message); }
      finally { if (!controller.signal.aborted) setLoadingGBIF(false); }
    };
    fetchGBIFData();
    return () => controller.abort();
  }, [gbifID]);

  return { taxonomy, synonyms, basionym, loading, error };
};


// ##### OCCURRENCES #####
export const useOccurrencesGBIF = (gbifID) => {

  // ### STATES ###
  const [gbifOldID, setgbifOldID] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ### GET MAP ###
  useEffect(() => {
    if (!gbifID) {
      setgbifOldID(null);
      return;
    }
    let isMounted = true;
    const checkMapService = async () => {
      setLoading(true);
      setError(null);
      setgbifOldID(null);

      try {
        const resolvedID = await checkStatusGBIF(gbifID);
        if (isMounted) setgbifOldID(resolvedID);
      }
      catch (err) {
        if (isMounted) {
          setError(err.message);
          setgbifOldID(null);
        }
      }
      finally { if (isMounted) setLoading(false); }
    };
    checkMapService();
    return () => { isMounted = false; };
  }, [gbifID]);

  return {
    gbifOldID,
    mapReady: Boolean(gbifOldID),
    loading,
    error
  };
};
