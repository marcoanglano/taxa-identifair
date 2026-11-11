# CHANGELOG

## v1 - Public Release
First public release. DOI, licences, frontend readability.
### 2026-11-10 “1.0.1 – Homepage & Footer improvement”
- Final commit and release.
### 2026-11-10 “1.0.0+dev.20261111 – Homepage improvement”
- Website description, roadmap and latest update added to the homepage (with images).
- Short descriptions added to each SpeciesList and Identify pages.
- Minor footer fix in mobile visualization.
- Full frontend/backend code revision.
### 2026-11-10 “1.0.0+dev.20261110 – Footer component”
- Footer component created.
- Details provided by the footer are now expanded (citations, versions, contacts, changelog, etc.).
- Changelog page is now accessible (/changelog).
### 2026-11-09 “1.0.0 – Public Release”
- First public release with DOI.

## v0.6 - General efficiency
General revision of database, code and style to improve efficiency before the first deployment.
### 2026-11-09 “0.6.07.01 – FAIRness & Licensing”
- LICENCE, LICENCE-DATA.md, CITATION.cff, sync-metadata.js, and codemeta.json files created.
- Project published on Figshare for DOI citation.
### 2026-11-08 “0.6.07.00 – Drawing references”
- New table created in Supabase (species_references) to include references of species drawings.
- SpeciesDetail now shows references of species drawings.
- Small bug fix in Identify (now it displays "Missing data" correctly).
### 2026-11-06 “0.6.06.01 – Search on local DB”
- utils/matchingEngine.js created match species on the local DB.
- useIdentify updated accordingly.
- Local DB pre-loading added in App.jsx
### 2026-11-06 “0.6.06.00 – DB download for a faster Identify page”
- utils/cacheManager.js created for DB download.
- supabaseAdapter and dataService updated accordingly.
### 2026-11-06 “0.6.05.03 – Missing Data fix”
- Fixing error in displaying species with missing data (/Identify).
### 2026-11-02 “0.6.05.02 – Minor adjustments 2”
- Minor adjustments.
### 2026-11-02 “0.6.05.01 – Minor adjustments”
- Minor adjustments.
### 2026-11-02 “0.6.05.00 – Database update 0.7”
- New species, new data, sligthly new structure.
- Bug fix (due to database changes).
### 2026-10-05 “0.6.04.04 – Minor adjustments 2”
- Minor adjustments before version closure.
### 2026-10-05 “0.6.04.03 – Minor adjustments”
- Solved error in Identify and SpeciesDetail due to the change in the db schema.
### 2026-10-04 “0.6.04.02 – Parent traits 2”
- useIdentify now excludes traits from selection depending on the state of a parent trait.
### 2026-10-04 “0.6.04.01 – Parent traits”
- parent_trait_id and required_state_id added to traits table in the database.
- This allows to exclude traits from selection depending on the state of a parent trait.
### 2026-10-04 “0.6.04.00 – Dependancy from Supabase”
- Code is now independent from the database thanks to supabaseAdapter.js.
- A change of service will only require a new adapter file, no need to edit the rest of the code.
### 2026-10-03 “0.6.03.01 – Components check: SD_cards”
- SD_cards component divided into sub-components: SD_card_syn_bas, SD_card_taxonomy, SD_card_env, SD_card_map, SD_card_ref.
- SpeciesDetail page updated accordingly.
### 2026-10-03 “0.6.03.00 – Components check”
- Checking errors, redundancy, useless code in the Components.
- Minor corrections in the Components.
### 2026-09-16 “0.6.02.01 – Missing data in matching species 2”
- Identify now displays missing data for each species if present.
- Matching species with missing data go to the bottom of the list.
### 2026-09-16 “0.6.02.00 – Missing data in matching species”
- useIdentify now communicates any missing data in the matching process.
### 2026-09-15 “0.6.01.02 – Improved filters”
- "Apply" logic removed from filters in Identify.
### 2026-09-15 “0.6.01.01 – Improved hooks”
- Improved hooks (useGBIF, useIdentify, useSpeciesDetail).
- Joined useGBIF and useOccurrencesGBIF.
### 2026-09-15 “0.6.01.00 – Improved dataService”
- Improved dataService (efficiency, readability).
### 2026-09-14 “0.6.00.01 – Deployment + WIP message”
- Deployed again.
- Added "Work in progress" message in the Homepage.
### 2026-09-14 “0.6.00.00 – General restyling”
- General restyling.
- Re-arrangement of .css files and imports.
- Small improvements in code efficiency.
- Test page created.

## v0.5 - UZI Version
Version for UZI 2026 (and presentation to colleagues at Unisalento). Building Identify, adding tooltips to assist the identification process.
### 2026-08-31 “0.5.05.03_UZI_2026 – UZI Congress”
- UZI Congress 2026: temporary deployment.
### 2026-08-22 “0.5.05.03 – Tooltips 4”
- Tooltips now displayed also in the Matching Species section in Identify.
- Tooltips now displayed also in the Traits section in Species Detail.
### 2026-08-22 “0.5.05.02 – Tooltips 3”
- Tooltips now work fine also on mobile.
### 2026-08-22 “0.5.05.01 – Tooltips 2”
- Corrected some errors of visualization of the tooltip.
### 2026-08-22 “0.5.05.00 – Tooltips”
- Tooltips added to the Icon function. They can display text and images.
### 2026-08-21 “0.5.04.01 – Filters now work”
- Filters can be applied to the identification process.
### 2026-08-21 “0.5.04.00 – Filters from DB”
- Identify now recovers filters from DB, substituting mock data.
### 2026-08-20 “0.5.03.02 – Matching species 3”
- Icons added in Identify.
- Small adjustments.
### 2026-08-20 “0.5.03.01 – Matching species 2”
- Matching species improved with some details about the species.
### 2026-08-19 “0.5.03.00 – Matching species”
- Matching species function implemented.
### 2026-08-18 “0.5.02.03 – Icons 2”
- Icons implemented in SpeciesDetail.
### 2026-08-18 “0.5.02.02 – Icons”
- Notes about species traits added in SpeciesDetail.
- Icon function implemented to handle future trait icons.
### 2026-08-17 “0.5.02.01 – Species Detail: traits improved”
- Traits with the same state in both sexes are now shown only once, to reduce redundancy.
- Small adjustment to handle missing data from both sexes.
### 2026-08-16 “0.5.02.00 – Compatibility with new DB”
- Supabase updated with new data and images.
- Code updated for a perfect compatibility with the slightly new DB.
- 'python' folder created with some useful scripts to automatize some tasks.
### 2026-06-21 “0.5.01.04 – Loading skeletons in Identify”
- Added loading skeletons in Identify.
### 2026-06-21 “0.5.01.03 – Traits from Supabase”
- Traits imported from Supabase.
- Traits displayed in Identify.jsx.
### 2026-06-17 “0.5.01.02 – Identify code shortening (2)”
- Created new rendering components for Identify (ID_active, ID_filters, ID_matching and ID_traits).
### 2026-06-17 “0.5.01.01 – Identify code shortening (1)”
- Moved hooks and mock data out of Identify (/utils > mockData.js, /hooks > useIdentify.js).
### 2026-06-16 “0.5.01.00 – Mock filters and traits”
- Added mock filters and traits to simulate page functioning.
- Expanded rendering of Identify to show mock filters and traits.
- Added selection and deselection logic on filters and traits.
### 2026-06-16 “0.5.00.02 – Identify left column”
- Separated filters and traits in the left column.
### 2026-06-07 “0.5.00.01 – Identify page created”
- Basic structure of Identify defined.
### 2026-06-02 “0.5.00.00 – Small adjustments + Roadmap definition”
- Re-branding: ZPid --> Taxa IdentiFAIR.
- v0.5 roadmap definition: building Identify.

## v0.4a - GBIF Version
Branched version for GBIF 2026 contest. Implement new functionality based on GBIF databases.<br>
Contest info: [2026 GBIF Graduate Researchers Award call for nominations](https://www.gbif.org/news/2qFpkI7rwBNbMuSjn2rtae/2026-gbif-graduate-researchers-award-call-for-nominations).<br>
Additional GBIF info: [GBIF Strategic Framework 2023-2027](https://www.gbif.org/document/50lI7Bxn2p1vRgpbs7aXaT/gbif-strategic-framework-2023-2027).
### 2026-04-28 “0.4a.01.11 – Map of occurrences”
- Heatmap substituted with a density map generated by GBIF.
- Occurrence limit removed.
- Added References in SpeciesDetail.
### 2026-04-28 “0.4a.01.10 – Heatmap update”
- Heatmap loading isolated from the rest of SpeciesDetail.
- Heatmap limit of occurrences rised to 5000.
- Minor adjustments to heatmap skeleton and styles.
### 2026-04-28 “0.4a.01.09 – Heatmap of occurrences”
- Tested heatmap of occurrences (GBIF) as a new card in SpeciesDetail.
- Heatmap limit of occurrences fixed to 2000.
### 2026-04-27 “0.4a.01.08 – Basionym and synonyms”
- Fixed loading of Skeleton in SpeciesDetail (GBIF section).
- Added SpeciesDetail card (basionym, synonyms).
- Added formatScientificName in /utils for basionym and synonym formatting.
### 2026-04-17 “0.4a.01.07 – Skeleton improvement”
- Improved Skeleton to mimic heights/widths.
- Fixed loading logic of SpeciesDetail.
### 2026-04-09 “0.4a.01.06 – SpeciesDetail skeleton”
- App.jsx improvement using Package.json.
- SpeciesDetail skeleton created, loading effect added.
### 2026-04-01 “0.4a.01.05 – Support files improved”
- UPDATER.md split in 3 files:
    - CHANGELOG.md (website updates).
    - README.md (website guide and roadmap) [TRACKED].
    - UPDATER.md (last version).
### 2026-04-01 “0.4a.01.04 – SpeciesDetail components”
- Links, card sections, length bars and traits are now /components.
### 2026-04-01 “0.4a.01.03 – Error handling (2)”
- Error handling improved (Error.jsx is now a /component).
### 2026-03-31 “0.4a.01.02 – SpeciesDetail error handling”
- SpeciesDetail, improved error handling (hard and soft dependancies).
### 2026-03-30 “0.4a.01.01 – SpeciesDetail re-design”
- SpeciesDetail structure and styles re-designed.
- Added GBIF, WoRMS, MPC logos as external links.
### 2026-03-27 “0.4a.01.00 – Website allignment to DB”
- Code alligned to the new version of traits database.
### 2026-03-26 “0.4a.00.01 – gitignore update”
- General database rework
-	README.md added to gitignore.
### 2026-03-23 “0.4a.00.00 – Taxonomy and link from GBIF”
-	**Supabase update:**
    -	Reduced number of species.
    -	Added gbif id in table “species”.
-	dataService now includes GBIF, asks for taxonomy.
-	Created hook useGBIF for species taxonomy.
-	SpeciesDetail now displays taxonomy and link to GBIF.
-	Minor adjustments.

## v0.3 - Rebuilt Version
Website re-built from zero, with a focus on efficiency, readability, restyling.
### 2026-03-18 “0.3.11.02 – Final adjustments”
-	Minor adjustments in Accordion.
### 2026-03-17 “0.3.11.01 – CSS efficiency”
-	Rewrited CSS files for efficiency and easier changes in the future.
### 2026-03-17 “0.3.11.00 – Colour palette”
-	Changed colour palette.
### 2026-03-10 “0.3.10.03 – Minor adjustments”
-	formatLength (utils) improved.
### 2026-03-10 “0.3.10.02 – Hooks created”
-	hooks/useFamilies.js and hooks/useSpeciesDetail.js created.
-	Moved fetching/caching from SpeciesList and SpeciesDetail to hooks/.
### 2026-03-09 “0.3.10.01 – Utils created”
-	utils/speciesHelpers.js created.
-	Moved some utils from SpeciesDetail to speciesHelper.
### 2026-03-09 “0.3.10.00 – Fetching moved to dataService”
-	services/dataService.js created.
-	Fetching in SpeciesDetail and SpeciesList moved to dataService.
### 2026-03-05 “0.3.09.01 – Species traits as accordions”
-	Species traits visualized as accordions in SpeciesDetail.
### 2026-03-04 “0.3.09.00 – Species traits on SpeciesDetail”
-	Species traits added in SpeciesDetail.
### 2026-03-03 “0.3.08.01 – Error picture”
-	Added picture to error message.
### 2026-02-23 “0.3.08.00 – Size Bars”
-	Size bars added to SpeciesDetail.
-	Minor restyle.
### 2026-02-21 “0.3.07.00 – Error handling”
-	Error.jsx created for wrong URLs.
-	SpeciesDetail error alligned accordingly.
### 2026-02-21 “0.3.06.02 – SpeciesDetail.css”
-	SpeciesDetail.css created.
-	Data divided in 2 columns.
### 2026-02-21 “0.3.06.01 – New prop in Accordion: hasProgressbar”
-	New prop added to Accordion: now you can turn off “progress bar” styling.
### 2026-02-20 “0.3.06.00 – Species details from Supabase”
-	SpeciesDetails now takes data from Supabase.
### 2026-02-20 “0.3.05.02 – Updated styles, colors in :root”
-	General restyle of the website.
-	Colors moved to :root.
### 2026-02-19 “0.3.05.01 – Updated styles, new component: Navbar”
-	Navbar.jsx created, function included in App.jsx.
-	General restyle of the website.
### 2026-02-18 “0.3.05.00 – Accordions in SpeciesList”
-	Accordion now works as “loading bar”.
-	SpeciesList.jsx now fetches by selected family, with cache in-session.
### 2026-02-17 “0.3.04.00 – New component: Accordion”
-	Accordion.jsx created.
-	Accordion function integrated in SpeciesList.jsx.
### 2026-02-16 “0.3.03.00 – Species list from DB”
-	Species list from Supabase added in SpeciesList.jsx.
-	SpeciesList.css created.
### 2026-02-13 “0.3.02.00 – First styles”
-	First update of App.css and index.css.
### 2026-02-11 “0.3.01.00 – Created main pages”
-	TOTAL RESET.
-	gitdiff.txt created.
-	Header and footer added in App.jsx.
-	Home.jsx, Identify.jsx, SpeciesDetail.jsx and SpeciesList.jsx created.
-	Routes set in App.jsx.

## v0.2 - Potentiality exploration [Advanced]
First versions to test feasibility of the project and experiment functionalities.
### 2025-12-23 “0.2.05 – Identify general improvement”
-	0.2.05.01 – Identify: graphic improvements.
-	0.2.05.02 – Identify: trait reset button, filter/trait definition.
-	0.2.06.00 – Identify: trait de-selection.
### 2025-12-22 “0.2.04 – State icons in Identify”
-	0.2.04.01 – Added note in Identify (adult Calanoida only).
-	0.2.04.02 – Trait icons in category accordions.
-	0.2.04.03 – Trait icons as notes in Identify.
-	0.2.05.00 – Minor fixes.
### 2025-12-21 “0.2.03 – State icons in SpeciesDetail”
-	0.2.03.01 – Changed f/m color.
-	0.2.03.02 – Added traits section in SpeciesDetail (test).
-	0.2.03.03 – Minor fixes.
-	0.2.03.04 – Tooltip fix in SpeciesDetail.
-	0.2.03.05 – SpeciesDetail, traits from DB.
-	0.2.03.06 – Major fix (icons, tooltips).
-	0.2.04.00 – Promise.all for secondary fetches.
### 2025-12-19 “0.2.02 – State icons”
-	0.2.02.01 – Tested new state icons and URLs.
-	0.2.03.00 – Minor adjustments.
### 2025-12-18 “0.2.01.00 – Code allignement to DB”
-	General:
    -	Rearranged files and folders.
    -	Minor graphic adjustment.
-	App.jsx:
    -	Added subtitle “Calanoida”.
    -	Added footer with copyright.
    -	Moved version to footer.
-	Code:
    -	Alligned to DB v0.2.
    -	Corrected file connection.
    -	Better arrangement for comments/sections.
-	SpeciesDetail.jsx:
    -	Added side column for future updates.
    -	Tested svg icons for trait states.
### 2025-12-17 “0.2.00.00 – DB population”
-	Populated DB v0.2.
### 2025-12-16 “0.2.00.00 – Roadmap and DB upgrade”
-	General:
    -	Scheduled roadmap of v0.2.
-	Database:
    -	Generated schema for the new database (species, traits, trait_states, species_traits).






## v0.1 - Potentiality exploration [Start]
First versions to test feasibility of the project and experiment functionalities.
### 2025-12-15 “0.1.00.00” – Foundation Release
-	**Database:**
    -	Designed initial Supabase database schema.
    -	Implemented species, traits and species_traits tables.
    -	Supported sex-specific records and missing trait data.
-	**Frontend architecture:**
    -	Bootstrapped React + Vite project.
    -	Implemented routing with React Router.
    -	Centralized Supabase client.
    -	Separated pages and styles.
-	**Pages:**
    -	Species list:
        -	Implemented hierarchical species list (family → genus → species).
        -	Removed duplicates caused by sex-specific records.
    -	Species detail:
        -	Implemented aggregated species view (male + female).
        -	Added size bars aligned to millimetric scale.
        -	Handled missing size data gracefully.
    -	Identify:
        -	Implemented multi-trait identification tool.
        -	Supported multiple trait selection with preserved order.
        -	Distinguished exact matches and “no data” matches.
        -	Displayed per-trait notes via tooltips.
-	**UI & UX:**
    -	Introduced dark theme with CSS variables.
    -	Added navigation bar with project title and version.
    -	Constrained content width for readability.
-	**Code quality:**
    -	Refactored async effects and hooks usage.
    -	Improved code compactness and readability.
-	**Known limitations:**
    -	Identification logic limited to categorical traits.
    -	Visual design is provisional and minimal.
