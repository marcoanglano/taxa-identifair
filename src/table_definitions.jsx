{/*
  
------------------------------------------------------------
--              SCHEMA 0.7 - TAXA IDENTIFAIR              --
--    In-Memory Filters / Dimorphism / Native Asymmetry   --
------------------------------------------------------------

-- 1. METADATA & DATASET VERSIONING (Client-Side Cache/Sync)
create table public.app_metadata (
  key text primary key,
  data_version integer not null default 1,
  updated_at timestamp with time zone default now()
);

insert into public.app_metadata (key, data_version) 
values ('identification_matrix', 1) 
on conflict (key) do nothing;


-- 2. SPECIES (Taxonomy & External Identifiers)
create table public.species (
  id_species text not null primary key, -- es. 'anomalocera_patersonii'
  gbif_key integer not null,            -- es. '5166357'
  gbif_link text null,                  -- es. '676T9'
  aphia_id integer null,                -- es. '364368'
  other_id integer null,                -- es. '1184'
  family text not null,                 -- es. 'Pontellidae'
  genus text not null,                  -- es. 'Anomalocera'
  scientific_name text not null,        -- es. 'Anomalocera patersonii'
  authority text null,                  -- es. 'Templeton, 1837'
  created_at timestamp with time zone not null default now()
);

create index idx_species_taxonomy on public.species using btree (family, genus);


-- 3. CONTEXTUAL FILTERS (Ecology & Dimensions)
create table public.filters (
  id_species text not null primary key references public.species(id_species) on delete cascade,
  environment text[] not null default '{}'::text[], -- es. 'marine', 'fresh'
  f_min numeric(5, 3) null,                         -- es. '1.580'
  f_max numeric(5, 3) null,                         -- es. '1.580'
  m_min numeric(5, 3) null,                         -- es. '1.580'
  m_max numeric(5, 3) null                          -- es. '1.580'
);

create index idx_filters_environment_gin on public.filters using gin (environment);


-- 4. TRAITS (Anatomy, Asimmetries & Hierarchies)
create table public.traits (
  id_trait text not null primary key, -- es. 'PR_frsh', 'PR_sish'
  trait_category text not null,       -- es. 'Prosome'
  trait_name text not null,           -- es. 'Front shape', 'Side shape', etc.
  description text not null,          -- es. 'Shape of the prosome front as seen from above. Crested front is best observed laterally.'
  description_url text null,          -- link of the picture to be shown with the description
  trait_icon_url text null,           -- link of the icon identifying the trait

  -- Asymmetry flag
  can_be_asymmetric boolean not null default false,
  
  -- Trait hierarchies
  parent_trait_id text null references public.traits(id_trait) on delete set null,
  required_state_id text null,        -- es. parent trait needs to be 'ASYMMETRIC' to unlock the child trait
  
  created_at timestamp with time zone not null default now()
);

create index idx_traits_parent on public.traits using btree (parent_trait_id);


-- 5. TRAIT STATES (Trait values that can be selected)
create table public.trait_states (
  id_trait text not null references public.traits(id_trait) on delete cascade,  -- es. 'PR_frsh'
  id_state text not null,                                                       -- es. 'PR_frsh_ro'
  state_label text not null,                                                    -- es. 'Rounded'
  sort_order integer null,                                                      -- es. '1'
  state_icon_url text null,                                                     -- link of the icon identifying this state of the trait
  created_at timestamp with time zone not null default now(),
  constraint trait_states_pkey primary key (id_trait, id_state)
);

create index idx_trait_states_order on public.trait_states using btree (id_trait, sort_order);


-- 6. SPECIES TRAIT MATRIX (Sexual dimorphism & Side indipendently from sex)
create table public.species_traits (
  id_species text not null references public.species(id_species) on delete cascade, -- es. 'Anomalocera-patersonii'
  id_trait text not null references public.traits(id_trait) on delete cascade,      -- es. 'PR_frsh'
  
  -- FEMALE STATE (♀) by side
  f_left_states text[] not null default '{}'::text[],   -- es. 'Rounded'
  f_right_states text[] not null default '{}'::text[],  -- leave empty if this trait can't be asymmetric
  f_notes text null,                                    -- es. 'Subtriangular front.'
  f_notes_url text null,                                -- link of the picture to be shown with the notes
  
  -- MALE STATE (♂) by side
  m_left_states text[] not null default '{}'::text[],   -- es. 'Rounded'
  m_right_states text[] not null default '{}'::text[],  -- leave empty if this trait can't be asymmetric
  m_notes text null,                                    -- es. 'Subtriangular front.'
  m_notes_url text null,                                -- link of the picture to be shown with the notes

  created_at timestamp with time zone not null default now(),
  constraint species_traits_pkey primary key (id_species, id_trait)
);

-- GIN Indexes for server-side fast search if necessary
create index idx_species_traits_f_left on public.species_traits using gin (f_left_states);
create index idx_species_traits_f_right on public.species_traits using gin (f_right_states);
create index idx_species_traits_m_left on public.species_traits using gin (m_left_states);
create index idx_species_traits_m_right on public.species_traits using gin (m_right_states);


-- 7. TRIGGER FOR DATASET VERSIONING
-- Version increase when there is any database update
create or replace function public.bump_matrix_version()
returns trigger language plpgsql as $$
begin
  update public.app_metadata 
  set data_version = data_version + 1, updated_at = now()
  where key = 'identification_matrix';
  return null;
end;
$$;

create trigger tr_bump_matrix_version
after insert or update or delete on public.species_traits
for each statement execute function public.bump_matrix_version();


-- 8. VISTA FOR CLIENT-SIDE DOWNLOAD (Completo Denormalized JSON)
-- SELECT * FROM public.v_identification_matrix to download the full database.
create or replace view public.v_identification_matrix as
select 
  s.id_species,
  s.scientific_name,
  s.family,
  f.environment,
  f.f_min,
  f.f_max,
  f.m_min,
  f.m_max,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id_trait', st.id_trait,
        'f_left', st.f_left_states,
        'f_right', st.f_right_states,
        'f_notes', st.f_notes,
        'f_notes_url', st.f_notes_url,
        'm_left', st.m_left_states,
        'm_right', st.m_right_states,
        'm_notes', st.m_notes,
        'm_notes_url', st.m_notes_url
      )
    ) filter (where st.id_trait is not null),
    '[]'::jsonb
  ) as traits
from public.species s
left join public.filters f on s.id_species = f.id_species
left join public.species_traits st on s.id_species = st.id_species
group by s.id_species, s.scientific_name, s.family, f.environment, f.f_min, f.f_max, f.m_min, f.m_max;

*/}

{/*
  
  create or replace view public.species_family_counts as
  select
    coalesce(family, 'Unknown Family') as family,
    count(*)::int as n
  from public.species
  group by coalesce(family, 'Unknown Family')
  order by family;

*/}

{/*
  
  begin
    update public.app_metadata 
    set data_version = data_version + 1, updated_at = now()
    where key = 'identification_matrix';
    return null;
  end;

  __________

  begin
    return query
    with species_expanded as (
      select 
        s.id_species,
        s.scientific_name,
        s.family,
        st_table.id_trait,
        st_table.f_left_states,
        st_table.f_right_states,
        st_table.f_notes,
        st_table.f_notes_url,
        st_table.m_left_states,
        st_table.m_right_states,
        st_table.m_notes,
        st_table.m_notes_url,
        (st_table.f_left_states || st_table.f_right_states) as f_all_states,
        (st_table.m_left_states || st_table.m_right_states) as m_all_states
      from public.species s
      left join public.species_traits st_table on s.id_species = st_table.id_species
    )
    select 
      se.id_species,
      se.scientific_name,
      se.family,
      
      -- MATCH FEMMINA (♀): Match se lo stato è presente OPPURE se il dato è assente (array vuoto o riga mancante)
      (
        (cardinality(p_symmetric_states) = 0 or coalesce((
          select bool_and(
            se_sub_full.id_trait is null
            or coalesce(cardinality(se_sub_full.f_all_states), 0) = 0
            or sym_st = any(se_sub_full.f_all_states)
          )
          from unnest(p_symmetric_states) sym_st
          left join species_expanded se_sub_full 
            on se_sub_full.id_species = se.id_species 
          and se_sub_full.id_trait = (select id_trait from public.trait_states where id_state = sym_st limit 1)
        ), true))
        AND
        (cardinality(p_left_states) = 0 or coalesce((
          select bool_and(
            se_sub_full.id_trait is null
            or coalesce(cardinality(se_sub_full.f_left_states), 0) = 0
            or l_st = any(se_sub_full.f_left_states)
          )
          from unnest(p_left_states) l_st
          left join species_expanded se_sub_full 
            on se_sub_full.id_species = se.id_species 
          and se_sub_full.id_trait = (select id_trait from public.trait_states where id_state = l_st limit 1)
        ), true))
        AND
        (cardinality(p_right_states) = 0 or coalesce((
          select bool_and(
            se_sub_full.id_trait is null
            or coalesce(cardinality(se_sub_full.f_right_states), 0) = 0
            or r_st = any(se_sub_full.f_right_states)
          )
          from unnest(p_right_states) r_st
          left join species_expanded se_sub_full 
            on se_sub_full.id_species = se.id_species 
          and se_sub_full.id_trait = (select id_trait from public.trait_states where id_state = r_st limit 1)
        ), true))
      ) as match_f,

      -- MATCH MASCHIO (♂)
      (
        (cardinality(p_symmetric_states) = 0 or coalesce((
          select bool_and(
            se_sub_full.id_trait is null
            or coalesce(cardinality(se_sub_full.m_all_states), 0) = 0
            or sym_st = any(se_sub_full.m_all_states)
          )
          from unnest(p_symmetric_states) sym_st
          left join species_expanded se_sub_full 
            on se_sub_full.id_species = se.id_species 
          and se_sub_full.id_trait = (select id_trait from public.trait_states where id_state = sym_st limit 1)
        ), true))
        AND
        (cardinality(p_left_states) = 0 or coalesce((
          select bool_and(
            se_sub_full.id_trait is null
            or coalesce(cardinality(se_sub_full.m_left_states), 0) = 0
            or l_st = any(se_sub_full.m_left_states)
          )
          from unnest(p_left_states) l_st
          left join species_expanded se_sub_full 
            on se_sub_full.id_species = se.id_species 
          and se_sub_full.id_trait = (select id_trait from public.trait_states where id_state = l_st limit 1)
        ), true))
        AND
        (cardinality(p_right_states) = 0 or coalesce((
          select bool_and(
            se_sub_full.id_trait is null
            or coalesce(cardinality(se_sub_full.m_right_states), 0) = 0
            or r_st = any(se_sub_full.m_right_states)
          )
          from unnest(p_right_states) r_st
          left join species_expanded se_sub_full 
            on se_sub_full.id_species = se.id_species 
          and se_sub_full.id_trait = (select id_trait from public.trait_states where id_state = r_st limit 1)
        ), true))
      ) as match_m,

      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id_trait', se.id_trait,
            'f_left_states', se.f_left_states,
            'f_right_states', se.f_right_states,
            'f_notes', se.f_notes,
            'f_notes_url', se.f_notes_url,
            'm_left_states', se.m_left_states,
            'm_right_states', se.m_right_states,
            'm_notes', se.m_notes,
            'm_notes_url', se.m_notes_url
          )
        ) filter (where se.id_trait is not null),
        '[]'::jsonb
      ) as traits_info

    from species_expanded se
    group by se.id_species, se.scientific_name, se.family
    having 
      (
        (cardinality(p_symmetric_states) = 0 or coalesce((
          select bool_and(
            se_sub_full.id_trait is null
            or coalesce(cardinality(se_sub_full.f_all_states), 0) = 0
            or sym_st = any(se_sub_full.f_all_states)
          )
          from unnest(p_symmetric_states) sym_st
          left join species_expanded se_sub_full on se_sub_full.id_species = se.id_species and se_sub_full.id_trait = (select id_trait from public.trait_states where id_state = sym_st limit 1)
        ), true))
        AND
        (cardinality(p_left_states) = 0 or coalesce((
          select bool_and(
            se_sub_full.id_trait is null
            or coalesce(cardinality(se_sub_full.f_left_states), 0) = 0
            or l_st = any(se_sub_full.f_left_states)
          )
          from unnest(p_left_states) l_st
          left join species_expanded se_sub_full on se_sub_full.id_species = se.id_species and se_sub_full.id_trait = (select id_trait from public.trait_states where id_state = l_st limit 1)
        ), true))
        AND
        (cardinality(p_right_states) = 0 or coalesce((
          select bool_and(
            se_sub_full.id_trait is null
            or coalesce(cardinality(se_sub_full.f_right_states), 0) = 0
            or r_st = any(se_sub_full.f_right_states)
          )
          from unnest(p_right_states) r_st
          left join species_expanded se_sub_full on se_sub_full.id_species = se.id_species and se_sub_full.id_trait = (select id_trait from public.trait_states where id_state = r_st limit 1)
        ), true))
      )
      OR
      (
        (cardinality(p_symmetric_states) = 0 or coalesce((
          select bool_and(
            se_sub_full.id_trait is null
            or coalesce(cardinality(se_sub_full.m_all_states), 0) = 0
            or sym_st = any(se_sub_full.m_all_states)
          )
          from unnest(p_symmetric_states) sym_st
          left join species_expanded se_sub_full on se_sub_full.id_species = se.id_species and se_sub_full.id_trait = (select id_trait from public.trait_states where id_state = sym_st limit 1)
        ), true))
        AND
        (cardinality(p_left_states) = 0 or coalesce((
          select bool_and(
            se_sub_full.id_trait is null
            or coalesce(cardinality(se_sub_full.m_left_states), 0) = 0
            or l_st = any(se_sub_full.m_left_states)
          )
          from unnest(p_left_states) l_st
          left join species_expanded se_sub_full on se_sub_full.id_species = se.id_species and se_sub_full.id_trait = (select id_trait from public.trait_states where id_state = l_st limit 1)
        ), true))
        AND
        (cardinality(p_right_states) = 0 or coalesce((
          select bool_and(
            se_sub_full.id_trait is null
            or coalesce(cardinality(se_sub_full.m_right_states), 0) = 0
            or r_st = any(se_sub_full.m_right_states)
          )
          from unnest(p_right_states) r_st
          left join species_expanded se_sub_full on se_sub_full.id_species = se.id_species and se_sub_full.id_trait = (select id_trait from public.trait_states where id_state = r_st limit 1)
        ), true))
      );
  end;

*/}
