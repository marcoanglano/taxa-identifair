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


// ##### RESOLVE SIDE ICONS #####
function resolveSideIcons(leftStates = [], rightStates = [], canBeAsymmetric = false) {
    const hasLeft = leftStates.length > 0;
    const hasRight = rightStates.length > 0;

    // No states
    if (!hasLeft && !hasRight) { return []; }

    // Symmetric
    if (!canBeAsymmetric) {
        const states = hasLeft ? leftStates : rightStates;
        return states.map((stateId) => ({ stateId, sideLabel: null }));
    }

    // Asymmetric
    // - Sides equal
    const isSameState = hasLeft && hasRight && leftStates.length === rightStates.length &&
        leftStates.every((val, idx) => val === rightStates[idx]);
    if (isSameState) { return leftStates.map((stateId) => ({ stateId, sideLabel: "Left & Right side", })); }
    // - Sides different
    if (hasLeft && hasRight && !isSameState) {
        return [
        ...leftStates.map((stateId) => ({ stateId, sideLabel: "Left side" })),
        ...rightStates.map((stateId) => ({ stateId, sideLabel: "Right side" })),
        ];
    }
    // - Missing data
    if (hasLeft && !hasRight) { return leftStates.map((stateId) => ({ stateId, sideLabel: "Left side" })); }
    if (!hasLeft && hasRight) { return rightStates.map((stateId) => ({ stateId, sideLabel: "Right side" })); }

    return [];
}


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
                                    const leftStates = t[`${sex.key}_left_states`] || [];
                                    const rightStates = t[`${sex.key}_right_states`] || [];
                                    const canBeAsymmetric = t.traits?.can_be_asymmetric ?? false;
                                    const notes = t[`${sex.key}_notes`];
                                    const notesUrl = t[`${sex.key}_notes_url`];
                                    const resolvedIcons = resolveSideIcons(leftStates, rightStates, canBeAsymmetric);

                                    return resolvedIcons.map((iconData, i) => {
                                        const stateObj = allStates.find((s) => s.id_state === iconData.stateId);
                                        const stateLabel = stateObj?.state_label || iconData.stateId;
                                        const iconUrl = stateObj?.state_icon_url;
                                        const sideInfo = iconData.sideLabel ? ` (${iconData.sideLabel})` : "";
                                        const notesText = notes ? `. ${notes}` : ".";
                                        const notesTextBar = iconUrl ? `${notesText}${barText}` : notesText;
                                        const tooltipContent = (
                                        <span>
                                            {traitName.toUpperCase()} ({sex.label}){sideInfo}: {stateLabel.toUpperCase()}
                                            {notesTextBar}
                                        </span>
                                        );

                                        return (
                                            <Icon
                                                key={`${sex.key}-${iconData.stateId}-${i}`}
                                                iconUrl={iconUrl}
                                                size={36}
                                                color={sex.color}
                                                className={sex.className}
                                                tooltipText={tooltipContent}
                                                tooltipImage={notesUrl}
                                            />
                                        );
                                    });
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
