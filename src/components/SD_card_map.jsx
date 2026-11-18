// SOFT DEPENDENCY: GBIF dependant

// ##### IMPORTS #####
// COMPONENTS
import { MapContainer, TileLayer } from "react-leaflet";
import GbifHexLayer from "./GBIFHexLayer";
// MAP STYLE
import 'leaflet/dist/leaflet.css';


// ##### MAP CONFIGURATION #####
const URL_MAP = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
const ATTR_MAP = "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"

export default function SD_card_map({ gbifOldID }) {


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
                    <GbifHexLayer gbifOldID={gbifOldID} hexPerTile={35} />
                </MapContainer>
            </div>
        </div>
    );
}
