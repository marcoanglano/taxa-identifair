# Repository Code Overview

## File: `src\styles\Accordion.css`

```css
/* ##### GENERAL ##### */
.acc-root {
  display: grid;
  gap: 2px;
}
.acc-item { overflow: hidden; }


/* ##### HEADER ##### */
.acc-header {
  background: var(--sec-color-D);
  border: none;
  padding: 10px 14px;

  display: flex;
  min-height: 40px;
  width: 100%;
  justify-content: space-between;
  
  cursor: pointer;
  overflow: hidden;
  position: relative;
}
.acc-h-text {
  display: flex;
  align-items: center;
  margin: 0;
  z-index: 2;
}

/* Effects */
.acc-header:hover { filter: brightness(var(--low)); }
/* Progress Bar */
.acc-header::before {
  background: var(--sec-color-DD);
  content: "";

  width: var(--acc-fill, 0%); /* --acc-fill in Accordion.jsx */
  transition: width 220ms ease-in-out;

  inset: 0;
  position: absolute;
  z-index: 1;
  pointer-events: none;
}
.acc-header.is-loaded::before { width: 100%; }


/* ##### CONTENT ##### */
.acc-content {
  padding: 10px 14px;
  text-align: justify;
}
.acc-content ul { margin-left: 5px; }

```

---

## File: `src\styles\App.css`

```css
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}


/* #####  HEADER  ##### */
#app-header { background-color: var(--prim-color); }
#app-brand {
  padding: 10px 8px;
  text-align: center;
}
#title { color: var(--sec-color); }
#subtitle {
  color: var(--sec-color-D);
  font-style: italic;
}


/* ##### NAVBAR ##### */
#nav-container { display: flex; }
/* Button */
.nav-btn {
  color: var(--sec-color);
  display: flex;
  justify-content: center;
  padding: 7px 10px;
  min-width: 140px;
  letter-spacing: 0.04em;
  transition: all 0.2s ease;
}
/* Button status */
.nav-btn:visited { color: var(--sec-color); }
.nav-btn:hover {
  background-color: var(--prim-color-L);
  filter: none;
  text-decoration: none;
}
.nav-active, .nav-active:hover { background: var(--prim-color-LL); }
/* Page icons */
#nav-icon {
  color: var(--sec-color-DD);
  font-size: large;
}


/* #####  MAIN  ##### */
#app-main {
  flex: 1 0 auto;
  padding: 2rem;
}


/* #####  FOOTER  ##### */
#app-footer {
  background-color: var(--prim-color);
  color: var(--sec-color-D);
  padding: 0.8rem 0rem 0.8rem;
  font-weight: 300;
}
.footer-content {
  display: flex;
  flex-direction: row;
  justify-content: left;
  gap: 2.4rem;
  margin-bottom: 0.8rem;
  padding: 0 0.8rem;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
}
.footer-title {
  color: var(--sec-color-DD);
  font-size: 0.95rem;
  border-bottom: 1px solid var(--prim-color-LL);
  padding-bottom: 0.3rem;
  margin-bottom: 0.4rem;
}
.footer-item {
  font-size: 0.85rem;
  margin: 0;
}
.footer-link {
  color: var(--sec-color-DD) !important;
  text-decoration: underline;
}
.footer-link:visited { color: var(--sec-color-DD); }
.footer-link:hover { color: var(--sec-color); }
.btn-footer-action {
  background: var(--prim-color-L);
  color: var(--sec-color-DD);
  border: 1px solid var(--prim-color-LL);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.75rem;
  cursor: pointer;
  align-self: flex-start;
  margin-top: 4px;
}
.btn-footer-action:hover {
  background: var(--prim-color-LL);
  color: var(--sec-color);
}
.footer-link-highlight {
  color: var(--sec-color-DD);
  font-weight: 500;
  text-decoration: underline;
  display: inline-block;
}
.footer-link-highlight:visited { color: var(--sec-color-DD); }
.footer-link-highlight:hover { color: var(--sec-color); }
#copy-contact {
  text-decoration: underline;
  cursor: pointer;
}
#copy-contact:hover { color: var(--sec-color); }

.footer-bottom {
  border-top: 1px solid var(--prim-color-L);
  padding: 0.8rem 0.8rem 0;
}
#footer-text {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  text-align: left;
}


/* ##### RESPONSIVE DESIGN ##### */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 1.5rem;
  }
  .footer-bottom { margin-top: 1.5rem; }
  #footer-text {
    flex-direction: column;
    gap: 0.3rem;
  }
}
```

---

## File: `src\styles\Changelog.css`

```css
.changelog-latest-group { margin-bottom: 2rem; }

.changelog-history-group .acc-header { color: var(--prim-color-L); }
```

---

## File: `src\styles\Error.css`

```css
/* ##### CONTAINER ##### */
.error-container {
    margin: 3rem auto 0;
    display: flex;
    width: 50%;
    align-items: center;
    text-align: center;
}


/* ##### LEFT: ERROR IMAGE ##### */
.error-left { flex: 1; }
.error-left img { width: 200px; }


/* ##### RIGHT: ERROR TEXT ##### */
.error-right { flex: 1; }
.error-right h1, .error-right p {
  color: var(--error-color);
  text-align: center;
}


/* ##### RESPONSIVE DESIGN ##### */
@media (max-width: 768px) {
  .error-container {
    flex-direction: column;
    gap: 1rem;
  }
  .error-left, .error-right { width: 100%; }
}

```

---

## File: `src\styles\Home.css`

```css
/* ##### BLOCKS ##### */
.block-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  margin-top: 1rem;
}
.block {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 2rem;
  background-color: var(--sec-color-D);
  overflow: hidden;
  max-height: 250px;
}
/* Alternate design */
.block:nth-child(even) .block-content { order: 2; }
.block:nth-child(even) .block-image-wrapper { order: 1; }


/* ##### CONTENT ##### */
.block-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 1.5rem;
}
.block-main h4 { margin-bottom: 0.8rem; }
.block-main p { color: var(--prim-color-L); }
.block-footer {
  font-size: 0.8rem;
  color: var(--prim-color-LLL);
  margin-top: 1.6rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--prim-color-LLL);
}


/* ##### IMAGE ##### */
.block-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 250px;
}
.block-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;

  /* Gradient */
  -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%);
  mask-image: linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%);
}
.block:nth-child(even) .block-image {
  -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%);
  mask-image: linear-gradient(to right, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%);
}


/* ##### RESPONSIVE DESIGN ##### */
@media (max-width: 768px) {
    .block {
        grid-template-columns: 1fr;
        max-height: none;
        min-height: auto;
    }

    .block:nth-child(even) .block-content { order: 1; }
    .block:nth-child(even) .block-image-wrapper { order: 2; }
    .block-image-wrapper { height: 200px; }

    .block-image,
    .block:nth-child(even) .block-image {
        -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%);
        mask-image: linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%);
    }
}

```

---

## File: `src\styles\Icon.css`

```css
/* ##### ICONS ##### */
.icon-wrapper {
  display: inline-flex;
  align-items: center;
}
.icon-wrapper:hover { cursor: crosshair; }


/* ##### TOOLTIP ##### */
.fixed-tooltip-box {
  background-color: var(--prim-color);
  color: var(--sec-color);
  border: 1px solid var(--prim-color-LL);
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: var(--shadow);
  
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  position: fixed;
  white-space: nowrap;
  z-index: 9999;
  pointer-events: none;
}
.fixed-tooltip-img {
  border-radius: 4px;
  filter: brightness(0) invert(1);

  min-width: 50px;
  min-height: 50px;
  max-width: 400px;
  max-height: 400px;
  width: auto;
  height: auto;
  object-fit: contain;
}


/* ##### RESPONSIVE DESIGN ##### */

@media (max-width: 768px) {

  /* Tooltip */
  .fixed-tooltip-box {
    width: calc(100vw - 12px);
    left: 6px !important;
    white-space: normal;
  }
  .fixed-tooltip-img { max-width: 100%; }
}
```

---

## File: `src\styles\Identify.css`

```css
/* ##### CONTAINERS ##### */
#identify-container {
  box-sizing: border-box;
  display: grid;
  gap: 20px;
  grid-template-columns: 2fr 1fr;
  width: 100%;
}
#identify-left { padding: 10px; }
#identify-right {
  border-left: 2px solid var(--prim-color-L);
  padding: 10px;
  
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 20px;
  min-height: 480px;
}


/* ##### LEFT COLUMN: FILTERS, TRAITS ##### */
#identify-title, #identify-tutorial { margin-bottom: 10px; }
#filters-traits-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* # Filters # */
#filters-container {
  border: 2px solid var(--prim-color-LL);
  background-color: var(--sec-color-DD);
  min-height: 180px;
  padding: 10px;
}
.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}
.filters-actions {
  display: flex;
  gap: 8px;
}

/* # Filter buttons # */
.btn-filter-apply, .btn-filter-clear {
  background-color: var(--prim-color-LLL);
  color: var(--sec-color);
  border: 1px solid var(--prim-color-LL);
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-filter-apply:disabled, 
.btn-filter-clear:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: none;
}
.btn-filter-apply:not(:disabled):hover, 
.btn-filter-clear:not(:disabled):hover {
  filter: brightness(var(--bright));
}

/* # Filter inputs */
#dynamic-filters-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  margin-top: 15px;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.filter-group select, .filter-group input {
  background-color: var(--prim-color-L);
  border: 1px solid var(--prim-color-LL);
  color: var(--sec-color);
  border-radius: 4px;
  font-size: 0.9rem;
  padding: 8px;
  width: 100%;
}
.filter-label { font-weight: bold; }

/* # Traits # */
#traits-container { min-height: 220px; }
.traits-header {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.traits-title { line-height: 1; }

/* # State buttons # */
.states-grid {
  display: flex;
  gap: 6px;
  padding: 5px 0;
}
.state-btn {
  background-color: var(--prim-color-L);
  color: var(--sec-color);
  border: 1px solid var(--prim-color-LL);
  border-radius: 4px;
  padding: 5px 8px;
  filter: drop-shadow(var(--contrast));

  display: flex;
  align-items: center;
  gap: 10px;

  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.state-btn:hover { background-color: var(--prim-color-LL); }
.state-btn:active { filter: none; }
.state-active, .badge-active {
  background-color: var(--prim-color-LLL);
  border: 1px solid var(--prim-color-LL);
  color: var(--sec-color);
}
.state-active:hover { background-color: var(--sec-color-DD); }

/* Asymmetric states */
.asymmetry-toggle-bar {
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px dashed var(--prim-color-LL);
}
.asymmetry-checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  cursor: pointer;
}
.asymmetric-grid-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.side-column {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.side-label {
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--prim-color-LLL);
}


/* ##### RIGHT COLUMN: ACTIVE STATES, MATCHING SPECIES ##### */
.title-margin { margin-bottom: 10px; }

/* # Active states # */
.badge-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.badge-active {
  border-radius: 4px;
  padding: 5px 8px;
  filter: drop-shadow(var(--contrast));

  display: inline-flex;
  align-items: center;
  gap: 6px;
  
  cursor: pointer;
  font-size: 0.8rem;
}
.badge-active:hover { background-color: var(--sec-color-DD); }
.badge-active:active { filter: none; }

/* # Matching species # */
.missing-data-icon, .matching-sex {
  margin-left: 8px;
  text-shadow: var(--contrast);
}
.missing-data-list {
  color: var(--error-color);
  margin-bottom: 15px;
}
.matching-link { margin-bottom: 15px; }
.matching-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.sex-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  padding: 0;
}
.sex-traits-item {
  display: flex;
  align-items: center;
}
.sex-traits-icons {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}


/* ##### RESPONSIVE DESIGN ##### */
@media (max-width: 768px) {
  #identify-container {
    display: flex;
    flex-direction: column;
  }
  #identify-left { width: 100%; }
  #identify-right {
    border-left: none;
    border-top: 2px solid var(--prim-color-L);
    width: 100%;
  }
  #filters-container { min-height: 320px; }
}

```

---

## File: `src\styles\Skeleton.css`

```css
.skeleton {
  position: relative;
  overflow: hidden;
  background-color: var(--sec-color-D);
  border: none !important;
}


/* ##### LOADING EFFECT ##### */
.skeleton::after {
  content: "";
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.4) 30%,
    rgba(255, 255, 255, 0.7) 50%,
    rgba(255, 255, 255, 0.4) 70%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 2s infinite;
}
@keyframes shimmer {
  100% { transform: translateX(100%); }
}

```

---

## File: `src\styles\SpeciesDetail.css`

```css
/* ##### CONTAINERS ##### */
#details-container {
  display: flex;
  gap: 20px;
}
#details-left { flex: 1; }
#details-right {
  border: 2px solid var(--prim-color-L);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}


/* ##### LEFT COLUMN (NAME, CARDS) ##### */
.card-section {
  margin-top: 5px;
  min-height: 95px;
  padding: 10px;
}
#gbif-error { margin-bottom: 50px; }

/* # HEADER (L) # */
/* Name */
#species-header {
  display: flex;
  min-height: 85px;
}
#species-name-container {
  margin-right: 5px;
  padding: 10px;
  width: 100%;
}
#species-name { font-style: italic; }
#species-authority { color: var(--prim-color-LL); }
/* External links */
#species-logos {
  align-items: center;
  display: flex;
  gap: 5px;
  margin-right: 10px;
}
.logo-button {
  background-color: transparent;
  border: 2px solid var(--prim-color-LLL);
  border-radius: 5px;
  padding: 10px;
}
.logo-button:hover {
  background-color: var(--sec-color-D);
  box-shadow: var(--shadow);
}
.logo-button:active {
  filter: none;
  box-shadow: none;
}
.logo { height: 30px; }

/* # CARD: SYNONYMS & BASIONYM # */
#no-nomenclature { opacity: 0.6; }
#syn-bas { list-style-type: none; }
.bas {
  font-weight: bold;
  margin-bottom: 4px;
}

/* # CARD: OCCURRENCES # */
#map-section { min-height: 400px; }
#map-div {
  border: 1px solid var(--prim-color);
  border-radius: 12px;
  height: 350px;
  overflow: hidden;
}
#map-container {
  background: var(--prim-color-L);
  height: 100%;
  width: 100%;
}
.tile-map {
    filter:
      brightness(2.5)
      contrast(1.5)
      !important;
}

/* # CARD: REFERENCES # */
#ref-section { min-height: 140px;}
#ref-list {
  font-size: small;
  text-align: justify;
}


/* ##### RIGHT COLUMN (LENGTH, TRAITS) ##### */

/* # HEADER (R) # */
#anat-title {
  padding: 10px 0 5px;
  text-align: center;
}
#anat-legend {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding-bottom: 5px;
}
#anat-legend p {
  align-items: center;
  display: flex;
}
.f { background-color: var(--female-color); }
.m { background-color: var(--male-color); }

/* # LENGTH BARS # */
#length-section {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-height: 120px;
  padding: 10px;
}
/* Bars */
#bar-container {
  display: flex;
  flex-direction: column;
  gap: inherit;
}
#bar-container p {
  align-items: center;
  display: flex;
  font-size: small;
}
.bar /* Also legend squares */ {
  border: 1px solid var(--prim-color-L);
  filter: drop-shadow(var(--contrast));

  border-radius: 0.2rem;
  display: inline-block;
  height: 1rem;
  margin-right: 5px;
  width: 1rem;
}
/* Scale */
#scale-bar {
  display: flex;
  height: 1rem;
  font-size: small;
  text-align: right;
}
#scale-bar span {
  flex: 1;
  padding-right: 0.2rem;
}
.scale-line { border-left: 0.1rem solid var(--prim-color); }
.scale-seg {
  border-top: 0.1rem solid var(--prim-color);
  border-right: 0.1rem solid var(--prim-color);
}
.first-seg {
  display: flex;
  justify-content: space-between;
}
.scale-mm {
  padding-left: 0.5rem;
  text-align: left;
}

/* # TRAITS # */
#traits-section {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-height: 200px;
  padding: 10px;
}
.sd-traits-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 5px 0;
}


/* ##### RESPONSIVE DESIGN ##### */
@media (max-width: 768px) {
  #details-container { flex-direction: column; }
  #details-left, #details-right { width: 100%; }

  #species-header { flex-direction: column; min-height: 160px; }
  #species-logos {
    justify-content: center;
    margin: 0 0 10px 0;
  }
}

```

---

## File: `src\styles\SpeciesList.css`

```css
/* ##### PAGE CONTENT ##### */
#list-loading, #list-tutorial { margin: 16px 0; }


/* ##### ACCORDION CONTENT ##### */
.species-list { margin: 4px 0 4px 18px; }
.sp-li-authority { opacity: 70%; }

```

---

## File: `src\styles\Test.css`

```css
/* ##### CONTAINERS ##### */
#test-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}
.test-subcontainer { 
    display: flex;
    flex-direction: column;
    gap: 5px;
}


/* ##### TEXT ##### */
.test-no-margin { margin: 0; }


/* ##### ICONS & TOOLTIPS ##### */
#test-icons-tooltips {
    display: flex;
    flex-direction: row;
    gap: 20px;
}


/* ##### ERROR & SKELETON ##### */
#test-error-skeleton {
    display: flex;
    flex-direction: row;
}
#test-error {
    border-right: 1px solid var(--prim-color);
    width: 100%;
    min-height: 290px;
    justify-content: center;
}
#test-error .error-container { 
    margin: 0;
    padding: 0;
    width: 100%;
}
#test-skeleton {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 10px;
}


/* ##### ROOT ##### */
#test-root {
    display: flex;
    flex-direction: row;
}
.test-square {
    border: 1px solid var(--prim-color);
    height: 30px;
    width: 30px;
}
.test-bright, .test-shadow { background-color: var(--prim-color-L); }


/* ##### BUTTONS ##### */
#test-buttons {
    display: flex;
    flex-direction: row;
}
#test-buttons button {
    height: 40px;
    width: 120px;
    justify-content: center;
}
```

---

## File: `src\styles\index.css`

```css
/* ##### IMPORTS ##### */
/* Components */
@import "Accordion.css";
@import "Error.css";
@import "Icon.css";
@import "Skeleton.css";
/* Layout & Pages */
@import "App.css";
@import "Changelog.css";
@import "Home.css";
@import "Identify.css";
@import "SpeciesDetail.css";
@import "SpeciesList.css";
@import "Test.css";


/* ##### GLOBAL RESET ##### */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}


/* ##### BODY ##### */
body {
  background-color: var(--sec-color);
  color: var(--prim-color);
  font-family: 'IBM Plex Sans', sans-serif;
}


/* ##### TEXT ##### */
h1 /* Main Title, Error */ {
  margin-bottom: 0.5rem;
  letter-spacing: 0.04em;
}
h2 /* Subtitle, Navbar */ {
  margin-bottom: 0.3rem;
  font-size: medium;
  font-weight: 400;
}
h3 /* Page title */ {
  margin-bottom: 0.3rem;
  font-size: x-large;
}
#changelog-page h1 /* Page title */ {
  margin-bottom: 1rem;
  font-size: x-large;
}
h4 /* Section title, Authority */ {
  margin-bottom: 0.3rem;
  font-size: large;
}
h5 /* Subsection title */ {
  margin-bottom: 0.2rem;
  font-size: medium;
}
#changelog-page h3 {
  margin-bottom: 0.2rem;
  font-size: small;
}
p /* Paragraph */ {
  margin-bottom: 0.2rem;
  text-align: justify;
}
ul, ol /* Lists */ {
  margin-bottom: 0.2rem;
  padding-left: 1.5rem;
}
#changelog-page p, #changelog-page ul {
  font-size: small;
  margin-bottom: 0.5rem;
}


/* ##### LINKS -LVHA- ##### */
a {
  color: var(--prim-color-LL);
  text-decoration: none;
}
a:visited { color: var(--prim-color-L); }
a:hover {
  filter: brightness(var(--bright)) drop-shadow(var(--shadow));
  text-decoration: underline;
}
a:active { filter: brightness(var(--brighter)); }
a[target="_blank"]:not(.logo-button)::after /* When new tab */ {
  content: " ↗";
  font-size: 0.8em;
  vertical-align: super;
}


/* ##### ROOT ##### */
:root {
  /* ### COLOURS ### */
  --prim-color: #0A1128; /* Prussian Blue */
  --prim-color-L: #001F54; /* Deep Navy */
  --prim-color-LL: #034078; /* Yale Blue */
  --prim-color-LLL: #1282A2; /* Cerulean */
  --sec-color-DD: #88BFCF; /* Sky Blue (Light) */
  --sec-color-D: #C3DEE5; /* Pale Sky */
  --sec-color: #FEFCFB; /* White */

  --error-color: #D63230; /* Tomato Jam */
  --female-color: #F39237; /* Carrot Orange */
  --male-color: #1C77C3; /* Twitter Blue */

  /* ### BRIGHTNESS ### */
  --low: 1.05;
  --bright: 1.20;
  --brighter: 1.40;
  
  /* ### SHADOW ### */
  --shadow: 0.2rem 0.2rem 0.2rem grey; /* Bars, Links */
  --contrast: 0.05rem 0.05rem 0.05rem black; /* Text */
}

```

---

