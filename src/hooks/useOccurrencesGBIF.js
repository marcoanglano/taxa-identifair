// ========== IMPORTS ==========
// LIB
import { useState, useEffect } from 'react';
// SERVICES
import { getOccurrencesGBIF } from '../services/dataService';

export const useOccurrencesGBIF = (gbifId) => {
    const [occurrences, setOccurrences] = useState([]);
    const [loading, setLoadingOcc] = useState(false);
    const [error, setErrorOcc] = useState(null);

    useEffect(() => {
            if (!gbifId) return;

            const fetchOccs = async () => {
                setLoadingOcc(true);
                setErrorOcc(null);

                try {
                    const data = await getOccurrencesGBIF(gbifId);
                    setOccurrences(data);
                
                } catch (err) {
                    console.error("Error in recovering data from GBIF:", err);
                    setErrorOcc(err.message);
                } finally {
                    setLoadingOcc(false);
                }
            };

            fetchOccs();
        }, [gbifId]);

    return { occurrences, loading, error };
};