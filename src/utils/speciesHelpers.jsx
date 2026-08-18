/**
 * ========== CONTENT ==========
 *  - Calculate mean
 *  - Format length
 *  - Format scientific name
 *  - Links (GBIF, WoRMS, other)
 *  - Resolve icons
 *  - Resolve labels
 */


/**
 * <<< CALCULATE MEAN >>>
 * Calculates mean between a min and a max value
 * (For length bars)
 */
export const calculateMean = (min, max) => {
  if (min === null || min === undefined || max === null || max === undefined) return null;
  return (min + max) / 2;
};


/** 
 * <<< FORMAT LENGTH >>>
 * Formats lengths with 3 decimals
 * (If null, returns a fallback)
 */
export const formatLength = (min, max) => {
  if (min === null || min === undefined || max === null || max === undefined) return " No data";
  if (min === max) return ` ${min.toFixed(3)}`;
  return ` ${min.toFixed(3)} - ${max.toFixed(3)}`;
};


/** 
 * <<< FORMAT SCIENTIFIC NAME >>>
 * Formats scientific names in italics
 */
export const formatScientificName = (fullName) => {
  if (!fullName || typeof fullName !== "string") return "";

  // Separates scientific name from authority
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return <i>{fullName}</i>;
  const genusAndSpecies = parts.slice(0, 2).join(" ");
  const authority = parts.slice(2).join(" ");

  return ( <> <i>{genusAndSpecies}</i> {authority} </> );
};


/**
 * <<< LINKS >>>
 */
/* GBIF */
export const getGBIFLink = (gbifId) => {
  if (!gbifId) return false;
  return `https://www.gbif.org/species/${gbifId}`;
};
/* WoRMS */
export const getWormsLink = (wormsId) => {
  if (!wormsId) return false;
  return `https://www.marinespecies.org/aphia.php?p=taxdetails&id=${wormsId}`;
};
/* Other (Razouls for Calanoida) */
export const getOtherLink = (otherId) => {
  if (!otherId) return false;
  return `https://copepodes.obs-banyuls.fr/en/fichesp.php?sp=${otherId}`; // TO DO: change website depending on the taxon
};


/**
 * <<< RESOLVE ICONS >>>
 * Converts state ids into icon urls
 */
export const resolveIcons = (stateIds, allStates) => {
  if (!stateIds || !allStates) return [];
  return stateIds
    .map(sid => allStates.find((s) => s.id_state === sid)?.state_icon_url || sid)
    .filter(Boolean); // Filters states with no icon
};


/**
 * <<< RESOLVE LABELS >>>
 * Converts state ids into labels
 * ("PR_som_5" --> "5")
 */
export const resolveLabels = (stateIds, allStates) => {
  if (!stateIds || !allStates) return "";
  return stateIds
    .map(sid => allStates.find(s => s.id_state === sid)?.state_label || sid)
    .join(", ");
};
