// ##### IMPORTS #####
// COMPONENTS
import Icon from "./Icon";


// ##### RENDERING #####
export default function ID_active({ selectedTraits = [], onRemove }) {
    return (
        <div id="active-states">
            <h4 className="title-margin">
                Selected Traits{selectedTraits.length ? (` (${selectedTraits.length})`) : ""}
            </h4>

            {/* ##### ACTIVE STATES ##### */}
            {selectedTraits.length ? (
                <div className="badge-wrapper">
                    {selectedTraits.map((trait) => {
                        const tooltipText = `${trait.traitName}: ${trait.stateValue}`;
                        return (
                            <button
                                key={trait.traitId}
                                className="badge-active"
                                onClick={() => onRemove(trait.traitId)}
                            >
                                <Icon
                                    iconUrl={trait.iconUrl}
                                    size={36}
                                    color="currentColor"
                                    tooltipText={tooltipText}
                                />
                                &times;
                            </button>
                        );
                    })}
                </div>
            ) : ( <p>None.</p> )}
        </div>
    );
}
