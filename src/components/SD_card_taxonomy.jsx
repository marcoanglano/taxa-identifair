// SOFT DEPENDENCY: GBIF dependant


// ##### PROPS #####
export default function SD_card_taxonomy({ taxonomy }) {
    if (!taxonomy) return null;


    // ##### RENDERING #####
    return (
        <div className="card-section" id="taxonomy-section">
            <h5>Taxonomy:</h5>
            <p>
                {Object.entries(taxonomy).map(([rank, value], i) => (
                    value ? (
                        <span key={rank}>
                            {i > 0 && " > "}
                            {rank === "genus" ? <em>{value}</em> : value}
                        </span>
                    ) : null
                ))}
            </p>
        </div>
    );
}
