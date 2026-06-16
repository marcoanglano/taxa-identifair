// ========== IMPORTS ==========
// COMPONENTS
import Accordion from "../components/Accordion";
import Skeleton from "../components/Skeleton";
// LIB
import React, { useState } from "react";
// STYLES
import "../styles/Identify.css";


// ========== MOCK DATA (substitute with Supabase data in the future) ==========
const MOCK_FILTERS_SCHEMA = [
  {
    id: "sex",
    label: "Sex",
    type: "select", // può essere 'select', 'number_range', ecc.
    options: ["female", "male"]
  },
  {
    id: "environment",
    label: "Environment",
    type: "select",
    options: ["marine", "brackish", "freshwater"]
  },
  {
    id: "length",
    label: "Body Length (mm)",
    type: "range", // Tipo speciale per i range numerici
    inputs: [
      { id: "minLength", label: "Min" },
      { id: "maxLength", label: "Max" }
    ]
  }
];

const MOCK_TRAITS = [
  {
    id: "t1",
    name: "Prosomal shape",
    states: [
      { id: "s1", value: "rounded" },
      { id: "s2", value: "pointed" }
    ]
  },
  {
    id: "t2",
    name: "Urosome somites count",
    states: [
      { id: "s3", value: "3 somites" },
      { id: "s4", value: "4 somites" },
      { id: "s5", value: "5 somites" }
    ]
  }
];


export default function Identify() {
  // ========== FILTERS ==========
  // States
  const [filters, setFilters] = useState({
    sex: "",
    environment: "",
    minLength: "",
    maxLength: ""
  });
  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  // ========== TRAITS ==========
  // States
  const [selectedTraits, setSelectedTraits] = useState([]);
  // Handlers
  const handleTraitSelect = (traitId, traitName, stateId, stateValue) => {
    setSelectedTraits((prev) => {
      const exists = prev.find((item) => item.traitId === traitId);
      // Trait already selected, update its state
      if (exists) {
        // deselect
        if (exists.stateId === stateId) {
          return prev.filter((item) => item.traitId !== traitId);
        }
        // select
        return prev.map((item) =>
          item.traitId === traitId ? { ...item, stateId, stateValue } : item
        );
      // Trait not selected yet, add state
      } else {
        return [...prev, { traitId, traitName, stateId, stateValue }];
      }
    });
  };
  // Deselection
  const handleRemoveTrait = (traitId) => {
    setSelectedTraits((prev) => prev.filter((item) => item.traitId !== traitId));
  };


  // ========== RENDERING ==========
  return (
    <section id="identify-container">


      {/* ===== LEFT COLUMN ===== */}
      <div id="left-column">
        <h3 id="identify-title">Identify</h3>
        <div id="filters-traits-container">

          {/* FILTERS */}
          <div className="filters-color" id="filters-container">
            <h4>Contextual filters</h4>
            <div id="dynamic-filters-grid">
              {MOCK_FILTERS_SCHEMA.map((filter) => {
                if (filter.type === "select") {
                  return (
                    <div key={filter.id} className="filter-group filters-input-col">
                      <label className="filter-label">{filter.label}</label>
                      <select
                        className="filter-select"
                        value={filters[filter.id] || ""}
                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                      >
                        <option value="">All</option>
                        {filter.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                if (filter.type === "range") {
                  return (
                    <div key={filter.id} className="filter-group filters-input-col">
                      <label className="filter-label">{filter.label}</label>
                      <div className="range-inputs-container">
                        {filter.inputs.map((input) => (
                          <input
                            key={input.id}
                            type="number"
                            step="0.1"
                            className="filter-input"
                            placeholder={input.label}
                            value={filters[input.id] || ""}
                            onChange={(e) => handleFilterChange(input.id, e.target.value)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* TRAITS */}
          <div id="traits-container">
            <h4>Traits</h4>
            <div id="dynamic-traits-list">
              <Accordion
                items={MOCK_TRAITS.map((trait) => {
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
                              onClick={() => handleTraitSelect(trait.id, trait.name, state.id, state.value)}
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
          </div>
        </div>
      </div>


      {/* ===== RIGHT COLUMN ===== */}
      <div id="right-column">

        {/* ACTIVE TRAITS */}
        <div id="active-traits-summary">
          <h4 className="match-title">
            Selected Traits{selectedTraits.length ? (` (${selectedTraits.length})`) : ""}
          </h4>
          {selectedTraits.length ? (
            <div className="badges-wrapper">
              {selectedTraits.map((trait) => (
                <div key={trait.traitId} className="active-trait-badge">
                  <span>{trait.traitName}: <strong>{trait.stateValue}</strong></span>
                  <button 
                    className="clear-badge-btn"
                    onClick={() => handleRemoveTrait(trait.traitId)}
                    title="Remove this character"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          ) : ( <p>None.</p> )}
        </div>

        
        {/* MATCHING SPECIES */}
        <h4 className="match-title">Matching Species</h4>
        <p>Here I have to put the matching species (and traits de-selection?).</p>
      </div>
    </section>
  )
}
