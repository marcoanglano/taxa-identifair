// ##### IMPORTS #####
// LIB
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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

    // Handlers (Desktop)
    const handleMouseEnter = () => {
        if (!hasTooltip) return;
        updatePosition();
        setIsHovered(true);
    };
    const handleMouseLeave = () => {
        if (hasTooltip) setIsHovered(false);
    };

    // Handlers (Mobile)
    const handleTouchStart = (e) => {
        if (!hasTooltip) return;
        e.stopPropagation();
        updatePosition();
        setIsHovered((prev) => !prev);
    };
    const handleClick = (e) => {
        if (hasTooltip && window.matchMedia("(max-width: 768px)").matches) {
            e.stopPropagation();
        }
    };

    useEffect(() => {
        if (!isHovered) return;
        const handleOutsideTouch = (e) => {
            if (iconRef.current && !iconRef.current.contains(e.target)) {
                setIsHovered(false);
            }
        };
        window.addEventListener("touchstart", handleOutsideTouch);
        return () => window.removeEventListener("touchstart", handleOutsideTouch);
    }, [isHovered]);

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
                onTouchStart={handleTouchStart}
                onClick={handleClick}
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
        const [stylePos, setStylePos] = useState({
            top: 0,
            left: 0,
            visibility: "hidden",
        });

        const recalculatePosition = useCallback(() => {
            if (!tooltipRef.current) return;

            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const tooltipWidth = tooltipRect.width;
            const tooltipHeight = tooltipRect.height;

            const padding = 12;
            const gap = 8;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Horizontal
            let leftPos = coords.left - tooltipWidth / 2;
            if (viewportWidth > 768) {
                if (leftPos < padding) {
                    leftPos = padding;
                } else if (leftPos + tooltipWidth > viewportWidth - padding) {
                    leftPos = viewportWidth - padding - tooltipWidth;
                }
            }
            
            // Vertical
            let topPos = coords.top - tooltipHeight - gap;
            if (topPos < padding) {
                topPos = padding;
            } else if (topPos + tooltipHeight > viewportHeight - padding) {
                topPos = viewportHeight - padding - tooltipHeight;
            }

            setStylePos({
                top: `${topPos}px`,
                left: `${leftPos}px`,
                visibility: "visible",
            });
        }, [coords]);

        useLayoutEffect(() => {
            recalculatePosition();
        }, [recalculatePosition]);

        useEffect(() => {
            if (!tooltipRef.current) return;
            const resizeObserver = new ResizeObserver(() => {
                recalculatePosition();
            });
            resizeObserver.observe(tooltipRef.current);
            return () => resizeObserver.disconnect();
        }, [recalculatePosition]);

        return (
            <div
                ref={tooltipRef}
                className="fixed-tooltip-box"
                role="tooltip"
                style={{
                    top: stylePos.top,
                    left: stylePos.left,
                    visibility: stylePos.visibility,
                }}
            >
                {tooltipImage && (
                    <img
                    src={tooltipImage}
                    alt={tooltipText || "Preview"}
                    className="fixed-tooltip-img"
                    onLoad={recalculatePosition}
                    />
                )}
                {tooltipText && (
                    <span className="fixed-tooltip-text">{tooltipText}</span>
                )}
            </div>
        );
    }
