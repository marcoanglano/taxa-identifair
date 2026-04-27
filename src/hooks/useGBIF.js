import { useState, useEffect } from 'react';
import { getTaxonomyGBIF, getNomenclatureGBIF } from '../services/dataService';

export const useGBIF = (gbifId) => {
  const [taxonomy, setTaxonomyGBIF] = useState(null);
  const [synonyms, setSynonyms] = useState([]);
  const [basionym, setBasionym] = useState(null);
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

        // Nomenclature
        const nomData = await getNomenclatureGBIF(gbifId, taxData?.basionymKey);
        setSynonyms(nomData.synonyms);
        setBasionym(nomData.basionym);

      } catch (err) {
        console.error("Error in recovering data from GBIF:", err);
        setErrorGBIF(err.message);
      } finally {
        setLoadingGBIF(false);
      }
    };

    fetchGBIFData();
  }, [gbifId]);

  return { taxonomy, synonyms, basionym, loading, error };
};
