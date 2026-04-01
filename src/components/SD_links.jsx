// LOGOS SOURCES:
//    - GBIF: downloaded from https://www.gbif.org/logos
//    - WoRMS: Downloaded from https://www.marinespecies.org/images/layout/worms_logo.png, edited (color)
//    - Marine Planktonic Copepods: Downloaded from https://www.obs-banyuls.fr/images/logo-OOB.gif,
//        edited (Logo from Observatoire Océanologique de Banyuls-sur-Mer, text substituted with "MPC", colors)

export default function SD_links({ gbifUrl, wormsUrl, razoulsUrl }) {
    return (
        <div id="species-logos">
            { gbifUrl && (
                <a className="logo-button" id="gbif-logo" href={gbifUrl} target="_blank" rel="noopener noreferrer">
                <img className="logo SUP" src="/gbif_logo.png" alt="GBIF logo" />
                </a>
            )}
            { wormsUrl && (
                <a className="logo-button" id="worms-logo" href={wormsUrl} target="_blank" rel="noopener noreferrer">
                <img className="logo SUP" src="/worms_logo.png" alt="WoRMS logo" />
                </a>
            )}
            { razoulsUrl && (
                <a className="logo-button" id="razouls-logo" href={razoulsUrl} target="_blank" rel="noopener noreferrer">
                <img className="logo SUP" src="/razouls_logo.png" alt="Razouls logo" />
                </a>
            )}
        </div>
    );
}
