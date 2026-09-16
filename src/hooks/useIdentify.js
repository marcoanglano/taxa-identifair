// ##### IMPORTS #####
// LIB
import { useState, useEffect, useMemo } from 'react';
// SERVICES
import { getFilters, getMatchingSpecies, getTraits } from '../services/dataService';

export default function useIdentify() {


    // ##### FILTERS #####

    // States
    const emptyState = { sex: "", environment: "", minLength: "", maxLength: "" };
    const [filtersSchema, setFiltersSchema] = useState([]);
    const [loadingFilters, setLoadingFilters] = useState(true);
    // Active state (user input)
    const [filters, setFilters] = useState(emptyState);
    // Debounce state
    const [appliedFilters, setAppliedFilters] = useState(emptyState);

    // Fetch
    useEffect(() => {
        let isMounted = true;
        const loadFiltersSchema = async () => {
            try {
                setLoadingFilters(true);
                const schema = await getFilters();
                if (isMounted) setFiltersSchema(schema);
            }
            catch (err) { console.error("Error fetching filters schema:", err); }
            finally { if (isMounted) setLoadingFilters(false); }
        };
        loadFiltersSchema();
        return () => { isMounted = false; };
    }, []);

    // Debounce (300ms)
    useEffect(() => {
        const handler = setTimeout(() => { setAppliedFilters(filters); }, 300);
        return () => clearTimeout(handler);
    }, [filters]);

    // Handlers
    const handleFilterChange = (key, value) => { setFilters((prev) => ({ ...prev, [key]: value })); };
    const handleClearFilters = () => {
        setFilters(emptyState);
        setAppliedFilters(emptyState);
    };
    const hasDraftValues = Object.values(filters).some(
        (val) => val !== "" && val !== null && val !== undefined
    );


    // ##### TRAITS & MATCHING SPECIES #####

    // States
    const [availableTraits, setAvailableTraits] = useState([]);
    const [selectedTraits, setSelectedTraits] = useState([]);
    const [matchingSpecies, setMatchingSpecies] = useState([]);
    const [loadingTraits, setLoadingTraits] = useState(true);
    const [loadingMatching, setLoadingMatching] = useState(false);
    const [error, setError] = useState(null);

    // Fetch Traits
    useEffect(() => {
        let isMounted = true;
        const loadTraits = async () => {
            try {
                setLoadingTraits(true);
                const data = await getTraits();
                if (isMounted) {
                    const normalizedTraits = (data || []).map(t => ({
                        id: t.id_trait,
                        name: t.trait_name,
                        category: t.trait_category,
                        description: t.description,
                        descriptionUrl: t.description_url,
                        traitIcon: t.trait_icon_url,
                        states: (t.trait_states || []).map(s => ({
                            id: s.id_state,
                            value: s.state_label,
                            stateIcon: s.state_icon_url
                        }))
                    }));
                    setAvailableTraits(normalizedTraits);
                }
            } catch (err) {
                if (isMounted) setError(err.message || "Error fetching traits.");
            } finally {
                if (isMounted) setLoadingTraits(false);
            }
        };
        loadTraits();
        return () => { isMounted = false; };
    }, []);

    // Fetch Matching Species
    useEffect(() => {
        let isMounted = true;
        const fetchMatches = async () => {
            if (selectedTraits.length === 0) {
                setMatchingSpecies([]);
                setLoadingMatching(false);
                return;
            }
            try {
                setLoadingMatching(true);
                const stateIds = selectedTraits.map(t => t.stateId);
                const results = await getMatchingSpecies(stateIds);
                if (isMounted) setMatchingSpecies(results);
            } catch (err) {
                if (isMounted) setError(err.message || "Error matching species.");
            } finally {
                if (isMounted) setLoadingMatching(false);
            }
        };
        fetchMatches();
        return () => { isMounted = false; };
    }, [selectedTraits]);

    // Handlers
    const handleTraitSelect = (traitId, traitName, stateId, stateValue, iconUrl) => {
        setSelectedTraits((prev) => {
            const exists = prev.find((item) => item.traitId === traitId);
            if (exists) {
                if (exists.stateId === stateId) { return prev.filter((item) => item.traitId !== traitId); }
                return prev.map((item) =>
                    item.traitId === traitId ? { ...item, stateId, stateValue, iconUrl } : item
                );
            }
            else { return [...prev, { traitId, traitName, stateId, stateValue, iconUrl }]; }
        });
    };
    const handleRemoveTrait = (traitId) => {
        setSelectedTraits((prev) => prev.filter((item) => item.traitId !== traitId));
    };

    // Filter Matching Species
    const filteredMatchingSpecies = useMemo(() => {
        if (!matchingSpecies || matchingSpecies.length === 0) return [];
        const { sex, environment, minLength, maxLength } = appliedFilters;
        const reqMin = minLength !== "" && minLength !== null ? parseFloat(minLength) : null;
        const reqMax = maxLength !== "" && maxLength !== null ? parseFloat(maxLength) : null;
        const isWithinRange = (spMin, spMax) => {
            if (spMin === null && spMax === null) return true;
            const effectiveMin = spMin ?? spMax;
            const effectiveMax = spMax ?? spMin;
            if (reqMin !== null && effectiveMax < reqMin) return false;
            if (reqMax !== null && effectiveMin > reqMax) return false;
            return true;
        };

        return matchingSpecies
            .map((sp) => {
                const { f_min = null, f_max = null, m_min = null, m_max = null } = sp.filters || {};
                const match_f = sp.match_f && (sex !== "male") && isWithinRange(f_min, f_max);
                const match_m = sp.match_m && (sex !== "female") && isWithinRange(m_min, m_max);

                // Missing info
                const missingInfo = [];
                // Filters
                if ((reqMin !== null || reqMax !== null)) {
                    if (match_f && f_min === null) { missingInfo.push("Female body length"); }
                    if (match_m && m_min === null) { missingInfo.push("Male body length"); }
                }
                // Traits
                const speciesTraitIds = new Set((sp.traits_info || []).map((t) => t.id_trait));
                selectedTraits.forEach((st) => {
                    if (!speciesTraitIds.has(st.traitId)) { missingInfo.push(st.traitName); }
                });
                const hasMissingData = missingInfo.length > 0;

                return { ...sp, match_f, match_m, hasMissingData, missingInfo };
            })
            .filter((sp) => sp.match_f || sp.match_m )
            .sort((a, b) => {
                // 1. Sort by hasMissingData
                if (a.hasMissingData !== b.hasMissingData) { return a.hasMissingData ? 1 : -1; }
                // 2. Sort by Family
                if (a.family !== b.family) { return a.family.localeCompare(b.family); }
                // 3. Sort by Scientific name
                return a.scientific_name.localeCompare(b.scientific_name);
            });
    }, [matchingSpecies, appliedFilters]);


    return {
        filtersSchema,
        loadingFilters,
        filters,
        appliedFilters,
        hasDraftValues,
        availableTraits,
        selectedTraits,
        matchingSpecies: filteredMatchingSpecies,
        loadingTraits,
        loadingMatching,
        error,
        handleFilterChange,
        handleClearFilters,
        handleTraitSelect,
        handleRemoveTrait
    };
}
