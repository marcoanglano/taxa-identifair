// ##### IMPORTS #####
// COMPONENTS
import Accordion from "./Accordion";
import Icon from "./Icon";
// LIB
import { Link } from "react-router-dom";
import { useMemo } from "react";
// UTILS
import { resolveLabels, resolveIcons } from "../utils/speciesHelpers";


// ##### PROPS #####
export default function ID_matching({
    species = [],
    loading = false,
    selectedCount = 0
}) {


    // ##### BUILDING ACCORDIONS #####
    const accordionItems = useMemo(() => {
        return species.map((sp) => {
            const isBoth = sp.match_f && sp.match_m;
            return {
                id: sp.id_species,

                // ### Title ###
                title: (
                    <>
                        <span>
                            {sp.family} - <em>{sp.scientific_name}</em>
                            {sp.hasMissingData && (
                                <span className="missing-data-icon" title="Missing data">⚠️</span>
                            )}
                        </span>
                        <span className="matching-sex">
                            {isBoth ? (
                                <span title="Matches female & male">♀ ♂</span>
                            ) : ( <>
                                {sp.match_f && <span title="Matches female">♀</span>}
                                {sp.match_m && <span title="Matches male">♂</span>}
                            </> )}
                        </span>
                    </>
                ),

                // ### Content ###
                content: ( <>
                    {sp.hasMissingData && (
                        <p className="missing-data-list" style={{ color: "var(--error-color)" }}>
                            Missing data: {sp.missingInfo.join(", ")}.
                        </p>
                    )}

                    <p className="matching-link">
                        <Link to={`/species/${sp.id_species}`} target="_blank" rel="noopener noreferrer">
                            About this species
                        </Link>
                    </p>

                    <div className="matching-details">
                        {[
                            {isMatch: sp.match_f, key: "f", label: "♀ Female", color: "var(--female-color)"},
                            {isMatch: sp.match_m, key: "m", label: "♂ Male", color: "var(--male-color)"}
                        ].map((sex) => {
                            if (!sex.isMatch) return null;
                            return (

                                // # Sex block #
                                <div key={sex.key} className={`sex-traits-block ${sex.key}-block`}>
                                    <h5>{sex.label}</h5>
                                    <ul className="sex-traits">
                                        {sp.traits_info?.map((t) => {
                                            const states = t[`${sex.key}_states`]
                                            const notes = t[`${sex.key}_notes`]
                                            const notesUrl = t[`${sex.key}_notes_url`]
                                            const labels = resolveLabels(states, t.trait_states);
                                            const icons = resolveIcons(states, t.trait_states);
                                            const tooltipContent = (
                                                <span>
                                                    {t.trait_name.toUpperCase()}: {labels.toUpperCase()}
                                                    {notes ? `. ${notes}.` : "."}
                                                    {notesUrl ? " (Bar = 100 µm)" : ""}
                                                </span>
                                            );

                                            // Rendering
                                            return (
                                                <li key={t.id_trait} className="sex-traits-item">
                                                    {icons.length > 0 && (
                                                        <span className="sex-traits-icons">
                                                            {icons.map((url, i) => (
                                                                <Icon
                                                                    key={i}
                                                                    iconUrl={url}
                                                                    size={36}
                                                                    color={sex.color}
                                                                    className={`${sex.key}-state`}
                                                                    tooltipImage={notesUrl}
                                                                    tooltipText={tooltipContent}
                                                                />
                                                            ))}
                                                        </span>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </> )
            };
        });
    }, [species]);


    // ##### RENDERING #####
    return (
        <div id="matching-container">
            <h4 className="title-margin">
              Matching Species {selectedCount > 0 ? ` (${species.length})` : ""}
            </h4>

            {/* Conditions */}
            {selectedCount === 0 && <p>Select at least one trait.</p>}
            {loading && <p>Updating matching species...</p>}
            {species.length === 0 && selectedCount !== 0 && !loading && <p>No species match all selected traits.</p>}

            {/* Accordions */}
            {selectedCount > 0 && !loading && species.length > 0 && (
                <Accordion
                    items={accordionItems}
                    defaultAllOpen={false}
                />
            )}
        </div>
    );
}
