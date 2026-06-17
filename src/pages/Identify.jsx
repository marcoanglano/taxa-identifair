// ========== IMPORTS ==========
// COMPONENTS
import Accordion from "../components/Accordion";
import Skeleton from "../components/Skeleton";
// HOOKS
import useIdentify from "../hooks/useIdentify";
// LIB
import React, { useState } from "react";
// STYLES
import "../styles/Identify.css";
// UTILS
import { MOCK_FILTERS_SCHEMA, MOCK_TRAITS } from "../utils/mockData.js";


export default function Identify() {
  // ========== HOOK ==========
  const {
    filters,
    selectedTraits,
    handleFilterChange,
    handleTraitSelect,
    handleRemoveTrait
  } = useIdentify();
  

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
