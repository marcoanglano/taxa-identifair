// ========== IMPORTS ==========
// LIB
import { useState, useEffect } from 'react';
// SERVICES
import { getTaxonomyGBIF, getNomenclatureGBIF } from '../services/dataService';

export const useGBIF = (gbifKey) => {
  const [basionym, setBasionym] = useState(null);
  const [synonyms, setSynonyms] = useState([]);
  const [taxonomy, setTaxonomyGBIF] = useState(null);
  const [loading, setLoadingGBIF] = useState(false);
  const [error, setErrorGBIF] = useState(null);

  useEffect(() => {
    // Wait for Supabase
    if (!gbifKey) return;

    const fetchGBIFData = async () => {
      setLoadingGBIF(true);
      setErrorGBIF(null);

      try {
        // Taxonomy
        const taxData = await getTaxonomyGBIF(gbifKey);
        setTaxonomyGBIF(taxData);

        // Nomenclature
        const nomData = await getNomenclatureGBIF(gbifKey, taxData?.basionymKey);setSynonyms(nomData.synonyms);
        setBasionym(nomData.basionym);

      } catch (err) {
        console.error("Error in recovering data from GBIF:", err);
        setErrorGBIF(err.message);
      } finally {
        setLoadingGBIF(false);
      }
    };

    fetchGBIFData();
  }, [gbifKey]);

  return { taxonomy, synonyms, basionym, loading, error };
};
