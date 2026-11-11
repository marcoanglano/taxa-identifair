// ##### IMPORTS #####
// LIB
import { Link } from "react-router-dom";
// VERSION
import { author, title, subtitle, version } from "/package.json";

export default function Footer({ releaseInfo }) {


    // ##### FALLBACK VALUES & FUNCTIONS #####
    const datasetVersion = releaseInfo?.dataset_version || "1.0.0";
    const doi = releaseInfo?.doi || "10.6084/m9.figshare.34956271";
    const releaseDate = releaseInfo?.release_date
        ? new Date(releaseInfo.release_date).toLocaleDateString("it-IT", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
        : "Nov 2026";
    function copyContact() {
        navigator.clipboard
        .writeText(author.email)
        .then(() => alert("Email copied to clipboard!"))
        .catch((err) => console.error("Failed to copy contact email:", err));
    }


    // ##### RENDERING #####
    return (
        <footer id="app-footer">
            <div className="footer-content">
                
                {/* 1: VERSIONING & FAIR DATASET */}
                <div className="footer-col">
                    <h5 className="footer-title">🤝 FAIR Dataset Info</h5>
                    <p className="footer-item"><strong>App Version:</strong> v{version}</p>
                    <p className="footer-item"><strong>Dataset Version:</strong> v{datasetVersion} ({releaseDate})</p>
                    {doi && (
                        <p className="footer-item">
                            <strong>DOI:</strong>{" "}
                            <a
                                href={`https://doi.org/${doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="footer-link"
                            >
                                {doi}
                            </a>
                        </p>
                    )}
                </div>

                {/* 2: LICENSES & OPEN SCIENCE */}
                <div className="footer-col">
                    <h5 className="footer-title">©️ Licenses & Open Science</h5>
                    <p className="footer-item">
                        Code License:{" "}
                        <a
                        href="https://opensource.org/licenses/MIT"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                        >
                        MIT
                        </a>
                    </p>
                    <p className="footer-item">
                        Data License:{" "}
                        <a
                        href="https://creativecommons.org/licenses/by/4.0/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                        >
                        CC BY 4.0
                        </a>
                    </p>
                    {/* <p className="footer-item">
                        Standard:{" "}
                        <a
                        href="https://dwc.tdwg.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                        >
                        Darwin Core compliant
                        </a>
                    </p> */}
                </div>

                {/* 3: AUTHORS & CONTACTS */}
                <div className="footer-col">
                    <h5 className="footer-title">✉️ Authors & Contacts</h5>
                    <p className="footer-item">
                        {author.name}{" "}
                        {author.url && (
                        <a
                            href={author.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-link"
                            title="ORCID Profile"
                        >
                            (ORCID)
                        </a>
                        )}
                    </p>
                    <p className="footer-item">
                        Contact:{" "}
                        <span id="copy-contact" onClick={copyContact} role="button" title="Click to copy email">
                            {author.email}
                        </span>
                    </p>
                </div>

                {/* 4: CHANGELOG */}
                <div className="footer-col">
                    <h5 className="footer-title">🕗 Changelog</h5>
                    <p className="footer-item">
                        Check the full changelog for this app{" "}
                        <Link to="/changelog" className="footer-link-highlight">HERE</Link>.
                    </p>
                </div>
            </div>

            {/* COPYRIGHT */}
            <div className="footer-bottom">
                <p id="footer-text"><b>{title}: {subtitle}.</b> v{version} © {author.name}, 2025-{new Date().getFullYear()}.</p>
            </div>
        </footer>
    );
}
