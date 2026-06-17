// ========== IMPORTS ==========
// COMPONENTS
import Accordion from "./Accordion";


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
                        title: accordionTitle,
                        content: (
                            <div className="states-buttons-grid">
                                {trait.states.map((state) => {
                                    const isCurrentStateActive = isSelected?.stateId === state.id;
                                    return (
                                        <button
                                            key={state.id}
                                            className={`state-btn ${isCurrentStateActive ? "active" : ""}`}
                                            onClick={() => onSelect(trait.id, trait.name, state.id, state.value)}
                                        >
                                            {state.value}
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
