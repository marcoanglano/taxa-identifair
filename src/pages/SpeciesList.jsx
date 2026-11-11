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
// UTILS
import { formatScientificName } from "../utils/speciesHelpers";

export default function SpeciesList() {


  // ##### FETCHING-CACHING #####
  // Fetching
  const { 
    families, 
    loadingFamilies, 
    errorFamilies, 
    familyCache, 
    fetchFamilySpecies 
  } = useFamilies();


  // ##### CREATE ACCORDIONS #####
  const accordionItems = useMemo(() => {
    return families.map((f) => {
      const family = f.family;
      const list = familyCache[family] || [];
      return {
        id: family,
        title: `${family} (${f.count})`,
        content: (
          <div>
            {/* LOADING */}
            {loadingFamilies && <Skeleton className="species-list" height="24px" width="200px" count={3} />}
            {/* LOADED: ERROR */}
            {loadingFamilies && errorFamilies && <ErrorComponent title="Oh no!" message={errorFamilies} />}

            {/* LOADED: SUCCESS */}
            {!loadingFamilies && !errorFamilies && (
              <ul className="species-list">
                {list.map((sp) => (
                  <li key={sp.id_species}>
                    <Link
                      to={`/species/${sp.id_species}`}
                      target='_blank'
                      rel="noopener noreferrer"
                    >
                      {formatScientificName(sp.scientific_name)} <span className="sp-li-authority">{sp.authority}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ),
      };
    });
  }, [families, familyCache]);


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
          <p id="list-tutorial">In this page you can access the full list of species available in the dataset. Select a family, then a species to see its details.</p>
          <Accordion
            items={accordionItems}
            defaultAllOpen={false}
            singleOpen={true}
            onToggle={(family, nextIsOpen) => {
              if (nextIsOpen) fetchFamilySpecies(family);
            }}
          />
        </>
      )}
    </section>
  );
}
