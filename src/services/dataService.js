// ================================
// ============= GBIF =============
// ================================

// Full taxonomy
export const getTaxonomyGBIF = async (gbifId) => {
  const response = await fetch(`https://api.gbif.org/v1/species/${gbifId}`);
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
      m_states,
      traits (
        trait_category,
        trait_name,
        trait_states (
          id_state,
          state_label
        )
      )
    `)
    .eq("id_species", id);

  if (error) throw error;
  return data || [];
};
