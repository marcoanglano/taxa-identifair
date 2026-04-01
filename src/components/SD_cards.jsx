// SOFT DEPENDENCY: GBIF dependant

export default function SD_cards({
    title,
    classname,
    id,
    content,

    taxonomy,       // from GBIF {kingdom, phylum, class, order, family, genus}
    environment     // from SUPABASE {marine, brackish, freshwater}
}) {


    
    // ========== RENDERING ==========
    return (
        <div className={classname} id={id}>
            <h5>{title}:</h5>

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
