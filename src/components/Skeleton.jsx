// ##### PROPS #####
export default function Skeleton({ 
    width,
    height,
    margin,
    padding,
    style,
    circle = false,
    count = 1,
    className = "",
    id = ""
}) {

    
    // ##### WRAPPER STYLE #####
    const wrapperStyle = {
        width: width || "100%",
        height: height,
        margin: margin,
        padding: padding,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        ...style
    };


    // ##### INNER STYLE #####
    const innerStyle = {
        width: "100%",
        height: height || "20px",
        borderRadius: style?.borderRadius !== undefined
            ? style.borderRadius
            : (circle ? "50%" : "8px"),
        flexShrink: 0,
        flex: 1,
    };

    
    // ##### RENDERING #####
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
