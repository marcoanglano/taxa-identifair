// ========== IMPORTS ==========
// COMPONENTS
import Skeleton from "./Skeleton";
// LIB
import { Link } from "react-router-dom";


export default function ID_matching({
    species = [],
    loading = false,
    selectedCount = 0
}) {


    if (selectedCount === 0) {
        return <p className="match-placeholder">Select at least one trait.</p>;
    }
    if (loading) {
        return <p className="match-placeholder">Updating matching species...</p>;
    }
    if (species.length === 0) {
        return <p className="match-placeholder">No species match all selected traits.</p>;
    }

    
    return (
        <ul className="matching-species-list">
            {species.map((sp) => {
                const isBoth = sp.match_f && sp.match_m;

                return (
                    <li key={sp.id_species} className="matching-species-item">
                        <Link to={`/species/${sp.id_species}`} target="_blank" rel="noopener noreferrer">
                            <em>{sp.scientific_name}</em> {sp.authority}
                        </Link>
                        
                        <span className="match-sex-tags" style={{ marginLeft: "8px" }}>
                            {isBoth ? (
                                <span className="b" title="Matches female & male">(♀ ♂)</span>
                            ) : (
                                <>
                                    {sp.match_f && <span className="f" title="Matches female">(♀)</span>}
                                    {sp.match_m && <span className="m" title="Matches male">(♂)</span>}
                                </>
                            )}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}
