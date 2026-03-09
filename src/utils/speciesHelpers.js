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
 * Formats a number with 3 decimals
 * (If null, returns a fallback)
 */
export const formatLength = (val) => {
  if (val === null || val === undefined) return "No data";
  return `${val.toFixed(3)} mm`;
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
