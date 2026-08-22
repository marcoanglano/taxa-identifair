// ========== IMPORTS ==========
// COMPONENTS
import Icon from "./Icon";


export default function ID_active({ selectedTraits = [], onRemove }) {
    return (
        <>
            {selectedTraits.length ? (
                <div className="badges-wrapper">
                    {/* <div className="badges-wrapper">
                        {selectedTraits.map((trait) => (
                            <div key={trait.traitId} className="active-trait-badge">
                            <span>{trait.traitName}: <strong>{trait.stateValue}</strong></span>
                            <button 
                                className="clear-badge-btn"
                                onClick={() => onRemove(trait.traitId)}
                                title="Remove this character"
                            >
                                &times;
                            </button>
                            </div>
                        ))}
                    </div> */}

                    {selectedTraits.map((trait) => {
                        const tooltipText = `${trait.traitName}: ${trait.stateValue}`;

                        return (
                            <button
                                key={trait.traitId}
                                className="active-trait-badge"
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
        </>
    );
}
