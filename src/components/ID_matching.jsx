// ========== IMPORTS ==========
// COMPONENTS
import Accordion from "./Accordion";
import Icon from "./Icon";
// LIB
import { Link } from "react-router-dom";
import { useMemo } from "react";
// UTILS
import { resolveLabels, resolveIcons } from "../utils/speciesHelpers";


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

    
    // Building accordions
    const accordionItems = useMemo(() => {
        return species.map((sp) => {
            const isBoth = sp.match_f && sp.match_m;

            return {
                id: sp.id_species,
                title: (
                    <div className="matching-accordion-title">
                        {sp.family} - <em>{sp.scientific_name}</em>
                        <span className="match-sex-tags" style={{ marginLeft: "8px" }}>
                            {isBoth ? (
                                <span className="b" title="Matches female & male">♀ ♂</span>
                            ) : (
                                <>
                                    {sp.match_f && <span className="f" title="Matches female">♀</span>}
                                    {sp.match_m && <span className="m" title="Matches male">♂</span>}
                                </>
                            )}
                        </span>
                    </div>
                ),
                content: (
                    <div className="matching-species-detail">
                        <p style={{ marginBottom: "10px" }}>
                            <Link to={`/species/${sp.id_species}`} target="_blank" rel="noopener noreferrer">
                                Details of the species
                            </Link>
                        </p>

                        <div className="sex-lists-wrapper">
                            {/* FEMALE */}
                            {sp.match_f && (
                                <div className="sex-traits-block female-block">
                                    <h5 className="f" style={{ color: "var(--female-color)" }}>♀ Female</h5>
                                    <ul className="traits-notes-list" style={{ marginLeft: "20px" }}>
                                        {sp.traits_info?.map((t) => {
                                            const labels = resolveLabels(t.f_states, t.trait_states);
                                            const icons = resolveIcons(t.f_states, t.trait_states);
                                            const tooltipContent = (
                                                <span>
                                                    {t.trait_name.toUpperCase()}: {labels.toUpperCase()}
                                                    {t.f_notes ? `. ${t.f_notes}.` : "."}
                                                    {t.f_notes_url ? " (Bar = 100 µm)" : ""}
                                                </span>
                                            );

                                            return (
                                                <li key={t.id_trait} className="trait-note-item">
                                                    {icons.length > 0 && (
                                                        <span className="trait-icons-wrapper">
                                                            {icons.map((url, i) => (
                                                                <Icon
                                                                    key={i}
                                                                    iconUrl={url}
                                                                    size={36}
                                                                    color="var(--female-color)"
                                                                    className="f-state"

                                                                    tooltipImage={t.f_notes_url}
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
                            )}

                            {/* MALE */}
                            {sp.match_m && (
                                <div className="sex-traits-block male-block" style={{ marginTop: sp.match_f ? "12px" : "0" }}>
                                    <h5 className="m" style={{ color: "var(--male-color)" }}>♂ Male</h5>
                                    <ul className="traits-notes-list" style={{ marginLeft: "20px" }}>
                                        {sp.traits_info?.map((t) => {
                                            const labels = resolveLabels(t.m_states, t.trait_states);
                                            const icons = resolveIcons(t.m_states, t.trait_states);
                                            const tooltipContent = (
                                                <span>
                                                    {t.trait_name.toUpperCase()}: {labels.toUpperCase()}
                                                    {t.m_notes ? `. ${t.m_notes}.` : "."}
                                                    {t.m_notes_url ? " (Bar = 100 µm)" : ""}
                                                </span>
                                            );

                                            return (
                                                <li key={t.id_trait} className="trait-note-item">
                                                    {icons.length > 0 && (
                                                        <span className="trait-icons-wrapper">
                                                            {icons.map((url, i) => (
                                                                <Icon
                                                                    key={i}
                                                                    iconUrl={url}
                                                                    size={36}
                                                                    color="var(--male-color)"
                                                                    className="m-state"

                                                                    tooltipImage={t.m_notes_url}
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
                            )}
                        </div>
                    </div>
                )
            };
        });
    }, [species]);


    // RENDERING
    return (
        <div id="matching-accordion-container">
            <Accordion
                items={accordionItems}
                defaultAllOpen={false}
            />
        </div>
    );
}
