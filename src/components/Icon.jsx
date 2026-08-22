// ========== IMPORTS ==========
// LIB
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";


export default function Icon({
    iconUrl = null,
    size = 48,
    color="currentColor",
    className = "",

    // Tooltip (optional)
    tooltipText = null,
    tooltipImage = null,
}) {

    // Initial settings
    const [isHovered, setIsHovered] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const iconRef = useRef(null);
    if (!iconUrl) return null;
    const hasTooltip = Boolean(tooltipText || tooltipImage);
    const updatePosition = () => {
    if (iconRef.current) {
            const rect = iconRef.current.getBoundingClientRect();
            const iconCenter = rect.left + rect.width / 2;
            setCoords({
                top: rect.top,
                left: iconCenter,
            });
        }
    };

    // Handlers
    const handleMouseEnter = () => {
        if (!hasTooltip) return;
        updatePosition();
        setIsHovered(true);
    };
    const handleMouseLeave = () => {
        if (hasTooltip) setIsHovered(false);
    };

    // Icon style
    const style = {
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        backgroundColor: color,
        display: "inline-block",
        verticalAlign: "middle",

        WebkitMaskImage: `url('${iconUrl}')`,
        maskImage: `url('${iconUrl}')`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
    };


    // RENDERING
    return (
        // === ICON ===
        <>
            <span
                ref={iconRef}
                className="icon-wrapper"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <span
                    className={`${className}-icon`.trim()}
                    style={style}
                    aria-hidden="true"
                />
            </span>
            
            {/* === TOOLTIP === */}
            {isHovered && hasTooltip && createPortal(
                <TooltipBox 
                    coords={coords} 
                    tooltipImage={tooltipImage} 
                    tooltipText={tooltipText} 
                />,
                document.body
            )}
        </>
    );
}


// Tooltip function & rendering
    function TooltipBox({ coords, tooltipImage, tooltipText }) {
        const tooltipRef = useRef(null);
        const [adjustedLeft, setAdjustedLeft] = useState(coords.left);

        useEffect(() => {
            if (tooltipRef.current) {
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const halfWidth = tooltipRect.width / 2;
            const padding = 12;
            const viewportWidth = window.innerWidth;

            let newLeft = coords.left;

            // Checks left and right boundaries
            if (coords.left - halfWidth < padding) { newLeft = halfWidth + padding; }
            else if (coords.left + halfWidth > viewportWidth - padding) { newLeft = viewportWidth - halfWidth - padding; }

            setAdjustedLeft(newLeft);
            }
        }, [coords.left]);

        return (
            <div
            ref={tooltipRef}
            className="fixed-tooltip-box"
            role="tooltip"
            style={{
                top: `${coords.top - 8}px`,
                left: `${adjustedLeft}px`,
            }}
            >
            {tooltipImage && (
                <img
                src={tooltipImage}
                alt={tooltipText || "Preview"}
                className="fixed-tooltip-img"
                />
            )}
            {tooltipText && (
                <span className="fixed-tooltip-text">{tooltipText}</span>
            )}
            </div>
        );
    }
