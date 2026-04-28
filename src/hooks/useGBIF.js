import { useState, useEffect } from 'react';
import { getTaxonomyGBIF, getNomenclatureGBIF, getOccurrencesGBIF } from '../services/dataService';

export const useGBIF = (gbifId) => {
  const [basionym, setBasionym] = useState(null);
  const [synonyms, setSynonyms] = useState([]);
  const [taxonomy, setTaxonomyGBIF] = useState(null);
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoadingGBIF] = useState(false);
  const [error, setErrorGBIF] = useState(null);

  useEffect(() => {
    // Wait for Supabase
    if (!gbifId) return;

    const fetchGBIFData = async () => {
      setLoadingGBIF(true);
      setErrorGBIF(null);

      try {
        // Taxonomy
        const taxData = await getTaxonomyGBIF(gbifId);
        setTaxonomyGBIF(taxData);

        // Nomenclature + Occurrences in parallel
        const [nomData, occData] = await Promise.all([
          getNomenclatureGBIF(gbifId, taxData?.basionymKey),
          getOccurrencesGBIF(gbifId)
        ]);
        setSynonyms(nomData.synonyms);
        setBasionym(nomData.basionym);
        setOccurrences(occData);

      } catch (err) {
        console.error("Error in recovering data from GBIF:", err);
        setErrorGBIF(err.message);
      } finally {
        setLoadingGBIF(false);
      }
    };

    fetchGBIFData();
  }, [gbifId]);

  return { taxonomy, synonyms, basionym, occurrences, loading, error };
};
