// ##### IMPORTS #####
// LIB
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


// ##### DEFINE PATHS & LOAD PACKAGE.JSON #####
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const pkgPath = path.join(rootDir, 'package.json'); // SSOT
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const today = new Date().toISOString().split('T')[0];


// ##### SCRIPT #####
// Synchronizes project metadata across FAIR documentation files.
// Uses `package.json` as the Single Source of Truth (SSOT).

// 1. Builds CITATION.cff
const cffContent = `cff-version: 1.2.0
message: "If you use this software or the underlying taxonomic dataset, please cite it using the metadata below."
type: dataset
title: "${pkg.title || pkg.name}"
abstract: "${pkg.description ? pkg.description.replace(/\n/g, ' ') : ''}"
authors:
  - family-names: "Anglano"
    given-names: "Marco"
    orcid: "${pkg.author?.url || ''}"
    affiliation: "${pkg.author?.affiliation || ''}"
repository-code: "https://github.com/marcoanglano/taxa-identifair"
url: "https://taxa-identifair.vercel.app/"
keywords:
  - "zooplankton"
  - "Calanoida"
  - "marine biology"
  - "taxonomic identification"
  - "FAIR data"
  - "Copepoda"
license: CC-BY-4.0
license-code: ${pkg.license || 'MIT'}
version: "${pkg.version}"
date-released: "${today}"
`;
fs.writeFileSync(path.join(rootDir, 'CITATION.cff'), cffContent.trim() + '\n');

// 2. Builds codemeta.json
const codemeta = {
  "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
  "@type": "SoftwareSourceCode",
  "identifier": "taxa-identifair",
  "name": pkg.title || pkg.name,
  "description": pkg.description,
  "codeRepository": "https://github.com/marcoanglano/taxa-identifair",
  "issueTracker": "https://github.com/marcoanglano/taxa-identifair/issues",
  "license": "https://spdx.org/licenses/MIT.html",
  "version": pkg.version,
  "datePublished": today,
  "programmingLanguage": [
    "JavaScript",
    "PL/pgSQL"
  ],
  "runtimePlatform": "Browser (React, Vite, IndexedDB), Supabase",
  "author": [
    {
      "@type": "Person",
      "givenName": "Marco",
      "familyName": "Anglano",
      "email": pkg.author?.email || "",
      "id": pkg.author?.url || ""
    }
  ],
  "keywords": [
    "zooplankton",
    "Calanoida",
    "marine biology",
    "taxonomic identification",
    "FAIR data",
    "Copepoda"
  ]
};

// 3. Generates files
fs.writeFileSync(
  path.join(rootDir, 'codemeta.json'),
  JSON.stringify(codemeta, null, 2) + '\n'
);
console.log(`[FAIR Sync] Synchronized CITATION.cff and codemeta.json to version ${pkg.version} (${today})`);
