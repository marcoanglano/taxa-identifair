// SOFT DEPENDENCY: GBIF dependant

// ##### IMPORTS #####
// LIB
import { MapContainer, TileLayer } from "react-leaflet";
// MAP STYLE
import 'leaflet/dist/leaflet.css';


// ##### MAP CONFIGURATION #####
const URL_MAP = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
const ATTR_MAP = "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
const ATTR_OCCURR = "&copy; GBIF"


// ##### PROPS #####
export default function SD_card_map({ gbifKey }) {
    const urlOccurr = `https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@4x.png?srs=EPSG:3857&taxonKey=${gbifKey}&bin=hex&hexPerTile=117&style=blue.marker`


    // ##### RENDERING #####
    return (
        <div className="card-section" id="map-section">
            <h5>Occurrences:</h5>
            <div id="map-div">
                <MapContainer
                    id="map-container"
                    center={{ lat: 0, lng: 0 }}
                    maxBounds={[[-90, -180], [90, 180]]}
                    maxBoundsViscosity={1.0}
                    scrollWheelZoom={true}
                    worldCopyJump={true}
                    zoom={1}
                    minZoom={1}
                >
                    <TileLayer className="tile-map" url={URL_MAP} attribution={ATTR_MAP} />
                    <TileLayer className="tile-occurr" url={urlOccurr} attribution={ATTR_OCCURR} />
                </MapContainer>
            </div>
        </div>
    );
}
