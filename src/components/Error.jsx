// ##### IMPORTS #####
// ASSETS
import ErrorImage from "../assets/Error.png";
// LIB
import { Link } from "react-router-dom";

export default function ErrorComponent({ title, message, id }) {


    // ##### RENDERING #####
    return (
         <div className="error-container" id={id}>

            {/* Error Image */}
            <div className="error-left">
                <img src={ErrorImage} alt="Sheldon J. Plankton is really sad..." />
            </div>

            {/* Error Text */}
            <div className="error-right">
            <h1>{title}</h1>
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
