import { useState, useEffect } from 'react';
import { getTaxonomyGBIF } from '../services/dataService';

export const useGBIF = (gbifId) => {
  const [taxonomy, setTaxonomyGBIF] = useState(null);
  const [loading, setLoadingGBIF] = useState(false);
  const [error, setErrorGBIF] = useState(null);

  useEffect(() => {
    // Wait for Supabase
    if (!gbifId) return;

    const fetchTaxonomyGBIF = async () => {
      setLoadingGBIF(true);
      try {
        const data = await getTaxonomyGBIF(gbifId);
        setTaxonomyGBIF(data);
      } catch (err) {
        console.error("Error in recovering data from GBIF:", err);
        setErrorGBIF(err.message);
      } finally {
        setLoadingGBIF(false);
      }
    };

    fetchTaxonomyGBIF();
  }, [gbifId]);

  return { taxonomy, loading, error };
};
