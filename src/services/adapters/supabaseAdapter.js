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
    SPECIES_WITH_FILTERS: "*, filters!filters_id_species_fkey(*)",
    TRAITS_FULL: `
        id_trait, trait_category, trait_name, description, description_url, trait_icon_url,
        can_be_asymmetric, parent_trait_id, required_state_id,
        trait_states!trait_states_id_trait_fkey ( id_state, state_label, sort_order, state_icon_url )
    `,
    SPECIES_TRAITS_JOIN: `
        f_left_states, f_right_states, f_notes, f_notes_url, 
        m_left_states, m_right_states, m_notes, m_notes_url,
        traits ( 
            trait_category, 
            trait_name, 
            can_be_asymmetric,
            trait_states!trait_states_id_trait_fkey ( id_state, state_label, state_icon_url )
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
        const data = await queryDB(
            supabase
            .from("species")
            .select(PRESETS.SPECIES_WITH_FILTERS)
            .eq("id_species", id)
            .maybeSingle()
        );
        if (!data) return null;
        const normalizedFilters = Array.isArray(data.filters) 
            ? (data.filters[0] || null) 
            : data.filters;
        return {
            ...data,
            filters: normalizedFilters
        };
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

    // ##### SPECIES REFERENCES #####
    async getSpeciesReferences(idSpecies) {
        return queryDB(
            supabase
            .from("species_references")
            .select("citation")
            .eq("id_species", idSpecies)
            .order("citation", { ascending: true })
        );
    },


    // ================================================
    // 3. DB DOWNLOAD & VERSIONING
    // ================================================

    // ##### APP METADATA & DATASET VERSIONING #####
    async getMatrixVersion() {
        const data = await queryDB(
            supabase
            .from("app_metadata")
            .select("data_version")
            .eq("key", "identification_matrix")
            .maybeSingle()
        );
        return data?.data_version ?? 0;
    },

    // ##### FULL IDENTIFICATION MATRIX DOWNLOAD #####
    async getFullIdentificationMatrix() {
        return queryDB(
            supabase
            .from("v_identification_matrix")
            .select("*")
        );
    }
};
