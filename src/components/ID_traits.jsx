// ##### IMPORTS #####
// COMPONENTS
import Accordion from "./Accordion";
import Icon from "./Icon";


// ##### RENDERING #####
export default function ID_traits({ traits = [], selectedTraits = [], onSelect }) {
    return (
        <div id="traits-container">
            <h4>Traits</h4>

            {/* ### ACCORDION ### */}
            <Accordion
                items={traits.map((trait) => {
                    const isSelected = selectedTraits.find((t) => t.traitId === trait.id);
                    const accordionTitle = isSelected // Adds selected state to title
                        ? `${trait.name} (${isSelected.stateValue})`
                        : trait.name;
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
                                <span className="traits-title">{accordionTitle}</span>
                            </span>
                        ),

                        // # Content #
                        content: (
                            <div className="states-grid">
                                {trait.states.map((state) => {
                                    const isCurrentStateActive = isSelected?.stateId === state.id;
                                    return (
                                        <button
                                            key={state.id}
                                            className={`state-btn ${isCurrentStateActive ? "state-active" : ""}`}
                                            onClick={() => onSelect(trait.id, trait.name, state.id, state.value, state.stateIcon)}
                                        >
                                            <Icon iconUrl={state.stateIcon} />
                                            <span>{state.value}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )
                        
                    };
                })}
            />
        </div>
    );
}
