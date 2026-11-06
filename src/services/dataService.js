// ##### IMPORTS #####
// DB ADAPTER
import { supabaseAdapter as db } from "./adapters/supabaseAdapter";
// DB DOWNLOAD
import { cacheManager } from "../utils/cacheManager";


// ================================================
// 1. EXPORTS
// ================================================

// ##### SIMPLE SERVICES #####
export const getFamilyCounts = () => db.getFamilyCounts();
export const getSpeciesByFamily = (family) => db.getSpeciesByFamily(family);
export const getSpeciesDetail = (id) => db.getSpeciesDetail(id);
export const getTraits = () => db.getTraits();
export const getSpeciesTraits = (idSpecies) => db.getSpeciesTraits(idSpecies);


// ##### Complex services #####

// # Filters #
export const getFilters = async () => {
  const data = await db.getRawFiltersData();
  const envSet = new Set();
  let absMin = Infinity;
  let absMax = -Infinity;
  (data || []).forEach((row) => {
    if (Array.isArray(row.environment)) {
      row.environment.forEach((env) => envSet.add(env));
    }
    const mins = [row.f_min, row.m_min].filter((v) => v !== null && v !== undefined);
    const maxs = [row.f_max, row.m_max].filter((v) => v !== null && v !== undefined);
    mins.forEach((v) => { if (v < absMin) absMin = v; });
    maxs.forEach((v) => { if (v > absMax) absMax = v; });
  });
  return [ // Option-type and Range-type inputs for "Identify" page
    {
      id: "sex", label: "Sex", type: "select", placeholder: "All",
      options: [
        { value: "", label: "All" },
        { value: "female", label: "Female" },
        { value: "male", label: "Male" }
      ]
    },
    {
      id: "environment", label: "Environment", type: "select", placeholder: "All",
      options: [
        { value: "", label: "All" },
        ...Array.from(envSet).sort().map((env) => ({
          value: env,
          label: env.charAt(0).toUpperCase() + env.slice(1)
        }))
      ]
    },
    {
      id: "length", label: "Body Length (mm)", type: "range",
      inputs: [
        { id: "minLength", label: "Min", placeholder: `Min (es. ${absMin !== Infinity ? absMin : 0})` },
        { id: "maxLength", label: "Max", placeholder: `Max (es. ${absMax !== -Infinity ? absMax : 15})` }
      ]
    }
  ];
};

// # Matching Species #
export const getMatchingSpecies = (stateIds) => db.getMatchingSpeciesRPC(stateIds);


// ================================================
// 2. EXTERNAL APIs (GBIF)
// ================================================

// ##### GBIF #####

// # Check status #
export const checkStatusGBIF = async (gbifKey) => {
  if (!gbifKey) return false;
  const response = await fetch(`https://api.gbif.org/v1/occurrence/search?taxonKey=${gbifKey}&limit=1`);
  if (!response.ok) throw new Error(`GBIF API error: ${response.status}`);
  return true;
};

// # Basionym & Synonyms #
export const getNomenclatureGBIF = async (gbifKey, basionymKey) => {
  try {
    const promises = [
      fetch(`https://api.gbif.org/v1/species/${gbifKey}/synonyms`).then(res => res.json())
    ];
    if (basionymKey && basionymKey !== parseInt(gbifKey, 10)) {
      promises.push(fetch(`https://api.gbif.org/v1/species/${basionymKey}`).then(res => res.json()));
    }
    const [synData, basData] = await Promise.all(promises);
    return {
      synonyms: synData.results ? [...new Set(synData.results.map(s => s.scientificName))] : [],
      basionym: basData ? basData.scientificName : null
    };
  } catch (error) {
    console.error("GBIF Nomenclature Error:", error);
    return { synonyms: [], basionym: null };
  }
};

// # Taxonomy #
export const getTaxonomyGBIF = async (gbifKey) => {
  const response = await fetch(`https://api.gbif.org/v1/species/${gbifKey}`);
  if (!response.ok) throw new Error("Errore in recovering GBIF taxonomy");
  const data = await response.json();
  return {
    kingdom: data.kingdom,
    phylum: data.phylum,
    class: data.class,
    order: data.order,
    family: data.family,
    genus: data.genus,
    basionymKey: data.basionymKey
  };
};


// ================================================
// 3. DB DOWNLOAD
// ================================================

export const getIdentificationDataset = async () => {
  try {
    // 1. Controlla versione remota DB
    const remoteVersion = await db.getMatrixVersion();
    
    // 2. Leggi versione e dati memorizzati localmente
    const cachedVersion = await cacheManager.get("matrix_version");
    const cachedData = await cacheManager.get("matrix_data");

    // 3. Cache HIT: Se le versioni coincidono e i dati esistono, usa la cache
    if (cachedVersion && cachedVersion === remoteVersion && cachedData) {
      return cachedData;
    }

    // 4. Cache MISS: Scarica la vista completa da Supabase
    const rawMatrix = await db.getFullIdentificationMatrix();

    // 5. Pre-processing: Converti l'array di tratti in Map O(1)
    const processedDataset = (rawMatrix || []).map((sp) => {
      const traitsMap = {};
      if (Array.isArray(sp.traits)) {
        sp.traits.forEach((t) => {
          traitsMap[t.id_trait] = t;
        });
      }
      return {
        ...sp,
        traitsMap // Accesso rapido per l'algoritmo di matching
      };
    });

    // 6. Aggiorna la cache locale per i futuri avvii
    await cacheManager.set("matrix_version", remoteVersion);
    await cacheManager.set("matrix_data", processedDataset);

    return processedDataset;
  } catch (error) {
    console.error("Error fetching or syncing identification dataset:", error);
    throw error;
  }
};
