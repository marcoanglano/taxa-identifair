// SOFT DEPENDENCY: GBIF dependant

// ========== IMPORTS ==========
// COMPONENTS
import { MapContainer, TileLayer } from "react-leaflet";
import Error from "./Error";
import HeatmapLayer from "./Heatmap";
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

    basionym,       // from GBIF (string)
    synonyms,       // from GBIF (array of strings)
    taxonomy,       // from GBIF {kingdom, phylum, class, order, family, genus}
    occurrences,    // from GBIF (array of occurrence data)
    environment     // from SUPABASE {marine, brackish, freshwater}
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
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            className="custom-map-tiles"
                            attribution='&copy; GBIF'
                        />
                        <HeatmapLayer points={occurrences} />
                    </MapContainer>
                </div>
            )}

            {/* ===== TEST ===== */}
            { id === "test-section" && (
                <p>{content}</p>
            )}
        </div>
    );
}
