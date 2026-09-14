// SOFT DEPENDENCY: GBIF dependant

// ##### IMPORTS #####
// LIB
import { MapContainer, TileLayer } from "react-leaflet";
// UTILS
import { formatScientificName } from "../utils/speciesHelpers.jsx";
// MAP STYLE
import 'leaflet/dist/leaflet.css';


// ##### PROPS #####
export default function SD_cards({
    id,
    title,

    gbifKey,        // from GBIF (number)
    basionym,       // from GBIF (string)
    synonyms,       // from GBIF (array of strings)
    taxonomy,       // from GBIF {kingdom, phylum, class, order, family, genus}
    environment,    // from SUPABASE {marine, brackish, freshwater}
}) {


    // ##### VARIABLES #####
    const hasNomenclature = basionym || (synonyms && synonyms.length > 0);
    const date = new Date().toLocaleDateString('it-IT');
    const year = new Date().getFullYear();
    // Maps
    const urlMap = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
    const attrMap = "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
    const urlOccurr = `https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@4x.png?srs=EPSG:3857&taxonKey=${gbifKey}&bin=hex&hexPerTile=117&style=blue.marker`
    const attrOccurr = "&copy; GBIF"
    // References
    const ref = [
        `GBIF Secretariat (${year}). GBIF Backbone Taxonomy. Taxon key: ${gbifKey}. [via GBIF API, ${date}]`,
        `GBIF.org (${year}). GBIF Occurrence Density Maps (Tile Service). [${date}]`,
        `Razouls C., Desreumaux N., Kouwenberg J. and de Bovée F., 2005-${year}.
        Biodiversity of Marine Planktonic Copepods (morphology, geographical distribution and biological data).
        Sorbonne University, CNRS. [${date}]`
    ]


    // ##### RENDERING #####
    return (
        // Hide title if synonym/basionym card
        <div className="card-section" id={id}>
            { id !== "syn-bas-section" && (
                <h5>{title}:</h5>
            )}

            {/* ### BASIONYM & SYNONYMS ### */}
            { id === "syn-bas-section" && ( <>
                {!hasNomenclature ? (
                    <p id="no-nomenclature">No basionym/synonyms found.</p>
                ) : (
                    <ul id="syn-bas">
                        {/* Basionym */}
                        {basionym && ( <li className="bas">≡ {formatScientificName(basionym)}</li> )}
                        {/* Synonyms */}
                        {synonyms && synonyms
                            .filter(syn => syn !== basionym)
                            .map((syn, i) => ( <li key={i} className="syn">= {formatScientificName(syn)}</li> ))
                        }
                    </ul>
                )}
            </> )}
            
            {/* ### TAXONOMY ### */}
            { id === "taxonomy-section" && taxonomy && (
                <p>
                    {Object.entries(taxonomy).map(([rank, value], i) => (
                        value && (
                            <span key={rank}>
                                {i > 0 && " > "}
                                {rank === "genus" ? <em>{value}</em> : value}
                            </span>
                        )
                    ))}
                </p>
            )}

            {/* ### ENVIRONMENT ### */}
            { id === "env-section" && ( <p>{environment?.join(', ')}</p> )}

            {/* ### OCCURRENCES ### */}
            { id === "map-section" && (
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
                        <TileLayer className="tile-map" url={urlMap} attribution={attrMap} />
                        <TileLayer className="tile-occurr" url={urlOccurr} attribution={attrOccurr} />
                    </MapContainer>
                </div>
            )}

            {/* ### REFERENCES ### */}
            { id === "ref-section" && (
                <ul id="ref-list">
                    {ref.map(r => ( <li>{r}</li> ))}
                </ul>
            )}
        </div>
    );
}
