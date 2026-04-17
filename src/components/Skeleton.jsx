// src/components/Skeleton.jsx
import "../styles/Skeleton.css";

export default function Skeleton({ 
    width, 
    height, 
    circle = false,
    count = 1, 
    className = "", 
    id = "", 
    margin,
    padding
}) {

    // ===== Wrapper style =====
    const wrapperStyle = {
        width: width || "100%",
        height: height,
        margin: margin,
        padding: padding,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
    };

    // ===== Inner style =====
    const innerStyle = {
        width: "100%",
        height: height || "20px",
        borderRadius: circle ? "50%" : "8px",
        flexShrink: 0,
        flex: 1,
    };

    // ========== RENDERING ==========
    return [...Array(count)].map((_, i) => (
        <div 
                key={i}
                id={id} 
                className={className} 
                style={wrapperStyle}
        >
            <div className="skeleton" style={innerStyle}></div>
        </div>
    ));
}
