// ========== IMPORTS ==========
// LIB
import { useState, useEffect } from 'react';
// SERVICES
import { checkStatusGBIF } from '../services/dataService';

export const useOccurrencesGBIF = (gbifKey) => {
    const [mapReady, setMapReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
            if (!gbifKey) return;

            const checkMapService = async () => {
                setLoading(true);
                setError(null);

                try {
                    await checkStatusGBIF(gbifKey);
                    setMapReady(true);
                
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            checkMapService();
        }, [gbifKey]);

    return { mapReady, loading, error };
};
