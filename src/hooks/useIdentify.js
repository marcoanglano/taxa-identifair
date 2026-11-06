// ##### IMPORTS #####
// LIB
import { useState, useEffect, useMemo } from 'react';
// SERVICES
import { getFilters, getMatchingSpecies, getTraits } from '../services/dataService';

// ##### HELPER #####
// Filtra gli stati validi rimuovendo valori vuoti o nulli (evita falsi positivi da [""] o null)
const getValidStates = (arr) => (Array.isArray(arr) ? arr.filter(s => s && s.trim() !== "") : []);

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

                        // 1. Mappa i tratti inviati dal DB
                        const dbTraitsMap = new Map(traitsList.map(t => [t.id_trait, t]));

                        // 2. Costruisci traits_info garantendo la presenza di OGNI tratto selezionato
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
                                f_left_states: dbTrait?.f_left_states || [],
                                f_right_states: dbTrait?.f_right_states || [],
                                f_notes: dbTrait?.f_notes || null,
                                f_notes_url: dbTrait?.f_notes_url || null,
                                m_left_states: dbTrait?.m_left_states || [],
                                m_right_states: dbTrait?.m_right_states || [],
                                m_notes: dbTrait?.m_notes || null,
                                m_notes_url: dbTrait?.m_notes_url || null,
                            };
                        });

                        return {
                            ...sp,
                            traits_info: completeTraitsInfo
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

                    // --- VERIFICA FEMMINA (♀) ---
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

                    // --- VERIFICA MASCHIO (♂) ---
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

                // 1. PRESENZA DATO MANCANTE (Per formattazione visiva in ID_matching):
                // È true se QUALSIASI sesso combaciante ha almeno un dato mancante.
                const hasMissingData = fHasMissing || mHasMissing;

                // 2. RETROCECIONE / ORDINAMENTO IN FONDO (Per la classifica):
                // È true SOLO SE tutti i sessi che combaciano hanno dati mancanti.
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
                // Si ordina in base a `shouldDemote` invece di `hasMissingData`
                if (a.shouldDemote !== b.shouldDemote) { return a.shouldDemote ? 1 : -1; }
                if (a.family !== b.family) { return a.family.localeCompare(b.family); }
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
