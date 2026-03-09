// COMPONENTS
import Accordion from "../components/Accordion";

// LIB
import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

// SERVICES
import { getFamilyCounts, getSpeciesByFamily } from "../services/dataService";

// STYLES
import "../styles/SpeciesList.css";

export default function SpeciesList() {
  // STATES (families)
  const [families, setFamilies] = useState([]);
  const [loadingFamilies, setLoadingFamilies] = useState(true);
  const [errorFamilies, setErrorFamilies] = useState(null);

  // CACHE IN-SESSION
  const [familyCache, setFamilyCache] = useState({});
  const [familyStatus, setFamilyStatus] = useState({});

  // (avoids race conditions in case of rapid clicks)
  const requestSeq = useRef(0);

  // FETCHING FAMILIES
  useEffect(() => {
    async function fetchFamilies(){
      setLoadingFamilies(true);
      setErrorFamilies(null);

      try {
        const Families = await getFamilyCounts();
        setFamilies(Families);
      } catch (err) {
        console.error("Error fetching families: ", err.message);
        setErrorFamilies(err.message);
        setFamilies([]);
      } finally {
        setLoadingFamilies(false);
      }
    }

    fetchFamilies();
  }, []);

  // ----- HELPERS
  // Progress bar
  function startProgress(family) {
    let p = 0;

    setFamilyStatus((prev) => ({
      ...prev,
      [family]: { loading: true, loaded: false, progress: 0 },
    }));

    const t = setInterval(() => {
      p = Math.min(90, p + Math.random() * 12);
      setFamilyStatus((prev) => {
        const cur = prev[family];
        if (!cur || !cur.loading) return prev;
        return { ...prev, [family]: { ...cur, progress: p } };
      });
    }, 180);

    return () => clearInterval(t);
  }

  // FETCHING SPECIES
  async function fetchFamilySpecies(family) {
    if (familyCache[family]?.length) return; // already cached? stop
    if (familyStatus[family]?.loading) return; // already loading? stop

    const seq = ++requestSeq.current;
    const stop = startProgress(family);

    try {
      const data = await getSpeciesByFamily(family);

      if (seq !== requestSeq.current) {
        stop();
        return;
      }

      stop();
      setFamilyCache((prev) => ({ ...prev, [family]: data }));
      setFamilyStatus((prev) => ({
        ...prev,
        [family]: { loading: false, loaded: true, progress: 100 },
      }));
    } catch (err) {
      stop();
      setFamilyStatus((prev) => ({
        ...prev,
        [family]: { loading: false, loaded: false, progress: 0, error: err.message },
      }));
    }
  }

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
      <p>Select a family, then a species to view details.</p>

      {loadingFamilies && <p>Loading families...</p>}
      {!loadingFamilies && errorFamilies && (
        <p style={{ color: "crimson" }}>{errorFamilies}</p>
      )}

      {!loadingFamilies && !errorFamilies && (
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
      )}
    </section>
  );
}
