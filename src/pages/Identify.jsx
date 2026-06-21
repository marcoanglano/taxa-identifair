// ========== IMPORTS ==========
// COMPONENTS
import Accordion from "../components/Accordion";
import ErrorComponent from "../components/Error";
import ID_active from "../components/ID_active";
import ID_filters from "../components/ID_filters";
import ID_matching from "../components/ID_matching";
import ID_traits from "../components/ID_traits";
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
    availableTraits,
    loading,
    error,
    filters,
    selectedTraits,
    handleFilterChange,
    handleTraitSelect,
    handleRemoveTrait
  } = useIdentify();

  // ========= CONDITIONAL RENDERING ==========
  if (error) return <ErrorComponent title="Error" message={error} />;
  if (loading) return <ErrorComponent title="Loading" message="Loading traits..." />;
  

  // ========== RENDERING ==========
  return (

    <section id="identify-container">

      {/* ===== ERROR ===== */}
      {error && <Error title="Error" message={error} />}
      {/* ===== LOADING ===== */}
      {loading && (
        <Error title="Loading" message="Loading traits..." />
      )}


      {/* ===== TRUE RENDERING ===== */}
      {!error && !loading && ( <>
        {/* ===== LEFT COLUMN ===== */}
        <div id="left-column">
          <h3 id="identify-title">Identify</h3>
          <div id="filters-traits-container">

            {/* FILTERS */}
            <div className="filters-color" id="filters-container">
              <h4>Contextual filters</h4>
              <ID_filters schema={MOCK_FILTERS_SCHEMA} values={filters} onChange={handleFilterChange} />
            </div>

            {/* TRAITS */}
            <div id="traits-container">
              <h4>Traits</h4>
              <ID_traits traits={availableTraits} selectedTraits={selectedTraits} onSelect={handleTraitSelect} />
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
            <ID_active selectedTraits={selectedTraits} onRemove={handleRemoveTrait} />
          </div>

          
          {/* MATCHING SPECIES */}
          <h4 className="match-title">Matching Species</h4>
          <ID_matching />
        </div>
      </> )}
    </section>
  )
}
