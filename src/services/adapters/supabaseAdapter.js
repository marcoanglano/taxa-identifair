// ##### IMPORTS #####
import { supabase } from "../../lib/supabaseClient";

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
const PRESETS = {
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
// 2. SUPABASE QUERIES
// ================================================
export const supabaseAdapter = {

    // ##### FAMILY COUNT #####
    async getFamilyCounts() {
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
    },

    // ##### SPECIES #####

    // # Species by family #
    async getSpeciesByFamily(family) {
        return queryDB(
            supabase
            .from("species")
            .select(PRESETS.SPECIES_MINIMAL)
            .eq("family", family)
            .order("scientific_name", { ascending: true })
        );
    },

    // # Species Details #
    async getSpeciesDetail(id) {
        return queryDB(
            supabase
            .from("species")
            .select(PRESETS.SPECIES_WITH_FILTERS)
            .eq("id_species", id)
            .single()
        );
    },

    // ##### TRAITS #####
    async getTraits() {
        return queryDB(
            supabase
            .from("traits")
            .select(PRESETS.TRAITS_FULL)
            .order("trait_category", { ascending: true })
        );
    },

    // ##### SPECIES TRAITS #####
    async getSpeciesTraits(idSpecies) {
        return queryDB(
        supabase
            .from("species_traits")
            .select(PRESETS.SPECIES_TRAITS_JOIN)
            .eq("id_species", idSpecies)
        );
    },

    // ##### FILTERS #####
    async getRawFiltersData() {
        return queryDB(
            supabase
            .from("filters")
            .select("environment, f_min, f_max, m_min, m_max")
        );
    },

    // ##### MATCHING SPECIES #####
    async getMatchingSpeciesRPC(stateIds) {
        if (!stateIds.length) return [];
        const matchedData = await queryDB(
            supabase
            .rpc("match_species", { selected_states: stateIds })
        );
        if (!matchedData || matchedData.length === 0) return [];
        
        const speciesIds = matchedData.map((sp) => sp.id_species);
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
    }
};
