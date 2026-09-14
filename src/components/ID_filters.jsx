/* ##### RENDERING ##### */
export default function ID_filters({ schema = [], values = {}, onChange }) {
  return (
    <div id="dynamic-filters-grid">
      {schema.map((filter) => {
        return (
          <div key={filter.id} className="filter-group">
            <label className="filter-label">{filter.label}</label>


            {/* ### SELECT-TYPE FILTERS ### */}
            {filter.type === "select" ? ( <>
              <select
                className="filter-select"
                value={values[filter.id] || ""}
                onChange={(e) => onChange(filter.id, e.target.value)}
              >
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </> )
            

            // ### RANGE-TYPE FILTERS ###
            : (<>
              <div className="range-inputs-container">
                {filter.inputs.map((input) => (
                  <input
                    key={input.id}
                    type="number"
                    step="0.1"
                    className="filter-input"
                    placeholder={input.placeholder || input.label}
                    value={values[input.id] || ""}
                    onChange={(e) => onChange(input.id, e.target.value)}
                  />
                ))}
              </div>
            </>)}

          </div>
        );
      })}
    </div>
  );
}
