// COMPONENTS
import Accordion from "../components/Accordion";

// HOOKS
import { useFamilies } from "../hooks/useFamilies";

// LIB
import { Link } from "react-router-dom";
import { useMemo } from "react";

// STYLES
import "../styles/SpeciesList.css";


export default function SpeciesList() {
  // Fetching-caching families and species
  const { 
    families, 
    loadingFamilies, 
    errorFamilies, 
    familyCache, 
    familyStatus, 
    fetchFamilySpecies 
  } = useFamilies();

  // ACCORDION ITEMS
  const accordionItems = useMemo(() => {
    return families.map((f) => {
      const family = f.family;
      const st = familyStatus[family] || { loading: false, loaded: false, progress: 0 };
      const list = familyCache[family] || [];

      return {
        id: family,
        title: `${family} (${f.count})`,
        meta: {
          loading: !!st.loading,
          loaded: !!st.loaded,
          progress: st.progress ?? 0,
        },
        content: (
          <div>
            {/* LOADING */}
            {st.loading && (
              <p className="species-hint">Loading species...</p>
            )}

            {/* ERROR */}
            {!st.loading && st.error && (
              <p className="species-error">{st.error}</p>
            )}

            {/* LOADED */}
            {!st.loading && !st.error && st.loaded && (
              <ul className="species-list">
                {list.map((sp) => (
                  <li key={sp.id_species}>
                    <Link
                      to={`/species/${sp.id_species}`}
                      target='_blank'
                      rel="noopener noreferrer"
                    >
                      <span>
                        <em>{sp.scientific_name}</em>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* EMPTY FAMILY */}
            {!st.loading && !st.error && st.loaded && list.length === 0 && (
              <p className="species-hint">No species found for this family.</p>
            )}
          </div>
        ),
      };
    });
  }, [families, familyStatus, familyCache]);

  // RENDERING
  return (
    <section>
      <h3>Species List</h3>

      {loadingFamilies && <p>Loading families...</p>}
      {!loadingFamilies && errorFamilies && (
        <p style={{ color: "crimson" }}>{errorFamilies}</p>
      )}

      {!loadingFamilies && !errorFamilies && (
        <>
          <p id="select-p">Select a family, then a species to view details.</p>
          <Accordion
            items={accordionItems}
            defaultAllOpen={false}
            singleOpen={true}
            onToggle={(family, nextIsOpen) => {
              if (nextIsOpen) fetchFamilySpecies(family);
            }}
            hasProgressbar={true}
            getHeaderState={(it) => it.meta}
            renderRight={(it, isOpen) => {
              const loading = !!it.meta?.loading;
              return (
                <>
                  <span className="acc-icon" aria-hidden="true">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </>
              );
            }}
          />
        </>
      )}
    </section>
  );
}
