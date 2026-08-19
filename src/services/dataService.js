// ================================
// ============= GBIF =============
// ================================

// Synonyms & Basionym
export const getNomenclatureGBIF = async (gbifKey, basionymKey) => {
  try {
    const promises = [
      fetch(`https://api.gbif.org/v1/species/${gbifKey}/synonyms`).then(res => res.json())
    ];

    // Does basionym exist?
    if (basionymKey && basionymKey !== parseInt(gbifKey)) {
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

// Full taxonomy
export const getTaxonomyGBIF = async (gbifKey) => {
  const response = await fetch(`https://api.gbif.org/v1/species/${gbifKey}`);
  const data = await response.json();
  return {
    kingdom: data.kingdom,
    phylum: data.phylum,
    class: data.class,
    order: data.order,
    family: data.family,
    genus: data.genus
  };
};

// GBIF API status (for occurrences)
export const checkStatusGBIF = async (gbifKey) => {
  if (!gbifKey) return false;

  try {
    const limit = 1;
    const response = await fetch(
      `https://api.gbif.org/v1/occurrence/search?taxonKey=${gbifKey}&limit=${limit}`
    );
    if (!response.ok) throw new Error(`GBIF API error: ${response.status}`);
    const data = await response.json();

    return true;
  } catch (error) {
    console.error("GBIF Service Check Error:", error);
    throw error;
  }
};



// ================================
// =========== SUPABASE ===========
// ================================
import { supabase } from "../lib/supabaseClient";

/**
 * <<< species_family_counts >>>
 */

// List of families and nr. of species for each of them
export const getFamilyCounts = async () => {
  const { data, error } = await supabase
    .from("species_family_counts")
    .select("family, n")
    .order("family", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    family: row.family ?? "Unknown Family",
    count: row.n ?? 0,
  }));
};

/**
 * <<< species >>>
 */

// List of species in a family
export const getSpeciesByFamily = async (family) => {
  const { data, error } = await supabase
    .from("species")
    .select("id_species, scientific_name, family")
    .eq("family", family)
    .order("scientific_name", { ascending: true });

  if (error) throw error;
  return data ?? [];
};

// Details of a species
export const getSpeciesDetail = async (id) => {
  const { data, error } = await supabase
    .from("species")
    .select(`
      *,
      filters ( * )
    `)
    .eq("id_species", id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * <<< species_traits >>>
 */

// Traits of a species
export const getSpeciesTraits = async (id) => {
  const { data, error } = await supabase
    .from("species_traits")
    .select(`
      f_states,
      f_notes,
      f_notes_url,
      m_states,
      m_notes,
      m_notes_url,
      traits (
        trait_category,
        trait_name,
        trait_states (
          id_state,
          state_label,
          state_icon_url
        )
      )
    `)
    .eq("id_species", id);

  if (error) throw error;
  return data || [];
};

/**
 * <<< traits >>>
 */

// All Traits
export const getTraits = async () => {
  const { data, error } = await supabase
    .from("traits")
    .select(`
      id_trait,
      trait_category,
      trait_name,
      description,
      description_url,
      trait_icon_url,
      trait_states (
        id_state,
        state_label,
        sort_order,
        state_icon_url
      )
    `)
    .order("trait_category", { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * Looks for species matching the selected traits through RPC Supabase
 * @param {string[]} stateIds - Array of selected state IDs
 */
export const getMatchingSpecies = async (stateIds = []) => {
  const { data, error } = await supabase.rpc("match_species", {
    selected_states: stateIds
  });

  if (error) throw error;
  return data || [];
};
