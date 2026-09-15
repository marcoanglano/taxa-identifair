// ##### IMPORTS #####
import { supabase } from "../lib/supabaseClient";


// ================================================
// 1. HELPERS & PRESETS
// ================================================

// ##### GENERIC HELPER (try/catch, if (error) throw) #####
const queryDB = async (queryPromise) => {
  const { data, error } = await queryPromise;
  if (error) throw error;
  return data;
};

// ##### PRESETS SELECTION #####
export const PRESETS = {
  SPECIES_MINIMAL: "id_species, scientific_name, authority, family",
  SPECIES_WITH_FILTERS: "*, filters(*)",
  TRAITS_FULL: `
    id_trait, trait_category, trait_name, description, description_url, trait_icon_url,
    trait_states ( id_state, state_label, sort_order, state_icon_url )
  `,
  SPECIES_TRAITS_JOIN: `
    f_states, f_notes, f_notes_url, m_states, m_notes, m_notes_url,
    traits ( trait_category, trait_name,
      trait_states ( id_state, state_label, state_icon_url )
    )
  `
};


// ================================================
// 2. SUPABASE: ATOMIC & COMPOSABLE QUERIES
// ================================================

// ##### FAMILY COUNT #####
export const getFamilyCounts = async () => {
  const data = await queryDB(
    supabase
      .from("species_family_counts")
      .select("family, n")
      .order("family", { ascending: true })
  );

  return (data ?? []).map((row) => ({
    family: row.family ?? "Unknown Family",
    count: row.n ?? 0,
  }));
};

// ##### SPECIES #####

// # Species by family #
export const getSpeciesByFamily = (family) =>
  queryDB(
    supabase
      .from("species")
      .select(PRESETS.SPECIES_MINIMAL)
      .eq("family", family)
      .order("scientific_name", { ascending: true })
  );

// # Species Details #
export const getSpeciesDetail = (id) =>
  queryDB(
    supabase
      .from("species")
      .select(PRESETS.SPECIES_WITH_FILTERS)
      .eq("id_species", id)
      .single()
  );

// ##### TRAITS #####
export const getTraits = () =>
  queryDB(
    supabase
      .from("traits")
      .select(PRESETS.TRAITS_FULL)
      .order("trait_category", { ascending: true })
  );

// ##### SPECIES TRAITS #####
export const getSpeciesTraits = (idSpecies) =>
  queryDB(
    supabase
      .from("species_traits")
      .select(PRESETS.SPECIES_TRAITS_JOIN)
      .eq("id_species", idSpecies)
  );


// ================================================
// 3. COMPLEX SERVICES - AGGREGATES
// ================================================

// ##### FILTERS #####
export const getFilters = async () => {
  const data = await queryDB(
    supabase.from("filters").select("environment, f_min, f_max, m_min, m_max")
  );

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

  // Option-type and Range-type inputs for "Identify" page
  return [
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

// ##### MATCHING SPECIES #####
export const getMatchingSpecies = async (stateIds = []) => {
  if (!stateIds.length) return [];
  const matchedData = await queryDB(
    supabase.rpc("match_species", { selected_states: stateIds })
  );
  if (!matchedData || matchedData.length === 0) return [];
  const speciesIds = matchedData.map((sp) => sp.id_species);

  // Adds filters
  const filtersData = await queryDB(
    supabase
      .from("filters")
      .select("id_species, environment, f_min, f_max, m_min, m_max")
      .in("id_species", speciesIds)
  );
  const filtersMap = new Map((filtersData || []).map((f) => [f.id_species, f]));

  return matchedData.map((sp) => ({
    ...sp,
    filters: filtersMap.get(sp.id_species) || null
  }));
};


// ================================================
// 4. EXTERNAL APIs (GBIF)
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
