// src/utils/matchingEngine.js
// In-Memory Trait Matching Engine

export function calculateMatchesJS(dataset = [], selectedTraits = []) {
  if (!selectedTraits.length) return [];

  // 1. Separates selected states
  const symmetricStates = selectedTraits
    .filter((t) => !t.isAsymmetric && t.stateId)
    .map((t) => t.stateId);
  const leftStates = selectedTraits
    .filter((t) => t.isAsymmetric && t.leftStateId)
    .map((t) => t.leftStateId);
  const rightStates = selectedTraits
    .filter((t) => t.isAsymmetric && t.rightStateId)
    .map((t) => t.rightStateId);

  // 2. Match species
  return dataset
    .map((sp) => {
      const traitsMap = sp.traitsMap || {};

      // Check matching states
      const checkStates = (requestedStates, getSpeciesStates) => {
        if (!requestedStates.length) return true;
        return requestedStates.every((reqState) => {
          const traitObj = Object.values(traitsMap).find((t) =>
            (t.f_left || []).includes(reqState) ||
            (t.f_right || []).includes(reqState) ||
            (t.m_left || []).includes(reqState) ||
            (t.m_right || []).includes(reqState)
          );
          // Missing data -> in the list
          if (!traitObj) return true;
          const specStates = getSpeciesStates(traitObj);
          if (!specStates || specStates.length === 0) return true;

          return specStates.includes(reqState);
        });
      };

      // FEMALE MATCH
      const match_f =
        checkStates(symmetricStates, (t) => [...(t.f_left || []), ...(t.f_right || [])]) &&
        checkStates(leftStates, (t) => t.f_left || []) &&
        checkStates(rightStates, (t) => t.f_right || []);
      // MALE MATCH
      const match_m =
        checkStates(symmetricStates, (t) => [...(t.m_left || []), ...(t.m_right || [])]) &&
        checkStates(leftStates, (t) => t.m_left || []) &&
        checkStates(rightStates, (t) => t.m_right || []);
      if (!match_f && !match_m) return null;
      const traits_info = Object.values(traitsMap);

      return {
        id_species: sp.id_species,
        scientific_name: sp.scientific_name,
        family: sp.family,
        match_f,
        match_m,
        traits_info,
        filters: {
          environment: sp.environment,
          f_min: sp.f_min,
          f_max: sp.f_max,
          m_min: sp.m_min,
          m_max: sp.m_max
        }
      };
    })
    .filter(Boolean);
}
