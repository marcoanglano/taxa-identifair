// LIBRARIES
import { Link } from "react-router-dom";

export default function Error() {
  return (
    <section style={{ textAlign: "center", marginTop: "3rem" }}>
      <h3 style={{ color: "var(--primary-color)", fontSize: "3rem" }}>404</h3>
      <p style={{ color: "var(--error-color)", textAlign: "center" }}>Ouch! It seems you drifted too far away!</p>
      → <Link to="/">Return to homepage</Link> ←
    </section>
  );
}