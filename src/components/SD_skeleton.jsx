export default function SD_skeleton({ type, count = 1 }) {
    const renderSkeleton = () => {
        switch (type) {


        // ========== LEFT COLUMN ==========

        // ===== TITLE =====
        case 'title':
            return <div className="skeleton sk-title"></div>;

        // ===== LOGOS =====
        case 'logo':
            return (
            <div className="sk-logos">
                {[...Array(count)].map((_, i) => (
                <div key={i} className="skeleton sk-logo"></div>
                ))}
            </div>
            );

        // ===== CARDS =====
        case 'card':
            return (
            <div className="sk-card-container">
                {[...Array(count)].map((_, i) => (
                <div key={i} className="skeleton sk-card"></div>
                ))}
            </div>
            );


        // ========== RIGHT COLUMN ==========

        // ===== LEGEND =====
        case 'legend':
            return <div className="skeleton sk-legend"></div>;

        // ===== BARS =====
        case 'bars':
            return <div className="skeleton sk-bars"></div>;

        // ===== TRAITS =====
        case 'trait_accordion':
            return [...Array(count)].map((_, i) => (
            <div key={i} className="skeleton sk-trait"></div>
            ));

        // Default
        default:
            return <div className="skeleton"></div>;
        }
    };

    return renderSkeleton();
}
