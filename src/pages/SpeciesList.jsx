// ##### IMPORTS #####
// COMPONENTS
import Accordion from "../components/Accordion";
import ErrorComponent from "../components/Error";
import Skeleton from "../components/Skeleton";
// HOOKS
import { useFamilies } from "../hooks/useSpeciesList";
// LIB
import { Link } from "react-router-dom";
import { useMemo } from "react";

export default function SpeciesList() {


  // ##### FETCHING-CACHING #####
  // Fetching
  const { 
    families, 
    loadingFamilies, 
    errorFamilies, 
    familyCache, 
    familyStatus, 
    fetchFamilySpecies 
  } = useFamilies();

  // Converting data into accordion items
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
            {st.loading && <Skeleton className="species-list" height="24px" width="200px" count={3} />}
            {/* LOADED: ERROR */}
            {!st.loading && st.error && <ErrorComponent title="Oh no!" message={st.error} />}

            {/* LOADED: SUCCESS */}
            {!st.loading && !st.error && st.loaded && (
              <ul className="species-list">
                {list.map((sp) => (
                  <li key={sp.id_species}>
                    <Link
                      to={`/species/${sp.id_species}`}
                      target='_blank'
                      rel="noopener noreferrer"
                    >
                        <em>{sp.scientific_name}</em> <span className="sp-li-authority">{sp.authority}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ),
      };
    });
  }, [families, familyStatus, familyCache]);


  // ##### RENDERING #####
  return (
    <section>
      <h3>Species List</h3>

      {/* LOADING */}
      {loadingFamilies && <>
        <p id="list-loading">Loading families...</p>
        <Skeleton height="40px" margin="0 0 2px 0" count={2} />
      </>}
      {/* LOADED: ERROR */}
      {!loadingFamilies && errorFamilies && (<ErrorComponent title="Error" message={errorFamilies} />)}

      {/* LOADED: SUCCESS */}
      {!loadingFamilies && !errorFamilies && (
        <>
          <p id="list-tutorial">Select a family, then a species to view details.</p>
          <Accordion
            items={accordionItems}
            defaultAllOpen={false}
            singleOpen={true}
            onToggle={(family, nextIsOpen) => {
              if (nextIsOpen) fetchFamilySpecies(family);
            }}
            hasProgressbar={true}
            getHeaderState={(it) => it.meta}
          />
        </>
      )}
    </section>
  );
}
