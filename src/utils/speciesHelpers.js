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
  if (min === max) return ` ${min.toFixed(3)} mm`;
  return ` ${min.toFixed(3)} - ${max.toFixed(3)} mm`;
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
