// ##### IMPORTS #####
// COMPONENTS
import Accordion from "./Accordion";
// LIB
import parse from "html-react-parser";


// ##### PROPS #####
export default function SD_card_ref({ gbifKey, customRef = [] }) {
    // Configuration
    const date = new Date().toLocaleDateString('it-IT');
    const year = new Date().getFullYear();
    // API References
    const refAPI = [
        `GBIF Secretariat (${year}). GBIF Backbone Taxonomy. Taxon key: ${gbifKey}. [via GBIF API, ${date}]`,
        `GBIF.org (${year}). GBIF Occurrence Density Maps (Tile Service). [${date}]`,
        `Razouls C., Desreumaux N., Kouwenberg J. and de Bovée F., 2005-${year}.
        Biodiversity of Marine Planktonic Copepods (morphology, geographical distribution and biological data).
        Sorbonne University, CNRS. [${date}]`
    ];
    const safeCustomRef = Array.isArray(customRef) ? customRef : [];


    // ##### BUILDING ACCORDION #####
    const accordionItems = [

        // # Drawings #
        ...(safeCustomRef.length > 0 ? [{
            id: "ref-drawings",
            title: "References (Drawings)",
            content: (
                <ul className="ref-sublist">
                    {safeCustomRef.map((ref, i) => ( <li key={i}>{parse(ref.citation || "")}</li> ))}
                </ul>
            )
        }] : []),

        // # API #
        {
            id: "ref-databases",
            title: "References (Data)",
            content: (
                <ul className="ref-sublist">
                    {refAPI.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
            )
        }
    ];


    // ##### RENDERING #####
    return (
        <div className="card-section" id="ref-section">
            <Accordion items={accordionItems} singleOpen={false} defaultAllOpen={false} />
        </div>
    );
}
