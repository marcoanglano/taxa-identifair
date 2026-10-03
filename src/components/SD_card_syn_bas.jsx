// SOFT DEPENDENCY: GBIF dependant

// ##### IMPORTS #####
// UTILS
import { formatScientificName } from "../utils/speciesHelpers.jsx";


// ##### PROPS & VARIABLES #####
export default function SD_card_syn_bas({ basionym, synonyms }) {
    const hasNomenclature = basionym || (synonyms && synonyms.length > 0);


    // ##### RENDERING #####
    return (
        <div className="card-section" id="syn-bas-section">
            {!hasNomenclature ? (
                <p id="no-nomenclature">No basionym/synonyms found.</p>
            ) : (
                <ul id="syn-bas">
                    {/* Basionym */}
                    {basionym && ( <li className="bas">≡ {formatScientificName(basionym)}</li> )}
                    {/* Synonyms */}
                    {synonyms && synonyms
                        .filter(syn => syn !== basionym)
                        .map((syn, i) => ( <li key={i} className="syn">= {formatScientificName(syn)}</li> ))
                    }
                </ul>
            )}
        </div>
    );
}
