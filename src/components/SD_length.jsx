// ##### IMPORTS #####
import { formatLength } from "../utils/speciesHelpers.jsx";


// ##### RENDERING #####
export default function SD_length({ data }) {
    const hasData = data.fMean !== null || data.mMean !== null;
    return (
        <div id="length-section">
            <h5>Total length:</h5>

            {/* ### LENGTH BARS ### */}
            {hasData ? (<>
                <div id="bar-container">

                    {/* Female Bar */}
                    {data.fMean !== null &&
                    <p>
                        <span className="bar f" id="f-bar" style={{ width: `${data.fMean / 15 * 100}%` }}></span>
                        {formatLength(data.fMin, data.fMax)}
                    </p>
                    }

                    {/* Male Bar */}
                    {data.mMean !== null &&
                    <p>
                        <span className="bar m" id="m-bar" style={{ width: `${data.mMean / 15 * 100}%` }}></span>
                        {formatLength(data.mMin, data.mMax)}
                    </p>
                    }
                </div>

                {/* Scale Bar */}
                <div className="scale-line" id="scale-bar">
                    <span className="scale-seg first-seg">
                        <span className="scale-mm">mm</span>
                        <span>5</span>
                    </span>
                    <span className="scale-seg">10</span>
                    <span className="scale-seg">15</span>
                </div>
            </> ) : (

                // ### NO DATA ###
                <p>No data available for this species.</p>
            )}
        </div>
    );
}
