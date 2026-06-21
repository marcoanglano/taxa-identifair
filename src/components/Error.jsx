// ASSETS
import ErrorImage from "../assets/Error.png";

// LIB
import { Link } from "react-router-dom";

// STYLES
import "../styles/Error.css";


export default function ErrorComponent({ title, message, id }) {
    return (
         <div className="error-container" id={id}>
            <div className="error-left">
            <img src={ErrorImage} alt="Sheldon J. Plankton is really sad" />
            </div>
            <div className="error-right">
            <h3>{title}</h3>
            {id === "404" ? (
                <>
                    <p>Ouch! It seems you drifted too far away!</p>
                    → <Link to="/">Return to homepage</Link> ←
                </>
            ) : (
                <p>{message}</p>
            )}
            </div>
        </div>
    );
}
