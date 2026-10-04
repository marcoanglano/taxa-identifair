{/*
  
------------------------------
--       SCHEMA 0.6         --
------------------------------

--          SPECIES         --
create table public.species (
  id_species text not null,
  gbif_key integer not null,
  gbif_link text null,
  aphia_id integer null,
  other_id integer null,
  family text not null,
  genus text not null,
  scientific_name text not null,
  authority text null,
  created_at timestamp with time zone not null default now(),
  constraint species_pkey primary key (id_species)
) TABLESPACE pg_default;

create index IF not exists idx_species_taxonomy on public.species using btree (family, genus) TABLESPACE pg_default;


--   SPECIES_FAMILY_COUNTS  --
create view public.species_family_counts as
select
  COALESCE(family, 'Unknown Family'::text) as family,
  count(*)::integer as n
from
  species
group by
  (COALESCE(family, 'Unknown Family'::text))
order by
  (COALESCE(family, 'Unknown Family'::text));


--          FILTERS         --
create table public.filters (
  id_species text not null,
  environment text[] not null default '{}'::text[],
  f_min numeric(5, 3) null,
  f_max numeric(5, 3) null,
  m_min numeric(5, 3) null,
  m_max numeric(5, 3) null,
  constraint filters_pkey primary key (id_species),
  constraint filters_id_species_fkey foreign KEY (id_species) references species (id_species) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_filters_environment_gin on public.filters using gin (environment) TABLESPACE pg_default;

create index IF not exists idx_filters_id_species on public.filters using btree (id_species) TABLESPACE pg_default;


--          TRAITS          --
create table public.traits (
  id_trait text not null,
  trait_category text not null,
  trait_name text not null,
  description text not null,
  description_url text null,
  trait_icon_url text null,
  created_at timestamp with time zone not null default now(),
  parent_trait_id text null,
  required_state_id text null,
  constraint traits_pkey primary key (id_trait),
  constraint traits_parent_trait_fkey foreign KEY (parent_trait_id) references traits (id_trait) on delete set null,
  constraint traits_required_state_fkey foreign KEY (parent_trait_id, required_state_id) references trait_states (id_trait, id_state) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_traits_parent on public.traits using btree (parent_trait_id) TABLESPACE pg_default;


--       TRAIT_STATES       --
create table public.trait_states (
  id_trait text not null,
  id_state text not null,
  state_label text not null,
  sort_order integer null,
  state_icon_url text null,
  created_at timestamp with time zone not null default now(),
  constraint trait_states_pkey primary key (id_trait, id_state),
  constraint trait_states_id_trait_fkey foreign KEY (id_trait) references traits (id_trait) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists trait_states_trait_idx on public.trait_states using btree (id_trait, sort_order) TABLESPACE pg_default;


--      SPECIES_TRAITS      --
create table public.species_traits (
  id_species text not null,
  id_trait text not null,
  f_states text[] not null default '{}'::text[],
  f_notes text null,
  f_notes_url text null,
  m_states text[] not null default '{}'::text[],
  m_notes text null,
  m_notes_url text null,
  created_at timestamp with time zone not null default now(),
  constraint species_traits_pkey primary key (id_species, id_trait),
  constraint species_traits_id_species_fkey foreign KEY (id_species) references species (id_species) on delete CASCADE,
  constraint species_traits_id_trait_fkey foreign KEY (id_trait) references traits (id_trait) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists species_traits_f_states_gin on public.species_traits using gin (f_states) TABLESPACE pg_default;

create index IF not exists species_traits_m_states_gin on public.species_traits using gin (m_states) TABLESPACE pg_default;

create index IF not exists species_traits_trait_idx on public.species_traits using btree (id_trait) TABLESPACE pg_default;



------------------------------
--       FUNCTIONS          --
------------------------------

--       MATCH SPECIES      --
-- v2.2

-- Drop old function
drop function if exists match_species(text[]);

create or replace function match_species(selected_states text[])
returns table (
  id_species text,
  scientific_name text,
  family text,
  match_f boolean,
  match_m boolean,
  traits_info jsonb
) 
language plpgsql
as $$
begin
  if selected_states is null or array_length(selected_states, 1) is null then
    return;
  end if;

  return query
  with matched_species as (
    select 
      s.id_species,
      s.scientific_name,
      s.family,
      bool_and(st.f_states && array[s_state]) as match_f,
      bool_and(st.m_states && array[s_state]) as match_m
    from species s
    join species_traits st on s.id_species = st.id_species
    cross join unnest(selected_states) as s_state
    where st.f_states && array[s_state] or st.m_states && array[s_state]
    group by s.id_species, s.scientific_name, s.family
    having count(distinct s_state) = array_length(selected_states, 1)
  )
  select 
    ms.id_species,
    ms.scientific_name,
    ms.family,
    ms.match_f,
    ms.match_m,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id_trait', t.id_trait,
            'trait_name', t.trait_name,
            'f_notes', st.f_notes,
            'm_notes', st.m_notes,
            'f_states', st.f_states,
            'm_states', st.m_states,
            'trait_states', (
              select jsonb_agg(jsonb_build_object(
                'id_state', ts.id_state,
                'state_label', ts.state_label,
                'state_icon_url', ts.state_icon_url
              ))
              from trait_states ts
              where ts.id_trait = t.id_trait
            )
          )
        )
        from species_traits st
        join traits t on st.id_trait = t.id_trait
        where st.id_species = ms.id_species
          and (
            st.f_states && selected_states 
            or st.m_states && selected_states
          )
      ),
      '[]'::jsonb
    ) as traits_info
  from matched_species ms
  order BY ms.family asc, ms.scientific_name asc;
end;
$$;

*/}