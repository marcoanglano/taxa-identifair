export default function ID_active({ selectedTraits = [], onRemove }) {
    return (
        <>
            {selectedTraits.length ? (
                <div className="badges-wrapper">
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
                </div>
            ) : ( <p>None.</p> )}
        </>
    );
}
