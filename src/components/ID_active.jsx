// ##### IMPORTS #####
// COMPONENTS
import Icon from "./Icon";

export default function ID_active({ selectedTraits = [], onRemove }) {


    // ##### SYMMETRY HANDLING #####
    const activeBadges = selectedTraits.flatMap((trait) => {
        if (!trait.isAsymmetric) {
            return [{
                key: trait.traitId,
                traitId: trait.traitId,
                iconUrl: trait.iconUrl,
                tooltipText: `${trait.traitName}: ${trait.stateValue}`
            }];
        }
        const badges = [];
        if (trait.leftStateId) {
            badges.push({
                key: `${trait.traitId}-left`,
                traitId: trait.traitId,
                side: "left",
                iconUrl: trait.leftIconUrl,
                tooltipText: `${trait.traitName} (Left): ${trait.leftStateValue}`
            });
        }
        if (trait.rightStateId) {
            badges.push({
                key: `${trait.traitId}-right`,
                traitId: trait.traitId,
                side: "right",
                iconUrl: trait.rightIconUrl,
                tooltipText: `${trait.traitName} (Right): ${trait.rightStateValue}`
            });
        }
        return badges;
    });


    // ##### RENDERING #####
    return (
        <div id="active-states">
            <h4 className="title-margin">
                Selected Traits{activeBadges.length ? (` (${activeBadges.length})`) : ""}
            </h4>

            {/* # ACTIVE STATES # */}
            {activeBadges.length ? (
                <div className="badge-wrapper">
                    {activeBadges.map((badge) => (
                        <button
                            key={badge.key}
                            className="badge-active"
                            onClick={() => onRemove(badge.traitId, badge.side)}
                        >
                            <Icon
                                iconUrl={badge.iconUrl}
                                size={36}
                                color="currentColor"
                                tooltipText={badge.tooltipText}
                            />
                            &times;
                        </button>
                    ))}
                </div>
            ) : ( <p>None.</p> )}
        </div>
    );
}
