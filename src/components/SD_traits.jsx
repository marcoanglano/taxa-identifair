// ========== IMPORTS ==========
// COMPONENTS
import Accordion from "../components/Accordion";
// LIB
import { useMemo } from "react";
// UTILS
import { resolveLabels } from "../utils/speciesHelpers.jsx";



// ========== CREATES ACCORDIONS ==========
const SpeciesTraits = ({ traits }) => {
    const accordionItems = useMemo(() => {
        // ===== 0. Handles no traits
        if (!traits || traits.length === 0) return <p>No traits available for this species.</p>;

        // ===== 1. Creates categories
        const grouped = traits.reduce((acc, item) => {
            const category = item.traits?.trait_category || "Other";
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
            return acc;
        }, {});

        // ===== 2. Adds traits to categories
        return Object.entries(grouped).map(([categoryName, traits]) => ({
            id: categoryName,
            title: categoryName.toUpperCase(),
            content: (
                <div className="traits-group">
                    {traits.map((t, idx) => (
                    <div key={idx}>
                        <p id="trait-name">- <strong>{t.traits?.trait_name}</strong>:</p>
                        <ul>
                        {t.f_states?.length > 0 && (
                            <li className="f">
                            {resolveLabels(t.f_states, t.traits?.trait_states)}
                            </li>
                        )}
                        {t.m_states?.length > 0 && (
                            <li className="m">
                            {resolveLabels(t.m_states, t.traits?.trait_states)}
                            </li>
                        )}
                        </ul>
                    </div>
                    ))}
                </div>
            )
        }));
    }, [traits]);



    // ========== RENDERING ==========
    return (
        <div className="SUP" id="traits-section">
            <h5>Species Traits:</h5>
            <Accordion
                className="traits-accordion" 
                items={accordionItems} 
                singleOpen={false}
                defaultAllOpen={false} 
            />
        </div>
    );
};

export default SpeciesTraits;
