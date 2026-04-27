// SOFT DEPENDENCY: GBIF dependant

// UTILS
import { formatScientificName } from "../utils/speciesHelpers.jsx";

export default function SD_cards({
    title,
    classname,
    id,
    content,

    basionym,      // from GBIF (string)
    synonyms,       // from GBIF (array of strings)
    taxonomy,       // from GBIF {kingdom, phylum, class, order, family, genus}
    environment     // from SUPABASE {marine, brackish, freshwater}
}) {

    // Check if nomenclatur data is available
    const hasNomenclature = basionym || (synonyms && synonyms.length > 0);


    
    // ========== RENDERING ==========
    return (
        <div className={classname} id={id}>
            { id !== "synbas-section" && (
                <h5>{title}:</h5>
            )}

            {/* ===== BASIONYM & SYNONYMS ===== */}
            { id === "synbas-section" && (
                <>
                    {!hasNomenclature ? (
                        <p id="no-nomenclature">No basionym/synonyms found</p>
                    ) : (
                        <ul id="syn-bas">
                            {/* Basionym */}
                            {basionym && ( <li className="bas">≡ {formatScientificName(basionym)}</li> )}
                            {/* Synonyms */}
                            {synonyms && synonyms
                                .filter(syn => syn !== basionym)
                                .map((syn, index) => (
                                    <li key={index} className="syn">= {formatScientificName(syn)}</li>
                                )
                            )}
                        </ul>
                    )}
                </>
            )}
            
            {/* ===== TAXONOMY ===== */}
            { id === "taxonomy-section" && (
                <p>{taxonomy?.kingdom} &gt; {taxonomy?.phylum} &gt; {taxonomy?.class} &gt; {taxonomy?.order} &gt; {taxonomy?.family} &gt; <em>{taxonomy?.genus}</em></p>
            )}

            {/* ===== ENVIRONMENT ===== */}
            { id === "env-section" && (
                <p>{environment?.join(', ')}</p>
            )}

            {/* ===== TEST ===== */}
            { id === "test-section" && (
                <p>{content}</p>
            )}
        </div>
    );
}
