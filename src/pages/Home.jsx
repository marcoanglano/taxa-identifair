// TO DO [CHANGELOG]: display latest update. Link to full changelog in footer.

export default function Home() {
  return (
    <section className="home-page">
      {/* WELCOME */}
      <h2>Home</h2>
      <h3>Welcome to ZPid!</h3>
      <p style={{ textAlign: "justify" }}>
        This is an interactive tool for identifying adult Calanoida (Copepoda), 
        a key component of the zooplankton. Use the navigation links above to explore the 
        species list or start identifying your specimen.
      </p>
    </section>
  )
}
