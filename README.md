# ZPID – ZOOPLANKTON IDENTIFIER
**Interactive key for adult Calanoida**

Website based on React + Vite, which collects the main information available on each species of Calanoida. The main aim is to provide an identification tool down to the species level, using data archived on GBIF, Supabase and other databases. The search occurs by exclusion using the provided filters (environment, sex, length etc.) and traits (anatomical details).

*Key work: Böttger-Schnack, R., & Schnack, D. (2015). Development of an interactive identification key for Oncaeidae (Copepoda: Cyclopoida). Journal of Natural History, 49(45-48), 2727-2741.*

## INDEX
1. **File purpose** ❓
2. **Supabase content** 🗂️
3. **Roadmap** 🛣️

## 1. FILE PURPOSE ❓
- **dist/** : automatically generated with "npm run build". No need to modify it.
- **node_modules/** : contains libraries, infrastructures and other stuff to make the code run. Do not modify it. You can reinstall the content with "npm install".
- **public/** : generally, logos and icons.
    - *gbif_logo.png*, *razouls_logo.png*, *worms_logo.png* : used for links to the corrisponding species pages.
- **src/** : main content.
    - **assets/** : pictures, other non-public stuff.
        - *Error.png* : picture shown in case of errors.
    - **components/** :
        - *Accordion.jsx* : generates accordions.
        - *Error.jsx* : handles errors.
        - *Navbar.jsx* : generates the navigation bar in the header.
        - *SD_cards.jsx* : species card components (see pages/SpeciesDetail.jsx).
        - *SD_length.jsx* : species length bars and scale bar (see pages/SpeciesDetail.jsx).
        - *SD_links.jsx* : species links to external websites such as GBIF (see pages/SpeciesDetail.jsx).
        - *SD_traits.jsx* : species traits organized in accordions (see pages/SpeciesDetail.jsx).
    - **hooks/** : fetching/caching management.
        - *useFamilies.js* : fetching/caching species in SpeciesList.
        - *useGBIF.js* : fetching GBIF data in SpeciesDetail.
        - *useSpeciesDetail.js* : fetching details in SpeciesDetail.
    - **lib/** : libraries.
        - *supabaseClient.js* : allows the use of Supabase keys.
    - **pages/** : website pages.
        - *Home.jsx* : homepage (aim, description, news, etc.).
        - *Identify.jsx* : identification assistance, with an interactive key that uses the selected filters/traits.
        - *SpeciesDetail.jsx* : displays species’ main details and traits.
        - *SpeciesList.jsx* : lists species ordered by family.
    - **services/** :
        - *dataService.js* : asks data to Supabase. Allows the website to be database independent. In case of database change, just modify this file.
    - **styles/** : website styles.
    - **utils/** : helpers.
        - *speciesHelpers.js* : helpers for SpeciesDetail.
    - *App.jsx* : builds the html.
    - *main.jsx* : routing.
- *.env.local* : secret keys and variables, not public.
- *.gitignore* : what git ignores.
- *CHANGELOG.md* : full list of website updates.
- *eslint.config.js* : error notification management.
- *gitdiff.txt* : used for gitdiff.
- *index.html* : core HTML.
- *package-lock.json* : snapshot of packages and their dependencies in node_modules.
- *package.json* : Node.js core.
- *README.md* : website guide and roadmap.
- *vite.config.js* : Vite configuration.

## 2. SUPABASE CONTENT 🗂️
### species
This table contains key data for each species (IDs, taxonomy).
#### *Definition*
```sql
create table public.species (
  id_species text not null,
  gbif_id integer not null,
  worms_id integer null,
  razouls_id integer null,
  family text not null,
  genus text not null,
  scientific_name text not null,
  authority text null,
  created_at timestamp with time zone not null default now(),
  constraint species_pkey primary key (id_species)
) TABLESPACE pg_default;

create index IF not exists idx_species_taxonomy on public.species using btree (family, genus) TABLESPACE pg_default;
```
#### *Example*
| id_species | gbif_id | worms_id | razouls_id | family | genus | scientific_name | authority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| acartia-danae | 2114431 | 346026 | 17 | Acartiidae | Acartia | Acartia danae | Giesbrecht, 1889 |
---

### species_family_counts
This view automatically counts species for each family.
#### *Definition*
```sql
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
```
#### *Example*
| family | n |
| :--- | :--- |
| Acartiidae | 3 |
---

### filters
This table contains the main filters used to exclude species in the identification progress (length, environment, etc.)
#### *Definition*
```sql
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
```
#### *Example*
| id_species | environment | f_min | f_max | m_min | m_max |
| :--- | :--- | :--- | :--- | :--- | :--- |
| acartia_danae | ["marine"] | 0.900 | 1.340 | 0.700 | 1.100 |
---

### species_traits
This table contains the traits of each registered species, for both sexes.
#### *Definition*
```sql
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
```
#### *Example*
| id_species | id_trait | f_states | f_notes | f_notes_url | m_states | m_notes | m_notes_url |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| acartia-danae | A1_pro | ["A1_pro_s"] | Spine on A1 art. 1 | NULL | ["A1_pro_s"] | Spine on A1 art. 1 | NULL |
---

### trait_states
This table defines all possible states of each trait.
#### *Definition*
```sql
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
```
#### *Example*
| id_trait | id_state | state_label | sort_order | state_icon_url |
| :--- | :--- | :--- | :--- | :--- |
| PR_ang | PR_ang_r | Rounded | 1 | NULL |
---

### traits
This table defines all traits and groups them in categories.
#### *Definition*
```sql
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
```
#### *Example*
| id_trait | trait_category | trait_name | description | description_url | trait_icon_url |
| :--- | :--- | :--- | :--- | :--- | :--- |
| A1_pro | Antennulae (A1) | A1 proximal structures | Structures on proximal antennulae (art. 1-12) | NULL | NULL |


## 3. Roadmap 🛣️
### v0.1-0.2
First versions to test feasibility of the project and experiment functionalities.
### v0.3
Website re-built from zero, with a focus on efficiency, readability, restyling.

### v0.4a - GBIF version
Branched version for GBIF 2026 contest. Implement new functionality based on GBIF databases.<br>
Contest info: [2026 GBIF Graduate Researchers Award call for nominations](https://www.gbif.org/news/2qFpkI7rwBNbMuSjn2rtae/2026-gbif-graduate-researchers-award-call-for-nominations).<br>
Additional GBIF info: [GBIF Strategic Framework 2023-2027](https://www.gbif.org/document/50lI7Bxn2p1vRgpbs7aXaT/gbif-strategic-framework-2023-2027).

### v0.4b
**To be decided:** should we join this new version with 0.4a?

### Future versions
- **DATABASE:**
    - Expand available traits.
    - Use SQL Views to improve efficiency and speed.
- **GENERAL CODE:**
    - Footer: link to full changelog.
    - Styles: animations, general feedback to improve user experience.
    - Implement AI assistant.
- **COMPONENTS:**
    - Error:
        - Draw GIFs for the Error component.
    - Navbar:
        - Add search function for species.
    - Tooltip [NEW]:
        - Function building.
        - Apply function wherever it’s needed.
        - Implement prop for “img + text” or “just text”.
- **PAGES:**
    - Home:
        - Hero element to improve user experience (title, aim of the website, full picture, etc.).
        - “What’s new” (latest update).
    - Identify:
        - Filters (family, sex, environment, hide no data [Default TRUE], etc.).
        - Count matching species.
        - Accordion with traits.
        - Substitute accordions with interactive calanoid picture.
        - Deselect traits.
        - “Best match” function in case of “no results”. Maybe allow it just for 3+ selected traits?
        - “Compare” function: allows to select a species that will be used as reference during the identification process. Any picture of traits will show both that of the matching species and that of the compared species (if possible, with the correct proportions of size).
        - “Generate Key” function: generates a new key using the matching species.
        - Separate in 2 pages: traditional key (but interactive) and exclusion key.
    - Personalized key [NEW]:
        - Allows to select preferred traits, and generates a full, old-style identification key with priority to the selected traits.
    - SpeciesDetail:
        - Improve trait section: icons, f/m/common traits, etc.
    - SpeciesList:
        - Search function with filters (family, genus, environment, etc.).
        - Family icons.
        - Improve visualization (grid/list), family icons first.
    - Traits [NEW]:
        - Dedicated page, similar to SpeciesList and SpeciesDetail, but for traits.
