export default function SD_links({ gbifUrl, wormsUrl, otherUrl }) {


    // ##### LINK DETAILS #####
    const sd_links = [
        {   // GBIF LINK
            link: gbifUrl, id: "gbif-logo", alt: "GBIF logo", src: "/gbif_logo.png",
            credits: "downloaded from https://www.gbif.org/logos"
        },
        {   // WORMS LINK
            link: wormsUrl, id: "worms-logo", alt: "WoRMS logo", src: "/worms_logo.png",
            credits: "Downloaded from https://www.marinespecies.org/images/layout/worms_logo.png, edited (color)"
        },
        {   // OTHER LINK
            link: otherUrl, id: "other-logo", alt: "MPC logo", src: "/mpc_logo.png",
            credits: `Marine Planktonic Copepods: Downloaded from https://www.obs-banyuls.fr/images/logo-OOB.gif,
            edited (Logo from Observatoire Océanologique de Banyuls-sur-Mer, text substituted with "MPC", colors)`
        },
    ]


    // ##### RENDERING #####
    return (
        <div id="species-logos">
            {sd_links.map((sd) =>
                sd.link ? (
                    <a
                        key={sd.id}
                        className="logo-button"
                        id={sd.id}
                        href={sd.link}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img className="logo" alt={sd.alt} src={sd.src} />
                    </a>
                ) : null
            )}
        </div>
    );
}
