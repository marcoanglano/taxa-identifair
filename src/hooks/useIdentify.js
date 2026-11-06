// ##### IMPORTS #####
import { useState, useEffect, useMemo } from 'react';
import { getFilters, getTraits, getIdentificationDataset } from '../services/dataService';
import { calculateMatchesJS } from '../utils/matchingEngine';

const getValidStates = (arr) => (Array.isArray(arr) ? arr.filter(s => s && s.trim() !== "") : []);

export default function useIdentify() {
    // Statics / Schema
    const emptyState = { sex: "", environment: "", minLength: "", maxLength: "" };
    const [filtersSchema, setFiltersSchema] = useState([]);
    const [loadingFilters, setLoadingFilters] = useState(true);
    const [filters, setFilters] = useState(emptyState);
    const [appliedFilters, setAppliedFilters] = useState(emptyState);

    // Full Local Dataset state (Caricamento automatico da IndexedDB/Supabase)
    const [dataset, setDataset] = useState([]);
    const [loadingDataset, setLoadingDataset] = useState(true);

    const [allTraits, setAllTraits] = useState([]);
    const [selectedTraits, setSelectedTraits] = useState([]);
    const [loadingTraits, setLoadingTraits] = useState(true);
    const [error, setError] = useState(null);

    // 1. CARICAMENTO AUTOMATICO DATASET & FILTRI AL MOUNT
    useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            try {
                setLoadingFilters(true);
                setLoadingDataset(true);
                
                const [schema, fullData] = await Promise.all([
                    getFilters(),
                    getIdentificationDataset() // <- Fa partire l'auto-sync/fetch su IndexedDB
                ]);

                if (isMounted) {
                    setFiltersSchema(schema);
                    setDataset(fullData);
                }
            } catch (err) {
                if (isMounted) setError(err.message || "Errore nel caricamento del dataset.");
            } finally {
                if (isMounted) {
                    setLoadingFilters(false);
                    setLoadingDataset(false);
                }
            }
        };
        loadInitialData();
        return () => { isMounted = false; };
    }, []);

    // Debounce filtri contestuali
    useEffect(() => {
        const handler = setTimeout(() => { setAppliedFilters(filters); }, 300);
        return () => clearTimeout(handler);
    }, [filters]);

    const handleFilterChange = (key, value) => { setFilters((prev) => ({ ...prev, [key]: value })); };
    const handleClearFilters = () => {
        setFilters(emptyState);
        setAppliedFilters(emptyState);
    };
    const hasDraftValues = Object.values(filters).some(
        (val) => val !== "" && val !== null && val !== undefined
    );

    // Fetch Tratti
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
                        parentTraitId: t.parent_trait_id || null,
                        requiredStateId: t.required_state_id || null,
                        canBeAsymmetric: Boolean(t.can_be_asymmetric ?? t.canBeAsymmetric),
                        states: (t.trait_states || []).map(s => ({
                            id: s.id_state,
                            value: s.state_label,
                            stateIcon: s.state_icon_url
                        }))
                    }));
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

    // Gestione gerarchia tratti parent/child
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

    useEffect(() => {
        const activeTraitIds = new Set(availableTraits.map(t => t.id));
        setSelectedTraits(prev => {
            const next = prev.filter(st => activeTraitIds.has(st.traitId));
            if (next.length !== prev.length) return next;
            return prev;
        });
    }, [availableTraits]);

    // 2. ESECUZIONE MATCHING IN-MEMORY ISTANTANEO (Zero latenza di rete!)
    const rawMatchingSpecies = useMemo(() => {
        if (!selectedTraits.length || !dataset.length) return [];
        
        const results = calculateMatchesJS(dataset, selectedTraits);

        return results.map(sp => {
            const dbTraitsMap = new Map((sp.traits_info || []).map(t => [t.id_trait, t]));
            const completeTraitsInfo = selectedTraits.map(st => {
                const dbTrait = dbTraitsMap.get(st.traitId);
                const traitObj = allTraits.find(t => t.id === st.traitId);

                return {
                    id_trait: st.traitId,
                    trait_name: traitObj?.name || "",
                    is_asymmetric_selection: st.isAsymmetric || false,
                    trait_states: (traitObj?.states || []).map(s => ({
                        id_state: s.id,
                        state_label: s.value,
                        state_icon_url: s.stateIcon
                    })),
                    f_left_states: dbTrait?.f_left || [],
                    f_right_states: dbTrait?.f_right || [],
                    f_notes: dbTrait?.f_notes || null,
                    f_notes_url: dbTrait?.f_notes_url || null,
                    m_left_states: dbTrait?.m_left || [],
                    m_right_states: dbTrait?.m_right || [],
                    m_notes: dbTrait?.m_notes || null,
                    m_notes_url: dbTrait?.m_notes_url || null,
                };
            });

            return { ...sp, traits_info: completeTraitsInfo };
        });
    }, [dataset, selectedTraits, allTraits]);

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

    // Filter contestuali sulle specie matchate
    const filteredMatchingSpecies = useMemo(() => {
        if (!rawMatchingSpecies || rawMatchingSpecies.length === 0) return [];
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

        return rawMatchingSpecies
            .map((sp) => {
                const { f_min = null, f_max = null, m_min = null, m_max = null } = sp.filters || {};
                
                let match_f = Boolean(sp.match_f) && (sex !== "male") && isWithinRange(f_min, f_max);
                let match_m = Boolean(sp.match_m) && (sex !== "female") && isWithinRange(m_min, m_max);
                
                const missing_f = [];
                const missing_m = [];

                if ((reqMin !== null || reqMax !== null)) {
                    if (match_f && f_min === null) missing_f.push("Female body length");
                    if (match_m && m_min === null) missing_m.push("Male body length");
                }

                const speciesTraitsMap = new Map((sp.traits_info || []).map((t) => [t.id_trait, t]));

                selectedTraits.forEach((st) => {
                    const traitData = speciesTraitsMap.get(st.traitId);
                    
                    if (!traitData) {
                        if (match_f) missing_f.push(`${st.traitName} (♀)`);
                        if (match_m) missing_m.push(`${st.traitName} (♂)`);
                        return;
                    }

                    if (match_f) {
                        if (!st.isAsymmetric) {
                            const fLeft = getValidStates(traitData.f_left_states);
                            const fRight = getValidStates(traitData.f_right_states);
                            const fStates = fLeft.length > 0 ? fLeft : fRight;
                            
                            if (fStates.length === 0) {
                                missing_f.push(`${st.traitName} (♀)`);
                            } else if (st.stateId && !fStates.includes(st.stateId)) {
                                match_f = false;
                            }
                        } else {
                            if (st.leftStateId) {
                                const left = getValidStates(traitData.f_left_states);
                                if (left.length === 0) missing_f.push(`${st.traitName} Left (♀)`);
                                else if (!left.includes(st.leftStateId)) match_f = false;
                            }
                            if (st.rightStateId) {
                                const right = getValidStates(traitData.f_right_states);
                                if (right.length === 0) missing_f.push(`${st.traitName} Right (♀)`);
                                else if (!right.includes(st.rightStateId)) match_f = false;
                            }
                        }
                    }

                    if (match_m) {
                        if (!st.isAsymmetric) {
                            const mLeft = getValidStates(traitData.m_left_states);
                            const mRight = getValidStates(traitData.m_right_states);
                            const mStates = mLeft.length > 0 ? mLeft : mRight;
                            
                            if (mStates.length === 0) {
                                missing_m.push(`${st.traitName} (♂)`);
                            } else if (st.stateId && !mStates.includes(st.stateId)) {
                                match_m = false;
                            }
                        } else {
                            if (st.leftStateId) {
                                const left = getValidStates(traitData.m_left_states);
                                if (left.length === 0) missing_m.push(`${st.traitName} Left (♂)`);
                                else if (!left.includes(st.leftStateId)) match_m = false;
                            }
                            if (st.rightStateId) {
                                const right = getValidStates(traitData.m_right_states);
                                if (right.length === 0) missing_m.push(`${st.traitName} Right (♂)`);
                                else if (!right.includes(st.rightStateId)) match_m = false;
                            }
                        }
                    }
                });

                const fHasMissing = match_f && missing_f.length > 0;
                const mHasMissing = match_m && missing_m.length > 0;

                const hasMissingData = fHasMissing || mHasMissing;

                let shouldDemote = false;
                if (match_f && match_m) {
                    shouldDemote = fHasMissing && mHasMissing;
                } else if (match_f) {
                    shouldDemote = fHasMissing;
                } else if (match_m) {
                    shouldDemote = mHasMissing;
                }

                const missingInfo = [...new Set([...(match_f ? missing_f : []), ...(match_m ? missing_m : [])])];

                return { ...sp, match_f, match_m, hasMissingData, shouldDemote, missingInfo };
            })
            .filter((sp) => sp.match_f || sp.match_m)
            .sort((a, b) => {
                if (a.shouldDemote !== b.shouldDemote) { return a.shouldDemote ? 1 : -1; }
                if (a.family !== b.family) { return a.family.localeCompare(b.family); }
                return a.scientific_name.localeCompare(b.scientific_name);
            });
    }, [rawMatchingSpecies, appliedFilters, selectedTraits]);

    return {
        filtersSchema,
        loadingFilters: loadingFilters || loadingDataset,
        filters,
        appliedFilters,
        hasDraftValues,
        availableTraits,
        selectedTraits,
        matchingSpecies: filteredMatchingSpecies,
        loadingTraits,
        loadingMatching: false, // Azzerato! Non c'è più attesa di rete quando si selezionano i tratti
        error,
        handleFilterChange,
        handleClearFilters,
        handleToggleAsymmetry,
        handleTraitSelect,
        handleRemoveTrait
    };
}
