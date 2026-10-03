// SOFT DEPENDENCY: GBIF dependant

// ##### PROPS #####
export default function SD_card_ref({ gbifKey }) {
    // Configuration
    const date = new Date().toLocaleDateString('it-IT');
    const year = new Date().getFullYear();
    // References
    const ref = [
        `GBIF Secretariat (${year}). GBIF Backbone Taxonomy. Taxon key: ${gbifKey}. [via GBIF API, ${date}]`,
        `GBIF.org (${year}). GBIF Occurrence Density Maps (Tile Service). [${date}]`,
        `Razouls C., Desreumaux N., Kouwenberg J. and de Bovée F., 2005-${year}.
        Biodiversity of Marine Planktonic Copepods (morphology, geographical distribution and biological data).
        Sorbonne University, CNRS. [${date}]`
    ]


    // ##### RENDERING #####
    return (
        <div className="card-section" id="ref-section">
            <h5>References:</h5>
            <ul id="ref-list">
                {ref.map((r, i) => ( <li key={i}>{r}</li> ))}
            </ul>
        </div>
    );
}
