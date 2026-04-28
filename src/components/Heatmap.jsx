// ========== IMPORTS ==========
// LIB
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";


export default function HeatmapLayer({ points }) {
    const map = useMap();

    // Any error
    useEffect(() => {
        if (!map || !points || points.length === 0) return;

    
        // ========== HEATMAP LAYER ==========
        const heatLayer = L.heatLayer(points, {
            radius: 18,
            blur: 15,
            maxZoom: 5,
            gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 1: 'yellow' }
        }).addTo(map);

        return () => map.removeLayer(heatLayer);
    }, [map, points]);

    return null;
}
