// ========== IMPORTS ==========
import { formatLength } from "../utils/speciesHelpers.jsx";

export default function SD_length({ data }) {



    // ========== RENDERING ==========
    const hasData = data.fMean !== null || data.mMean !== null;

    return (
        <div className="SUP" id="length-section">
            <h5>Total length (mm):</h5>
            {hasData ? ( <>
                <div id="bar-bg">

                    {/* Female Bar */}
                    {data.fMean !== null &&
                    <p>
                        <span className="bar bordered" id="f-bar" style={{ width: `${data.fMean / 15 * 100}%` }}></span>
                        {formatLength(data.fMin, data.fMax)}
                    </p>
                    }

                    {/* Male Bar */}
                    {data.mMean !== null &&
                    <p>
                        <span className="bar bordered" id="m-bar" style={{ width: `${data.mMean / 15 * 100}%` }}></span>
                        {formatLength(data.mMin, data.mMax)}
                    </p>
                    }
                </div>

                {/* Scale Bar */}
                <div className="scale-line" id="scale-bar">
                    <span className="scale-seg">5</span>
                    <span className="scale-seg">10</span>
                    <span className="scale-seg">15</span>
                </div>
            </> ) : (

                // No data available
                <p>No data available for this species.</p>
            )}
        </div>
    );
}
