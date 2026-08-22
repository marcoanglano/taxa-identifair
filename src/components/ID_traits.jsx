// ========== IMPORTS ==========
// COMPONENTS
import Accordion from "./Accordion";
import Icon from "./Icon";


export default function ID_traits({ traits = [], selectedTraits = [], onSelect }) {
    return (
        <div id="dynamic-traits-list">
            <Accordion
                items={traits.map((trait) => {
                    const isSelected = selectedTraits.find((t) => t.traitId === trait.id);
                    const accordionTitle = isSelected
                        ? `${trait.name} (${isSelected.stateValue})`
                        : trait.name;

                    return {
                        id: trait.id,
                        title: (
                            <span className="title-wrapper">
                                <Icon
                                    iconUrl={trait.traitIcon}
                                    size={36}
                                    tooltipText={trait.description}
                                    tooltipImage={trait.descriptionUrl}
                                />
                                <span className="title-text">
                                    {accordionTitle}
                                </span>
                            </span>
                        ),
                        content: (
                            <div className="states-buttons-grid">
                                {trait.states.map((state) => {
                                    const isCurrentStateActive = isSelected?.stateId === state.id;
                                    return (
                                        <button
                                            key={state.id}
                                            className={`state-btn ${isCurrentStateActive ? "active" : ""}`}
                                            onClick={() => onSelect(trait.id, trait.name, state.id, state.value, state.stateIcon)}
                                        >
                                            <Icon
                                                iconUrl={state.stateIcon}
                                            />
                                            <span style={{ marginLeft: "10px" }}>
                                                {state.value}
                                            </span>
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
