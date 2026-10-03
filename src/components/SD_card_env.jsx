// From SUPABASE

// ##### PROPS #####
export default function SD_card_env({ environment }) {


    // ##### RENDERING #####
    return (
        <div className="card-section" id="env-section">
            <h5>Environment:</h5>
            <p>{environment?.join(', ') || "No environment data available."}</p>
        </div>
    );
}
