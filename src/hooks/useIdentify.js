// ========== IMPORTS ==========
// LIB
import { useState } from 'react';

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

    // States
    const [selectedTraits, setSelectedTraits] = useState([]);

    // Handlers
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
        filters,
        selectedTraits,
        handleFilterChange,
        handleTraitSelect,
        handleRemoveTrait
    }
}