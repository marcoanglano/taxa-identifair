// ========== IMPORTS ==========
// COMPONENTS
import Accordion from "../components/Accordion";
import Icon from "../components/Icon";
// LIB
import { useMemo } from "react";
// UTILS
import { resolveIcons, resolveLabels } from "../utils/speciesHelpers.jsx";



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
                    {traits.map((t, idx) => {
                        const allStates = t.traits?.trait_states || [];
                        
                        // Labels
                        const fLabel = t.f_states?.length > 0 && resolveLabels(t.f_states, t.traits?.trait_states);
                        const mLabel = t.m_states?.length > 0 && resolveLabels(t.m_states, t.traits?.trait_states);
                        const isEqual = fLabel && mLabel && JSON.stringify(fLabel) === JSON.stringify(mLabel);
                        
                        // Icons
                        const fIcons = resolveIcons(t.f_states, allStates);
                        const mIcons = resolveIcons(t.m_states, allStates);

                        // Notes
                        const fNotes = t.f_notes ? ". " + t.f_notes : "";
                        const mNotes = t.m_notes ? ". " + t.m_notes : "";

                        return (
                            <div key={idx}>
                                <p id="trait-name">- <strong>{t.traits?.trait_name}</strong>:</p>
                                <ul>
                                    {isEqual ? (
                                        <li className="b">{fLabel}{fNotes} {fIcons.map((url, i) => (
                                                <Icon 
                                                    key={i}
                                                    iconUrl={url}
                                                    color="var(--prim-color-L)"
                                                    className="b-state"
                                                />
                                            ))}</li>
                                    ) : (
                                        <>
                                            {fLabel && <li className="f">{fLabel}{fNotes} {fIcons.map((url, i) => (
                                                <Icon 
                                                    key={i}
                                                    iconUrl={url}
                                                    color="var(--female-color)"
                                                    className="f-state"
                                                />
                                            ))}</li>}
                                            {mLabel && <li className="m">{mLabel}{mNotes} {mIcons.map((url, i) => (
                                                <Icon 
                                                    key={i}
                                                    iconUrl={url}
                                                    color="var(--male-color)"
                                                    className="m-state"
                                                />
                                            ))}</li>}
                                            {!fLabel && !mLabel && <li>No data.</li>}
                                        </>
                                    )}
                                </ul>
                            </div>
                        );
                    })}
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
