# Taxa IdentiFAIR
**Interactive key for adult Calanoida**

Website based on React + Vite, which collects the main information available on each species of Calanoida. The main aim is to provide an identification tool down to the species level, using data archived on GBIF, Supabase and other databases. The search occurs by exclusion using the provided filters (environment, sex, length etc.) and traits (anatomical details).

*Key work: Böttger-Schnack, R., & Schnack, D. (2015). Development of an interactive identification key for Oncaeidae (Copepoda: Cyclopoida). Journal of Natural History, 49(45-48), 2727-2741.*


## Roadmap 🛣️
### v0.1-0.2
First versions to test feasibility of the project and experiment functionalities.
### v0.3
Website re-built from zero, with a focus on efficiency, readability, restyling.
### v0.4a - GBIF version
Branched version for GBIF 2026 contest. Implement new functionality based on GBIF databases.<br>
Contest info: [2026 GBIF Graduate Researchers Award call for nominations](https://www.gbif.org/news/2qFpkI7rwBNbMuSjn2rtae/2026-gbif-graduate-researchers-award-call-for-nominations).<br>
Additional GBIF info: [GBIF Strategic Framework 2023-2027](https://www.gbif.org/document/50lI7Bxn2p1vRgpbs7aXaT/gbif-strategic-framework-2023-2027).
### v0.5 - UZI version
Version for UZI 2026 (and presentation to colleagues at Unisalento). Building identify, adding tooltips to assist the identification process.
- #### v0.5.04
    Implementation of filters.
- #### v0.5.05
    Tooltips [NEW COMPONENT]:
    - Function building.
    - Apply function wherever it’s needed.
    - Implement prop for “img + text” or “just text”.
- #### v0.5.06
    Bug correction and page improvement (check also "Future versions" for inspirations).
- #### v0.5.07
    Styling.


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
- **PAGES:**
    - Home:
        - Hero element to improve user experience (title, aim of the website, full picture, etc.).
        - “What’s new” (latest update).
    - Identify:
        - Substitute accordions with interactive calanoid picture?
        - “Best match” function in case of “no results”. Maybe allow it just for 3+ selected traits?
        - “Compare” function: allows to select a species that will be used as reference during the identification process. Any picture of traits will show both that of the matching species and that of the compared species (if possible, with the correct proportions of size).
        - “Generate Key” function: generates a new key using the matching species.
        - Separate in 2 pages: traditional key (but interactive) and exclusion key.
    - Personalized key [NEW]:
        - Allows to select preferred traits, and generates a full, old-style identification key with priority to the selected traits.
    - SpeciesDetail:
        - Improve trait section: icons, f/m/common traits, etc.
        - Gallery (from GBIF? Filter cards and documents).
    - SpeciesList:
        - Search function with filters (family, genus, environment, etc.).
        - Family icons.
        - Improve visualization (grid/list), family icons first.
    - Traits [NEW]:
        - Dedicated page, similar to SpeciesList and SpeciesDetail, but for traits.
