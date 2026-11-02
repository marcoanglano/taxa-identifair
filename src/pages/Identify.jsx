// ##### IMPORTS #####
// COMPONENTS
import ErrorComponent from "../components/Error";
import ID_active from "../components/ID_active";
import ID_filters from "../components/ID_filters";
import ID_matching from "../components/ID_matching";
import ID_traits from "../components/ID_traits";
import Skeleton from "../components/Skeleton";
// HOOKS
import useIdentify from "../hooks/useIdentify";


// ##### HOOK & VARIABLES #####
export default function Identify() {
  const {
    filters, loadingFilters, filtersSchema, hasDraftValues,
    handleFilterChange, handleClearFilters,
    loadingTraits, availableTraits, selectedTraits,
    handleToggleAsymmetry, handleTraitSelect, handleRemoveTrait,
    matchingSpecies, loadingMatching, error
  } = useIdentify();


  // ##### ERROR #####
  if (error) return <ErrorComponent title="Error" message={error} />;


  // ##### LOADING: SKELETON #####
  if (loadingTraits || loadingFilters) return (
    <section id="identify-container">
      <div id="identify left">
        <h3 id="identify-title">Identify</h3>
          <div id="filters-traits-container">
            <Skeleton className="filters-color" id="filters-container" padding="0" style={{borderRadius: "0"}} />
            <Skeleton id="traits-container" />
          </div>
      </div>
      <div id="identify-right">
        <Skeleton height={480} />
      </div>
    </section>
  )
  

  // ##### RENDERING #####
  return (
    <section id="identify-container">
      {!error && !loadingTraits && ( <>

        {/* ### LEFT COLUMN ### */}
        <div id="identify-left">
          <h3 id="identify-title">Identify</h3>
          <div id="filters-traits-container">

            {/* # FILTERS # */}
            <div id="filters-container">
              <div className="filters-header">
                <h4>Contextual filters</h4>
                <div className="filters-actions">
                  <button
                    type="button"
                    className="btn-filter-clear"
                    onClick={handleClearFilters}
                    disabled={!hasDraftValues}
                    title="Clear filters"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <ID_filters schema={filtersSchema} values={filters} onChange={handleFilterChange} />
            </div>

            {/* # TRAITS # */}
            <ID_traits
              traits={availableTraits}
              selectedTraits={selectedTraits}
              onSelect={handleTraitSelect}
              onToggleAsymmetry={handleToggleAsymmetry}
            />
          </div>
        </div>


        {/* ### RIGHT COLUMN ### */}
        <div id="identify-right">
          
          {/* # ACTIVE TRAITS # */}
          <ID_active selectedTraits={selectedTraits} onRemove={handleRemoveTrait} />

          {/* MATCHING SPECIES */}
          <ID_matching species={matchingSpecies} loading={loadingMatching} selectedCount={selectedTraits.length} />
        </div>

      </> )}
    </section>
  )
}
