// ========== IMPORTS ==========
// LIB
import { useState, useEffect } from 'react';
// SERVICES
import { getTraits } from '../services/dataService';

export default function useIdentify() {


    // ========== FILTERS ==========

    // States
    const [filters, setFilters] = useState({
        sex: "",
        environment: "",
        minLength: "",
        maxLength: ""
    });

    // Handlers
    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };


    // ========== TRAITS ==========

    // Load traits
    const [availableTraits, setAvailableTraits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetching
    useEffect(() => {
        const loadTraits = async () => {
            try {
                setLoading(true);
                const data = await getTraits();

                // Normalize labels
                const normalizedTraits = (data || []).map(t => ({
                    id: t.id_trait,
                    name: t.trait_name,
                    category: t.trait_category,
                    states: (t.trait_states || []).map(s => ({
                        id: s.id_state,
                        value: s.state_label
                    }))
                }));

                setAvailableTraits(normalizedTraits);
            } catch (err) {
                setError(err.message || "Error in fetching traits.");
            } finally {
                setLoading(false);
            }
        };
        loadTraits();
    }, []);

    // States for selected traits
    const [selectedTraits, setSelectedTraits] = useState([]);

    // Handlers (selection and deselection)
    const handleTraitSelect = (traitId, traitName, stateId, stateValue) => {
        setSelectedTraits((prev) => {
            const exists = prev.find((item) => item.traitId === traitId);
            // Trait already selected, update its state
            if (exists) {
                // deselect
                if (exists.stateId === stateId) {
                    return prev.filter((item) => item.traitId !== traitId);
                }
                // select
                return prev.map((item) =>
                    item.traitId === traitId ? { ...item, stateId, stateValue } : item
                );
                // Trait not selected yet, add state
            } else {
                return [...prev, { traitId, traitName, stateId, stateValue }];
            }
        });
    };
    // Deselection
    const handleRemoveTrait = (traitId) => {
        setSelectedTraits((prev) => prev.filter((item) => item.traitId !== traitId));
    };


    return {
        availableTraits,
        loading,
        error,
        filters,
        selectedTraits,
        handleFilterChange,
        handleTraitSelect,
        handleRemoveTrait
    }
}