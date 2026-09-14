// ##### IMPORTS #####
// COMPONENTS
import Accordion from "../components/Accordion";
import Icon from "../components/Icon";
// LIB
import { useMemo } from "react";


// ##### SEX CONFIGURATION #####
const sexConfig = [
  { key: "f", label: "FEMALE", color: "var(--female-color)", className: "f-state-detail" },
  { key: "m", label: "MALE", color: "var(--male-color)", className: "m-state-detail" },
];


// ##### CREATING ACCORDIONS #####
const SpeciesTraits = ({ traits }) => {
    const accordionItems = useMemo(() => {
        if (!traits || traits.length === 0) return [];

        // ### 1. Creates categories ###
        const grouped = traits.reduce((acc, item) => {
            const category = item.traits?.trait_category || "Other";
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
            return acc;
        }, {});

        // ### 2. Adds traits to categories ###
        return Object.entries(grouped).map(([categoryName, traitsList]) => ({
            id: categoryName,
            title: categoryName.toUpperCase(),
            content: (
                <div className="sd-traits-grid">
                    {traitsList.map((t, idx) => {
                        const allStates = t.traits?.trait_states || [];
                        const traitName = t.traits?.trait_name || "";
                        const barText = " (Bar = 100 µm)";
                        return (
                            <div key={idx} className="sd-traits-states">

                                {/* ### 3.1. Loading states data ### */}
                                {sexConfig.flatMap((sex) => {
                                    const states = t[`${sex.key}_states`] || [];
                                    const notes = t[`${sex.key}_notes`];
                                    const notesUrl = t[`${sex.key}_notes_url`];
                                    return states.map((stateId, i) => {
                                        const stateObj = allStates.find((s) => s.id_state === stateId);
                                        const stateLabel = stateObj?.state_label || stateId;
                                        const iconUrl = stateObj?.state_icon_url;
                                        const notesText = notes ? `. ${notes}` : ".";
                                        const notesTextBar = iconUrl ? `${notesText}${barText}` : notesText;
                                        const tooltipContent = ( <span>
                                            {traitName.toUpperCase()} ({sex.label}): {stateLabel.toUpperCase()}
                                            {notesTextBar}
                                        </span> );

                                        // 3.2. States rendering
                                        return (
                                            <Icon
                                                key={`${sex.key}-${i}`}
                                                iconUrl={iconUrl}
                                                size={36}
                                                color={sex.color}
                                                className={sex.className}
                                                tooltipText={tooltipContent}
                                                tooltipImage={notesUrl}
                                            />
                                        );
                                    })
                                })}
                            </div>
                        );
                    })}
                </div>
            )
        }));
    }, [traits]);


    // ##### RENDERING #####
    return (
        <div id="traits-section">
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
