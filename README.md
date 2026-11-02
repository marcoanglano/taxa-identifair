# Taxa IdentiFAIR
**Interactive key for adult Calanoida**

Website based on React + Vite, which collects the main information available on each species of Calanoida. The main aim is to provide an identification tool down to the species level, using data archived on GBIF, Supabase and other databases. The search occurs by exclusion using the provided filters (environment, sex, length etc.) and traits (anatomical details).

*Key work: Böttger-Schnack, R., & Schnack, D. (2015). Development of an interactive identification key for Oncaeidae (Copepoda: Cyclopoida). Journal of Natural History, 49(45-48), 2727-2741.*


## Roadmap 🛣️
### v0.6 - General efficiency
General revision of database, code and style to improve efficiency before the first deployment.


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
        - Interactive, full picture of the species.
    - SpeciesList:
        - Search function with filters (family, genus, environment, etc.).
        - Family icons.
        - Improve visualization (grid/list), family icons first.
    - Traits [NEW]:
        - Dedicated page, similar to SpeciesList and SpeciesDetail, but for traits.
