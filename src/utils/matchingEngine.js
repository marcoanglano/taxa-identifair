export function calculateMatchesJS(dataset = [], selectedTraits = []) {
  if (!selectedTraits.length) return [];

  // 1. Separazione degli stati selezionati
  const symmetricStates = selectedTraits
    .filter((t) => !t.isAsymmetric && t.stateId)
    .map((t) => t.stateId);
  const leftStates = selectedTraits
    .filter((t) => t.isAsymmetric && t.leftStateId)
    .map((t) => t.leftStateId);
  const rightStates = selectedTraits
    .filter((t) => t.isAsymmetric && t.rightStateId)
    .map((t) => t.rightStateId);

  // 2. Filtraggio specie
  return dataset
    .map((sp) => {
      const traitsMap = sp.traitsMap || {};

      // Helper interno: verifica se gli stati richiesti sono soddisfatti da un array di stati della specie
      const checkStates = (requestedStates, getSpeciesStates) => {
        if (!requestedStates.length) return true;
        return requestedStates.every((reqState) => {
          // Ricerca rapida del tratto associato allo stato selezionato
          const traitObj = Object.values(traitsMap).find((t) =>
            (t.f_left || []).includes(reqState) ||
            (t.f_right || []).includes(reqState) ||
            (t.m_left || []).includes(reqState) ||
            (t.m_right || []).includes(reqState)
          );

          if (!traitObj) return true; // Dato assente nella specie -> passa il filtro (mancante)

          const specStates = getSpeciesStates(traitObj);
          if (!specStates || specStates.length === 0) return true; // Dato assente -> passa

          return specStates.includes(reqState);
        });
      };

      // --- MATCH FEMMINA (♀) ---
      const match_f =
        checkStates(symmetricStates, (t) => [...(t.f_left || []), ...(t.f_right || [])]) &&
        checkStates(leftStates, (t) => t.f_left || []) &&
        checkStates(rightStates, (t) => t.f_right || []);

      // --- MATCH MASCHIO (♂) ---
      const match_m =
        checkStates(symmetricStates, (t) => [...(t.m_left || []), ...(t.m_right || [])]) &&
        checkStates(leftStates, (t) => t.m_left || []) &&
        checkStates(rightStates, (t) => t.m_right || []);

      if (!match_f && !match_m) return null;

      // Estraiamo traits_info formattato per la resa visiva in ID_matching
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
