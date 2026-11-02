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
    const [allTraits, setAllTraits] = useState([]);
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
                    const normalizedTraits = (data || []).map(t => {
                        // Controlla esplicitamente sia la sintassi snake_case che camelCase
                        const isAsymAllowed = Boolean(t.can_be_asymmetric ?? t.canBeAsymmetric);
                        
                        return {
                            id: t.id_trait,
                            name: t.trait_name,
                            category: t.trait_category,
                            description: t.description,
                            descriptionUrl: t.description_url,
                            traitIcon: t.trait_icon_url,
                            parentTraitId: t.parent_trait_id || null,
                            requiredStateId: t.required_state_id || null,
                            canBeAsymmetric: isAsymAllowed,
                            states: (t.trait_states || []).map(s => ({
                                id: s.id_state,
                                value: s.state_label,
                                stateIcon: s.state_icon_url
                            }))
                        };
                    });
                    setAllTraits(normalizedTraits);
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

    // Filter available traits based on parent dependencies
    const availableTraits = useMemo(() => {
        const selectedStateMap = new Map();
        selectedTraits.forEach(st => {
            if (!st.isAsymmetric && st.stateId) {
                selectedStateMap.set(st.traitId, st.stateId);
            } else if (st.isAsymmetric) {
                if (st.leftStateId) selectedStateMap.set(st.traitId, st.leftStateId);
                if (st.rightStateId) selectedStateMap.set(st.traitId, st.rightStateId);
            }
        });
        
        return allTraits.filter(trait => {
            if (!trait.parentTraitId) return true;
            const parentSelectedState = selectedStateMap.get(trait.parentTraitId);
            return parentSelectedState === trait.requiredStateId;
        });
    }, [allTraits, selectedTraits]);

    // Clean up selected traits if their parent requirement is no longer met
    useEffect(() => {
        const activeTraitIds = new Set(availableTraits.map(t => t.id));
        setSelectedTraits(prev => {
            const next = prev.filter(st => activeTraitIds.has(st.traitId));
            if (next.length !== prev.length) return next;
            return prev;
        });
    }, [availableTraits]);

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

                const symmetricStates = selectedTraits.filter(t => !t.isAsymmetric && t.stateId).map(t => t.stateId);
                const leftStates = selectedTraits.filter(t => t.isAsymmetric && t.leftStateId).map(t => t.leftStateId);
                const rightStates = selectedTraits.filter(t => t.isAsymmetric && t.rightStateId).map(t => t.rightStateId);
                const results = await getMatchingSpecies({ symmetricStates, leftStates, rightStates });

                if (isMounted) {
                    const enrichedResults = (results || []).map(sp => {
                        let rawTraits = sp.traits_info;
                        if (typeof rawTraits === 'string') {
                            try { rawTraits = JSON.parse(rawTraits); }
                            catch (e) { rawTraits = []; }
                        }
                        const traitsList = Array.isArray(rawTraits) ? rawTraits : [];

                        // 1. Consideriamo SOLO i tratti che l'utente ha effettivamente selezionato nell'interfaccia
                        const selectedTraitIds = new Set(selectedTraits.map(st => st.traitId));
                        const filteredTraitsList = traitsList.filter(ti => selectedTraitIds.has(ti.id_trait));

                        return {
                            ...sp,
                            traits_info: filteredTraitsList.map(ti => {
                                const traitObj = allTraits.find(t => t.id === ti.id_trait);
                                const selectedInfo = selectedTraits.find(st => st.traitId === ti.id_trait);

                                return {
                                    ...ti,
                                    trait_name: traitObj?.name || "",
                                    is_asymmetric_selection: selectedInfo?.isAsymmetric || false,
                                    trait_states: (traitObj?.states || []).map(s => ({
                                        id_state: s.id,
                                        state_label: s.value,
                                        state_icon_url: s.stateIcon
                                    }))
                                };
                            })
                        };
                    });
                    setMatchingSpecies(enrichedResults);
                }
            }
            catch (err) { if (isMounted) setError(err.message || "Error matching species."); }
            finally { if (isMounted) setLoadingMatching(false); }
        };
        fetchMatches();
        return () => { isMounted = false; };
    }, [selectedTraits, allTraits]);

    // Handlers
    const handleToggleAsymmetry = (traitId, isAsymmetric) => {
        setSelectedTraits((prev) => {
            const existing = prev.find((t) => t.traitId === traitId);
            const traitObj = allTraits.find((t) => t.id === traitId);

            if (!existing) {
                if (!isAsymmetric) return prev;
                return [...prev, {
                    traitId,
                    traitName: traitObj?.name || "",
                    isAsymmetric: true,
                    leftStateId: null, leftStateValue: null, leftIconUrl: null,
                    rightStateId: null, rightStateValue: null, rightIconUrl: null,
                    stateId: null, stateValue: null, iconUrl: null
                }];
            }

            if (!isAsymmetric) {
                const stateId = existing.stateId || existing.leftStateId || existing.rightStateId || null;
                if (!stateId) return prev.filter((t) => t.traitId !== traitId);
                
                return prev.map((t) => t.traitId === traitId ? {
                    ...t,
                    isAsymmetric: false,
                    stateId,
                    stateValue: existing.stateValue || existing.leftStateValue || existing.rightStateValue || "",
                    iconUrl: existing.iconUrl || existing.leftIconUrl || existing.rightIconUrl || null,
                    leftStateId: null, leftStateValue: null, leftIconUrl: null,
                    rightStateId: null, rightStateValue: null, rightIconUrl: null
                } : t);
            }

            return prev.map((t) => t.traitId === traitId ? {
                ...t,
                isAsymmetric: true,
                leftStateId: t.stateId || null,
                leftStateValue: t.stateValue || null,
                leftIconUrl: t.iconUrl || null,
                stateId: null, stateValue: null, iconUrl: null
            } : t);
        });
    };

    const handleTraitSelect = (traitObj, stateObj, side = null) => {
        setSelectedTraits((prev) => {
            const existing = prev.find((item) => item.traitId === traitObj.id);

            // --- CASE 1: SYMMETRIC ---
            if (!side) {
                if (existing) {
                    if (existing.stateId === stateObj.id) {
                        return prev.filter((item) => item.traitId !== traitObj.id);
                    }
                    return prev.map((item) => item.traitId === traitObj.id ? {
                        ...item,
                        isAsymmetric: false,
                        stateId: stateObj.id,
                        stateValue: stateObj.value,
                        iconUrl: stateObj.stateIcon
                    } : item);
                }
                return [...prev, {
                    traitId: traitObj.id,
                    traitName: traitObj.name,
                    isAsymmetric: false,
                    stateId: stateObj.id,
                    stateValue: stateObj.value,
                    iconUrl: stateObj.stateIcon
                }];
            }

            // --- CASE 2: ASYMMETRIC (L or R) ---
            const isLeft = side === "left";
            const keyId = isLeft ? "leftStateId" : "rightStateId";
            const keyVal = isLeft ? "leftStateValue" : "rightStateValue";
            const keyIcon = isLeft ? "leftIconUrl" : "rightIconUrl";

            if (existing) {
                const isDeselect = existing[keyId] === stateObj.id;
                const updated = {
                    ...existing,
                    isAsymmetric: true,
                    [keyId]: isDeselect ? null : stateObj.id,
                    [keyVal]: isDeselect ? null : stateObj.value,
                    [keyIcon]: isDeselect ? null : stateObj.stateIcon
                };

                if (!updated.leftStateId && !updated.rightStateId) {
                    return prev.filter((item) => item.traitId !== traitObj.id);
                }
                return prev.map((item) => item.traitId === traitObj.id ? updated : item);
            }

            return [...prev, {
                traitId: traitObj.id,
                traitName: traitObj.name,
                isAsymmetric: true,
                [keyId]: stateObj.id,
                [keyVal]: stateObj.value,
                [keyIcon]: stateObj.stateIcon
            }];
        });
    };

    const handleRemoveTrait = (traitId, side = null) => {
        setSelectedTraits((prev) => {
            if (!side) {
                return prev.filter((item) => item.traitId !== traitId);
            }
            return prev.map((item) => {
                if (item.traitId !== traitId) return item;
                const isLeft = side === "left";
                const updated = {
                    ...item,
                    [isLeft ? "leftStateId" : "rightStateId"]: null,
                    [isLeft ? "leftStateValue" : "rightStateValue"]: null,
                    [isLeft ? "leftIconUrl" : "rightIconUrl"]: null
                };
                return (!updated.leftStateId && !updated.rightStateId) ? null : updated;
            }).filter(Boolean);
        });
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
    }, [matchingSpecies, appliedFilters, selectedTraits]);


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
        handleToggleAsymmetry,
        handleTraitSelect,
        handleRemoveTrait
    };
}
