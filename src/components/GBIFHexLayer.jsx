// ##### IMPORTS #####
// LIB
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.vectorgrid";


// ##### SETTINGS #####
const hex_border = {
    color: "#005666",
    weight: 0.8,
    opacity: 0.85
}
const opacity = 1;
const main_col = "#00d9ff"
function getHexColor(total) {
    if (total > 1000) return main_col+"ff";
    if (total > 200)  return main_col+"cc";
    if (total > 50)   return main_col+"99";
    if (total > 10)   return main_col+"66";
    /* (total < 10)*/ return main_col+"33";
}
/*
function getHexColor(total) {
    if (total > 1000) return "#ff4d4d";
    if (total > 200)  return "#ff944d";
    if (total > 50)   return "#ffd11a";
    if (total > 10)   return "#70db70";
    return "#38bdf8";
}
*/


// ##### MAP BUILDING #####
export default function GbifHexLayer({ gbifOldID, hexPerTile = 35 }) {
    const map = useMap();
    useEffect(() => {
        if (!gbifOldID) return;
        const mvtUrl = `https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}.mvt?srs=EPSG:3857&taxonKey=${gbifOldID}&bin=hex&hexPerTile=${hexPerTile}`;

        const vectorLayer = L.vectorGrid.protobuf(mvtUrl, {
            rendererFactory: L.canvas.tile,
            interactive: true,
            getFeatureId: (f) => f.properties.total,
            vectorTileLayerStyles: {
                occurrence: (properties) => ({
                    fill: true,
                    fillColor: getHexColor(properties.total),
                    fillOpacity: opacity,
                    stroke: true,
                    color: hex_border.color,
                    weight: hex_border.weight,
                    opacity: hex_border.opacity
                })
            },
            attribution: "&copy; GBIF"
        });

        // Tooltip: count
        vectorLayer.on("click", (e) => {
            const count = e.layer?.properties?.total;
            if (count !== undefined) {
                L.popup()
                    .setLatLng(e.latlng)
                    .setContent(`<strong>Occurrences:</strong> ${count.toLocaleString()}`)
                    .openOn(map);
            }
        });
        vectorLayer.addTo(map);

        // Cleanup
        return () => { map.removeLayer(vectorLayer); };
    }, [map, gbifOldID, hexPerTile]);

    return null;
}
