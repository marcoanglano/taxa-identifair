// ========== MOCK DATA for IDENTIFY (substitute with Supabase data in the future) ==========
export const MOCK_FILTERS_SCHEMA = [
  {
    id: "sex",
    label: "Sex",
    type: "select", // può essere 'select', 'number_range', ecc.
    options: ["female", "male"]
  },
  {
    id: "environment",
    label: "Environment",
    type: "select",
    options: ["marine", "brackish", "freshwater"]
  },
  {
    id: "length",
    label: "Body Length (mm)",
    type: "range", // Tipo speciale per i range numerici
    inputs: [
      { id: "minLength", label: "Min" },
      { id: "maxLength", label: "Max" }
    ]
  }
];

export const MOCK_TRAITS = [
  {
    id: "t1",
    name: "Prosomal shape",
    states: [
      { id: "s1", value: "rounded" },
      { id: "s2", value: "pointed" }
    ]
  },
  {
    id: "t2",
    name: "Urosome somites count",
    states: [
      { id: "s3", value: "3 somites" },
      { id: "s4", value: "4 somites" },
      { id: "s5", value: "5 somites" }
    ]
  }
];
