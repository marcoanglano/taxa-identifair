export default function Home() {

  
  // ##### RENDERING #####
  return (
    <section>
      {/* WELCOME */}
      <h3>Home</h3>
      <h4>Welcome to Taxa IdentiFAIR!</h4>
      {/* TO DO: change text based on the taxon to be identified */}
      <p>This is an interactive tool for identifying adult Calanoida (Copepoda), a key component of the zooplankton.</p>
      <p>Use the navigation links above to explore the species list or start identifying your specimen.</p>

      {/* WORK IN PROGRESS */}
      <p style={{ color: "var(--error-color)", fontWeight: "bold" }}>TEST VERSION: WORK IN PROGRESS</p>
    </section>
  )
}
