// src/services/dataService.js
// High-Level Data Service Layer
// Coordinates adapter queries, external REST APIs and offline-first dataset synchronization via CacheManager.

// ##### IMPORTS #####
// DB ADAPTER
import { supabaseAdapter as db } from "./adapters/supabaseAdapter";
// DB DOWNLOAD
import { cacheManager } from "../utils/cacheManager";


// ##### GET LOCAL DB #####
const getLocalDataset = async () => {
  let cachedData = await cacheManager.get("matrix_data");
  if (!cachedData) {
    const result = await getIdentificationDataset();
    cachedData = result?.dataset || [];
  }
  return cachedData;
};


// ================================================
// 1. EXPORTS
// ================================================

// ##### SIMPLE SERVICES #####
export const getSpeciesDetail = (id) => db.getSpeciesDetail(id);
export const getTraits = () => db.getTraits();
export const getSpeciesTraits = (idSpecies) => db.getSpeciesTraits(idSpecies);
export const getSpeciesReferences = (idSpecies) => db.getSpeciesReferences(idSpecies);

// Family counts
export const getFamilyCounts = async () => {
  const dataset = await getLocalDataset();
  const counts = {};
  dataset.forEach((sp) => {
    const fam = sp.family || "Unknown Family";
    counts[fam] = (counts[fam] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([family, count]) => ({ family, count }))
    .sort((a, b) => a.family.localeCompare(b.family));
};

// Species by family
export const getSpeciesByFamily = async (family) => {
  const dataset = await getLocalDataset();
  return dataset
    .filter((sp) => sp.family === family)
    .map((sp) => ({
      id_species: sp.id_species,
      scientific_name: sp.scientific_name,
      authority: sp.authority,
      family: sp.family
    }))
    .sort((a, b) => a.scientific_name.localeCompare(b.scientific_name));
};


// ##### Complex services #####

// # Filters #
// Aggregates raw species environment and length filters
export const getFilters = async () => {
  const dataset = await getLocalDataset();
  const envSet = new Set();
  let absMin = Infinity;
  let absMax = -Infinity;

  dataset.forEach((sp) => {
    if (Array.isArray(sp.environment)) {
      sp.environment.forEach((env) => envSet.add(env));
    }
    const mins = [sp.f_min, sp.m_min].filter((v) => v !== null && v !== undefined);
    const maxs = [sp.f_max, sp.m_max].filter((v) => v !== null && v !== undefined);
    
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
        { id: "minLength", label: "Min", placeholder: `Min (e.g. ${absMin !== Infinity ? absMin : 0})` },
        { id: "maxLength", label: "Max", placeholder: `Max (e.g. ${absMax !== -Infinity ? absMax : 15})` }
      ]
    }
  ];
};


// ================================================
// 2. EXTERNAL APIs (GBIF)
// ================================================

// ##### GBIF #####
const UUID = "7ddf754f-d193-4cc9-b351-99906754a03b" // UUID Catalogue of Life XR

// # Check status #
export const checkStatusGBIF = async (gbifID) => {
  if (!gbifID) return false;
  const response = await fetch(`https://api.gbif.org/v1/occurrence/search?checklistKey=${UUID}&taxonKey=${gbifID}&limit=1`);
  if (!response.ok) throw new Error(`GBIF API error: ${response.status}`);
  // get old ID
  const data = await response.json();
  const firstResult = data.results?.[0];
  return firstResult ? (firstResult.acceptedTaxonKey || firstResult.taxonKey) : null;
};

// # Taxonomy + Basionym & Synonyms #
export const getTaxonomyGBIF = async (gbifID, options = {}) => {
  try {
    const res = await fetch(`https://api.checklistbank.org/dataset/3LR/taxon/${gbifID}/info`, options);
    if (!res.ok) throw new Error(`ChecklistBank HTTP ${res.status}`);
    const data = await res.json();

    const taxonomy = {};
    if (Array.isArray(data.classification)) {
      for (const item of data.classification) {
        if (item.rank) {
          taxonomy[item.rank.toLowerCase()] = item.name;
        }
      }
    }

    const basionymName = data.taxon?.basionym?.name?.scientificName || null;
    const homotypic = data.synonyms?.homotypic || [];
    const heterotypic = data.synonyms?.heterotypic || [];
    const misapplied = data.synonyms?.misapplied || [];
    const allSynonyms = [...homotypic, ...heterotypic, ...misapplied]
      .map(s => s.name?.scientificName)
      .filter(name => Boolean(name) && name !== basionymName);

    return {
      kingdom: taxonomy.kingdom || null,
      phylum: taxonomy.phylum || null,
      class: taxonomy.class || null,
      order: taxonomy.order || null,
      family: taxonomy.family || null,
      genus: taxonomy.genus || null,
      basionym: basionymName,
      synonyms: [...new Set(allSynonyms)]
    };
  } catch (error) {
    if (error.name === "AbortError") throw error;
    console.error("ChecklistBank Nomenclature Error:", error);
    return {
      kingdom: null,
      phylum: null,
      class: null,
      order: null,
      family: null,
      genus: null,
      basionym: null,
      synonyms: []
    };
  }
};


// ================================================
// 3. DB DOWNLOAD
// ================================================

export const getIdentificationDataset = async () => {
  try {
    // 1. Gets matrix versioning and FAIR release
    const { matrixVersion: remoteMatrixVersion, releaseInfo: remoteReleaseInfo } = 
      await db.getMetadataBatch();

    // 2. Reads local cache
    const cachedMatrixVersion = await cacheManager.get("matrix_version");
    const cachedDatasetVersion = await cacheManager.get("dataset_version");
    const cachedData = await cacheManager.get("matrix_data");
    const isMatrixValid = cachedMatrixVersion === remoteMatrixVersion;
    const isDatasetVersionValid = remoteReleaseInfo?.dataset_version
      ? cachedDatasetVersion === remoteReleaseInfo.dataset_version
      : true;

    // 3. Cache HIT: both matrix versioning and FAIR release match
    if (isMatrixValid && isDatasetVersionValid && cachedData) {
      return { dataset: cachedData, release: remoteReleaseInfo };
    }

    // 4. Cache MISS / Invalidation: downloads dataset
    const rawMatrix = await db.getFullIdentificationMatrix();
    const processedDataset = (rawMatrix || []).map((sp) => {
      const traitsMap = {};
      if (Array.isArray(sp.traits)) { sp.traits.forEach((t) => { traitsMap[t.id_trait] = t; }); }
      return { ...sp, traitsMap };
    });

    // 5. Updates cache
    await Promise.all([
      cacheManager.set("matrix_version", remoteMatrixVersion),
      cacheManager.set("dataset_version", remoteReleaseInfo?.dataset_version || "1.0.0"),
      cacheManager.set("fair_release_info", remoteReleaseInfo),
      cacheManager.set("matrix_data", processedDataset)
    ]);

    return { dataset: processedDataset, release: remoteReleaseInfo };
  }
  catch (error) {
    console.error("Error fetching or syncing identification dataset:", error);
    // Disconnection fallback disconnessione: tries to use memorized data
    const cachedData = await cacheManager.get("matrix_data");
    const cachedRelease = await cacheManager.get("fair_release_info");
    if (cachedData) { return { dataset: cachedData, release: cachedRelease }; }
    throw error;
  }
};
