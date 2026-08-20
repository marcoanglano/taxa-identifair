{/*
  
------------------------------
--       SCHEMA 0.5         --
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
  constraint traits_pkey primary key (id_trait)
) TABLESPACE pg_default;


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
create or replace function match_species(selected_states text[])
returns table (
  id_species text,
  scientific_name text,
  authority text,
  match_f boolean,
  match_m boolean
) 
language plpgsql
as $$
begin
  -- If no trait selected, return zero results
  if selected_states is null or array_length(selected_states, 1) is null then
    return;
  end if;

  -- Filter species that satisfy EVERY selected trait
  return query
  select 
    s.id_species,
    s.scientific_name,
    s.authority,
    bool_and(st.f_states && array[s_state]) as match_f,
    bool_and(st.m_states && array[s_state]) as match_m
  from species s
  join species_traits st on s.id_species = st.id_species
  cross join unnest(selected_states) as s_state
  where st.f_states && array[s_state] or st.m_states && array[s_state]
  group by s.id_species, s.scientific_name, s.authority
  having count(distinct s_state) = array_length(selected_states, 1)
  order by s.scientific_name;
end;
$$;
*/}