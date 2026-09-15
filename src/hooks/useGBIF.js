// ##### IMPORTS #####
// LIB
import { useEffect, useState } from 'react';
// SERVICES
import { checkStatusGBIF, getNomenclatureGBIF, getTaxonomyGBIF } from '../services/dataService';


// ##### NOMENCLATURE & TAXONOMY #####
export const useGBIF = (gbifKey) => {

  // ### STATES ###
  const [basionym, setBasionym] = useState(null);
  const [synonyms, setSynonyms] = useState([]);
  const [taxonomy, setTaxonomyGBIF] = useState(null);
  const [loading, setLoadingGBIF] = useState(false);
  const [error, setErrorGBIF] = useState(null);

  // ### DATA EXTRACTION ###
  useEffect(() => {
    if (!gbifKey) return;
    let isMounted = true;
    const fetchGBIFData = async () => {
      setLoadingGBIF(true);
      setErrorGBIF(null);
      try {

        // Taxonomy
        const taxData = await getTaxonomyGBIF(gbifKey);
        if (!isMounted) return;
        setTaxonomyGBIF(taxData);

        // Nomenclature
        const nomData = await getNomenclatureGBIF(gbifKey, taxData?.basionymKey);
        if (!isMounted) return;
        setSynonyms(nomData.synonyms);
        setBasionym(nomData.basionym);

      } catch (err) {
        if (isMounted) {
          console.error("Error recovering GBIF data:", err);
          setErrorGBIF(err.message);
        }
      } finally {
        if (isMounted) setLoadingGBIF(false);
      }
    };
    fetchGBIFData();
    return () => { isMounted = false; };
  }, [gbifKey]);

  return { taxonomy, synonyms, basionym, loading, error };
};


// ##### OCCURRENCES #####
export const useOccurrencesGBIF = (gbifKey) => {

    // ### STATES ###
    const [mapReady, setMapReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ### GET MAP ###
    useEffect(() => {
            if (!gbifKey) return;
            const checkMapService = async () => {
                setLoading(true);
                setError(null);
                try {
                    await checkStatusGBIF(gbifKey);
                    setMapReady(true);
                }
                catch (err) { setError(err.message); }
                finally { setLoading(false); }
            };
            checkMapService();
        }, [gbifKey]);

    return { mapReady, loading, error };
};
