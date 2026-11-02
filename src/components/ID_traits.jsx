// ##### IMPORTS #####
// COMPONENTS
import Accordion from "./Accordion";
import Icon from "./Icon";


// ##### RENDERING #####
export default function ID_traits({
    traits = [],
    selectedTraits = [],
    onSelect,
    onToggleAsymmetry
}) {
    return (
        <div id="traits-container">
            <h4>Traits</h4>

            {/* ### ACCORDION ### */}
            <Accordion
                items={traits.map((trait) => {
                    const selected = selectedTraits.find((t) => t.traitId === trait.id);
                    const isAsymmetricMode = selected?.isAsymmetric || false;

                    // Header title logic
                    let labelStatus = "";
                    if (selected) {
                        if (!isAsymmetricMode && selected.stateValue) {
                            labelStatus = ` (${selected.stateValue})`;
                        } else if (isAsymmetricMode) {
                            const l = selected.leftStateValue ? `L: ${selected.leftStateValue}` : "";
                            const r = selected.rightStateValue ? `R: ${selected.rightStateValue}` : "";
                            const joined = [l, r].filter(Boolean).join(" | ");
                            if (joined) labelStatus = ` (${joined})`;
                        }
                    }

                    return {
                        id: trait.id,

                        // # Header #
                        title: (
                            <span className="traits-header">
                                <Icon
                                    iconUrl={trait.traitIcon}
                                    size={36}
                                    tooltipText={trait.description}
                                    tooltipImage={trait.descriptionUrl}
                                />
                                <span className="traits-title">{trait.name}{labelStatus}</span>
                            </span>
                        ),

                        // # Content #
                        content: (
                            <div className="trait-content-wrapper">
                                {/* Asymmetry Checkbox Toggle */}
                                {trait.canBeAsymmetric && (
                                    <div className="asymmetry-toggle-bar">
                                        <label className="asymmetry-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={isAsymmetricMode}
                                                onChange={(e) => onToggleAsymmetry(trait.id, e.target.checked)}
                                            />
                                            <span>Asymmetric trait (separate left/right states)</span>
                                        </label>
                                    </div>
                                )}

                                {/* SYMMETRIC GRID */}
                                {!isAsymmetricMode ? (
                                    <div className="states-grid">
                                        {trait.states.map((state) => {
                                            const isActive = selected?.stateId === state.id;
                                            return (
                                                <button
                                                    key={state.id}
                                                    className={`state-btn ${isActive ? "state-active" : ""}`}
                                                    onClick={() => onSelect(trait, state)}
                                                >
                                                    <Icon iconUrl={state.stateIcon} />
                                                    <span>{state.value}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* ASYMMETRIC GRID (L / R) */
                                    <div className="asymmetric-grid-container">
                                        {/* Left Side */}
                                        <div className="side-column">
                                            <span className="side-label">Left Side (L)</span>
                                            <div className="states-grid">
                                                {trait.states.map((state) => {
                                                    const isActive = selected?.leftStateId === state.id;
                                                    return (
                                                        <button
                                                            key={`left-${state.id}`}
                                                            className={`state-btn ${isActive ? "state-active" : ""}`}
                                                            onClick={() => onSelect(trait, state, "left")}
                                                        >
                                                            <Icon iconUrl={state.stateIcon} />
                                                            <span>{state.value}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Right Side */}
                                        <div className="side-column">
                                            <span className="side-label">Right Side (R)</span>
                                            <div className="states-grid">
                                                {trait.states.map((state) => {
                                                    const isActive = selected?.rightStateId === state.id;
                                                    return (
                                                        <button
                                                            key={`right-${state.id}`}
                                                            className={`state-btn ${isActive ? "state-active" : ""}`}
                                                            onClick={() => onSelect(trait, state, "right")}
                                                        >
                                                            <Icon iconUrl={state.stateIcon} />
                                                            <span>{state.value}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    };
                })}
            />
        </div>
    );
}
