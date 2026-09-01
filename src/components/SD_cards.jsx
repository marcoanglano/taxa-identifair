// SOFT DEPENDENCY: GBIF dependant

// ========== IMPORTS ==========
// COMPONENTS
import { MapContainer, TileLayer } from "react-leaflet";
import ErrorComponent from "./Error";
import Skeleton from "./Skeleton";
// STYLES
import "leaflet/dist/leaflet.css";
// UTILS
import { formatScientificName } from "../utils/speciesHelpers.jsx";


// ========== PROPS ==========
export default function SD_cards({
    title,
    classname,
    id,
    content,

    gbifKey,         // from GBIF (number)
    basionym,       // from GBIF (string)
    synonyms,       // from GBIF (array of strings)
    taxonomy,       // from GBIF {kingdom, phylum, class, order, family, genus}
    environment,    // from SUPABASE {marine, brackish, freshwater}

    date = new Date().toLocaleDateString('it-IT'),
    year = new Date().getFullYear()
}) {

    // Check if nomenclatur data is available
    const hasNomenclature = basionym || (synonyms && synonyms.length > 0);


    
    // ========== RENDERING ==========
    return (
        <div className={classname} id={id}>
            { id !== "synbas-section" && (
                <h5>{title}:</h5>
            )}

            {/* ===== BASIONYM & SYNONYMS ===== */}
            { id === "synbas-section" && (
                <>
                    {!hasNomenclature ? (
                        <p id="no-nomenclature">No basionym/synonyms found</p>
                    ) : (
                        <ul id="syn-bas">
                            {/* Basionym */}
                            {basionym && ( <li className="bas">≡ {formatScientificName(basionym)}</li> )}
                            {/* Synonyms */}
                            {synonyms && synonyms
                                .filter(syn => syn !== basionym)
                                .map((syn, index) => (
                                    <li key={index} className="syn">= {formatScientificName(syn)}</li>
                                )
                            )}
                        </ul>
                    )}
                </>
            )}
            
            {/* ===== TAXONOMY ===== */}
            { id === "taxonomy-section" && (
                <p>{taxonomy?.kingdom} &gt; {taxonomy?.phylum} &gt; {taxonomy?.class} &gt; {taxonomy?.order} &gt; {taxonomy?.family} &gt; <em>{taxonomy?.genus}</em></p>
            )}

            {/* ===== ENVIRONMENT ===== */}
            { id === "env-section" && (
                <p>{environment?.join(', ')}</p>
            )}

            {/* ===== OCCURRENCES ===== */}
            { id === "map-section" && (
                <div className="map-bd" id="map-div">
                    <MapContainer
                        className="map-bg"
                        id="map-container"
                        center={{ lat: 0, lng: 0 }}
                        maxBounds={[[-90, -180], [90, 180]]}
                        maxBoundsViscosity={1.0}
                        scrollWheelZoom={true}
                        worldCopyJump={true}
                        zoom={1}
                        minZoom={1}
                    >
                        <TileLayer // 1. MAP
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                            className="custom-map-tiles"
                            attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
                        />
                        <TileLayer // 2. OCCURRENCES
                            url={`https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?srs=EPSG:3857&taxonKey=${gbifKey}&bin=hex&hexPerTile=117&style=blue.marker`}
                            attribution='&copy; GBIF'
                        />
                    </MapContainer>
                </div>
            )}

            {/* ===== REFERENCES ===== */}
            { id === "ref-section" && (
                <ul id="ref-list">
                    <li>GBIF Secretariat ({year}). GBIF Backbone Taxonomy. Taxon key: {gbifKey}. 
                        [via GBIF API, {date}]</li>
                    <li>GBIF.org ({year}). GBIF Occurrence Density Maps (Tile Service). [{date}]</li>
                    <li>Razouls C., Desreumaux N., Kouwenberg J. and de Bovée F., 2005-{year}.
                        Biodiversity of Marine Planktonic Copepods (morphology, geographical distribution and biological data).
                        Sorbonne University, CNRS. [{date}]</li>
                </ul>
            )}
        </div>
    );
}
