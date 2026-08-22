// ========== IMPORTS ==========
// COMPONENTS
import Accordion from "../components/Accordion";
import Icon from "../components/Icon";
// LIB
import { useMemo } from "react";


// ========== CREATES ACCORDIONS ==========
const SpeciesTraits = ({ traits }) => {
    const accordionItems = useMemo(() => {
        if (!traits || traits.length === 0) return [];

        // ===== 1. Creates categories
        const grouped = traits.reduce((acc, item) => {
            const category = item.traits?.trait_category || "Other";
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
            return acc;
        }, {});

        // ===== 2. Adds traits to categories
        return Object.entries(grouped).map(([categoryName, traitsList]) => ({
            id: categoryName,
            title: categoryName.toUpperCase(),
            content: (
                <div className="sd-traits-grid" style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "5px 0" }}>
                    {traitsList.map((t, idx) => {
                        // Loads data
                        const allStates = t.traits?.trait_states || [];
                        const traitName = t.traits?.trait_name || "";
                        const fStates = t.f_states || [];
                        const mStates = t.m_states || [];
                        const barText = " (Bar = 100 µm)";


                        // ===== FEMALE STATES =====
                        
                        return (
                            <div key={idx} className="sd-trait-group" style={{ display: "contents" }}>
                                {/* ===== FEMALE STATES ===== */}
                                {fStates.map((stateId, i) => {
                                    const stateObj = allStates.find((s) => s.id_state === stateId);
                                    const stateLabel = stateObj?.state_label || stateId;
                                    const iconUrl = stateObj?.state_icon_url;

                                    const notesText = t.f_notes ? `. ${t.f_notes}` : ".";
                                    const notesTextBar = iconUrl ? `${notesText}${barText}` : notesText;
                                    const tooltipContent = (
                                        <span>
                                            {traitName.toUpperCase()}: {stateLabel.toUpperCase()}
                                            {notesTextBar}
                                        </span>
                                    );

                                    return (
                                        <Icon
                                            key={`f-${i}`}
                                            iconUrl={iconUrl}
                                            size={36}
                                            color="var(--female-color)"
                                            className="f-state"
                                            tooltipText={tooltipContent}
                                            tooltipImage={t.f_notes_url}
                                        />
                                    );
                                })}

                                {/* ===== MALE STATES ===== */}
                                {mStates.map((stateId, i) => {
                                    const stateObj = allStates.find((s) => s.id_state === stateId);
                                    const stateLabel = stateObj?.state_label || stateId;
                                    const iconUrl = stateObj?.state_icon_url;

                                    const notesText = t.m_notes ? `. ${t.m_notes}` : ".";
                                    const notesTextBar = iconUrl ? `${notesText}${barText}` : notesText;
                                    const tooltipContent = (
                                        <span>
                                            {traitName.toUpperCase()}: {stateLabel.toUpperCase()}
                                            {notesTextBar}
                                        </span>
                                    );

                                    return (
                                        <Icon
                                            key={`m-${i}`}
                                            iconUrl={iconUrl}
                                            size={36}
                                            color="var(--male-color)"
                                            className="m-state"
                                            tooltipText={tooltipContent}
                                            tooltipImage={t.m_notes_url}
                                        />
                                    );
                                })}
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
            {traits && traits.length > 0 ? (
                <Accordion
                    className="traits-accordion" 
                    items={accordionItems} 
                    singleOpen={false}
                    defaultAllOpen={false} 
                />
            ) : (
                <p>No traits available for this species.</p>
            )}
        </div>
    );
};

export default SpeciesTraits;
