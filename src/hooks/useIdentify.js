// ##### IMPORTS #####
// LIB
import { useState, useEffect, useMemo } from 'react';
// SERVICES
import { getFilters, getMatchingSpecies, getTraits } from '../services/dataService';

export default function useIdentify() {


    // ##### FILTERS #####

    // States
    const [filtersSchema, setFiltersSchema] = useState([]);
    const [loadingFilters, setLoadingFilters] = useState(true);
    const emptyState = { sex: "", environment: "", minLength: "", maxLength: "" }
    const [draftFilters, setDraftFilters] = useState(emptyState);
    const [appliedFilters, setAppliedFilters] = useState(emptyState);

    // Fetch
    useEffect(() => {
        let isMounted = true;
        const loadFiltersSchema = async () => {
            try {
                setLoadingFilters(true);
                const schema = await getFilters();
                if (isMounted) setFiltersSchema(schema);
            } catch (err) {
                console.error("Error fetching filters schema:", err);
            } finally {
                if (isMounted) setLoadingFilters(false);
            }
        };
        loadFiltersSchema();
        return () => { isMounted = false; };
    }, []);

    // Handlers
    const handleFilterChange = (key, value) => {
        setDraftFilters((prev) => ({ ...prev, [key]: value }));
    };
    const handleApplyFilters = () => { setAppliedFilters({ ...draftFilters }); };
    const handleClearFilters = () => {
        setDraftFilters(emptyState);
        setAppliedFilters(emptyState);
    };
    const hasDraftValues = Object.values(draftFilters).some(
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
                if (exists.stateId === stateId) {
                    return prev.filter((item) => item.traitId !== traitId);
                }
                return prev.map((item) =>
                    item.traitId === traitId ? { ...item, stateId, stateValue, iconUrl } : item
                );
            } else {
                return [...prev, { traitId, traitName, stateId, stateValue, iconUrl }];
            }
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

        return matchingSpecies
            .filter((sp) => {
                // Sex
                if (sex === "female" && !sp.match_f) return false;
                if (sex === "male" && !sp.match_m) return false;
                // Env
                if (environment && environment !== "") {
                    const spEnv = sp.filters?.environment || [];
                    if (spEnv.length > 0 && !spEnv.includes(environment)) return false;
                }
                // Length
                if (reqMin !== null || reqMax !== null) {
                    const fMin = sp.filters?.f_min ?? null;
                    const fMax = sp.filters?.f_max ?? null;
                    const mMin = sp.filters?.m_min ?? null;
                    const mMax = sp.filters?.m_max ?? null;
                    const isWithinRange = (spMin, spMax) => {
                        if (spMin === null && spMax === null) return true;
                        const effectiveMin = spMin ?? spMax;
                        const effectiveMax = spMax ?? spMin;
                        if (reqMin !== null && effectiveMax < reqMin) return false;
                        if (reqMax !== null && effectiveMax > reqMax) return false;
                        return true;
                    };
                    if (sex === "female") {
                        if (!isWithinRange(fMin, fMax)) return false;
                    } else if (sex === "male") {
                        if (!isWithinRange(mMin, mMax)) return false;
                    } else {
                        const matchFemaleRange = isWithinRange(fMin, fMax);
                        const matchMaleRange = isWithinRange(mMin, mMax);
                        if (!matchFemaleRange && !matchMaleRange) return false;
                    }
                }

                return true;
            })
            .map((sp) => ({
                ...sp,
                match_f: sex === "male" ? false : sp.match_f,
                match_m: sex === "female" ? false : sp.match_m
            }));
    }, [matchingSpecies, appliedFilters]);


    return {
        filtersSchema,
        loadingFilters,
        filters: draftFilters,
        appliedFilters,
        hasDraftValues,
        availableTraits,
        selectedTraits,
        matchingSpecies: filteredMatchingSpecies,
        loadingTraits,
        loadingMatching,
        error,
        handleFilterChange,
        handleApplyFilters,
        handleClearFilters,
        handleTraitSelect,
        handleRemoveTrait
    };
}
