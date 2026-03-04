// IMAGES
import ErrorImage from "../assets/Error.png"

// LIBRARIES
import { Link } from "react-router-dom";

// STYLES
import "../styles/Error.css";

export default function Error() {
  return (
    <section>
      <div className="error-container">
        <div className="error-left">
          <img src={ErrorImage} alt="Sheldon J. Plankton is really sad"></img>
        </div>
        <div className="error-right">
          <h3>404</h3>
          <p>Ouch! It seems you drifted too far away!</p>
          → <Link to="/">Return to homepage</Link> ←
        </div>
      </div>
    </section>
  );
}
