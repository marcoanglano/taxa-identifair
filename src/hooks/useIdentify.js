// ========== IMPORTS ==========
// LIB
import { useState, useEffect } from 'react';
// SERVICES
import { getFilters, getMatchingSpecies, getTraits } from '../services/dataService';

export default function useIdentify() {


    // ========== FILTERS ==========
    const [filtersSchema, setFiltersSchema] = useState([]);
    const [loadingFilters, setLoadingFilters] = useState(true);

    // == States ==
    // Input values
    const [draftFilters, setDraftFilters] = useState({
        sex: "",
        environment: "",
        minLength: "",
        maxLength: ""
    });
    // Applied values
    const [appliedFilters, setAppliedFilters] = useState({
        sex: "",
        environment: "",
        minLength: "",
        maxLength: ""
    });

    // Fetching
    useEffect(() => {
        const loadFiltersSchema = async () => {
            try {
                setLoadingFilters(true);
                const filters_schema = await getFilters();
                setFiltersSchema(filters_schema);
            } catch (err) {
                console.error("Error fetching filters schema:", err);
            } finally {
                setLoadingFilters(false);
            }
        };
        loadFiltersSchema();
    }, []);

    // Handlers
    const handleFilterChange = (key, value) => {
        setDraftFilters((prev) => ({ ...prev, [key]: value }));
    };
    const handleApplyFilters = () => {
        setAppliedFilters({ ...draftFilters });
    };
    const handleClearFilters = () => {
        const emptyState = { sex: "", environment: "", minLength: "", maxLength: "" };
        setDraftFilters(emptyState);
        setAppliedFilters(emptyState);
    };
    // Any input?
    const hasDraftValues = Object.values(draftFilters).some(
        (val) => val !== "" && val !== null && val !== undefined
    );


    // ========== TRAITS ==========

    // States
    const [availableTraits, setAvailableTraits] = useState([]);
    const [selectedTraits, setSelectedTraits] = useState([]);
    const [matchingSpecies, setMatchingSpecies] = useState([]);

    const [loadingTraits, setLoadingTraits] = useState(true);
    const [loadingMatching, setLoadingMatching] = useState(false);
    const [error, setError] = useState(null);

    // Fetching
    useEffect(() => {
        const loadTraits = async () => {
            try {
                setLoadingTraits(true);
                const data = await getTraits();

                // Normalize labels
                const normalizedTraits = (data || []).map(t => ({
                    id: t.id_trait,
                    name: t.trait_name,
                    category: t.trait_category,
                    description: t.trait_description,
                    traitIcon: t.trait_icon_url,
                    states: (t.trait_states || []).map(s => ({
                        id: s.id_state,
                        value: s.state_label,
                        stateIcon: s.state_icon_url
                    }))
                }));

                setAvailableTraits(normalizedTraits);
            } catch (err) {
                setError(err.message || "Error fetching traits.");
            } finally {
                setLoadingTraits(false);
            }
        };
        loadTraits();
    }, []);

    // RPC query only if any trait is selected
    useEffect(() => {
        const fetchMatches = async () => {
            if (selectedTraits.length === 0) {
                setMatchingSpecies([])
                setLoadingMatching(false);
                return;
            }

            try {
                setLoadingMatching(true);
                const stateIds = selectedTraits.map(t => t.stateId);
                const results = await getMatchingSpecies(stateIds);
                setMatchingSpecies(results);
            } catch (err) {
                setError(err.message || "Error matching species.");
            } finally {
                setLoadingMatching(false);
            }
        };

        fetchMatches();
    }, [selectedTraits]);

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
        filtersSchema,
        loadingFilters,
        filters: draftFilters,
        appliedFilters,
        hasDraftValues,
        availableTraits,
        selectedTraits,
        matchingSpecies,
        loadingTraits,
        loadingMatching,
        error,
        handleFilterChange,
        handleApplyFilters,
        handleClearFilters,
        handleTraitSelect,
        handleRemoveTrait
    }
}