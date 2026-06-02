// ========== IMPORTS ==========
// LIB
import { useState, useEffect } from 'react';
// SERVICES
import { checkStatusGBIF } from '../services/dataService';

export const useOccurrencesGBIF = (gbifId) => {
    const [mapReady, setMapReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
            if (!gbifId) return;

            const checkMapService = async () => {
                setLoading(true);
                setError(null);

                try {
                    await checkStatusGBIF(gbifId);
                    setMapReady(true);
                
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            checkMapService();
        }, [gbifId]);

    return { mapReady, loading, error };
};
