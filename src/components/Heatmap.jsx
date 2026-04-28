// ========== IMPORTS ==========
// LIB
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

// Helper function to get CSS variable values
const getCSSVar = (varName) => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
};


export default function HeatmapLayer({ points }) {
    const map = useMap();

    // Any error
    useEffect(() => {
        if (!map || !points || points.length === 0) return;

    
        // ========== HEATMAP LAYER ==========
        // Get CSS variables for colors, with fallbacks
        const color1 = getCSSVar('--prim-color-LL') || 'blue';
        const color2 = getCSSVar('--prim-color-LLL') || 'cyan';
        const color3 = getCSSVar('--sec-color-DD') || 'lime';
        const color4 = getCSSVar('--sec-color-D') || 'yellow';

        const heatLayer = L.heatLayer(points, {
            radius: 18,
            blur: 15,
            maxZoom: 5,
            gradient: { 0.4: color1, 0.6: color2, 0.7: color3, 1: color4 }
        }).addTo(map);

        return () => map.removeLayer(heatLayer);
    }, [map, points]);

    return null;
}
