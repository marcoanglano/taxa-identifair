// ##### IMPORTS #####
// COMPONENTS
import Accordion from "../components/Accordion.jsx";
import ErrorComponent from "../components/Error.jsx";
import Icon from "../components/Icon.jsx";
import Skeleton from "../components/Skeleton.jsx";
// LIB
import { Link } from "react-router-dom";


// ##### SETTING CONTENT #####
// Test icon, test picture and test details
const iconList = [
    {size: 24, text: "24px, default color.", color: "black"},
    {size: 48, text: "48px (default), error color.", color: "var(--error-color)"},
    {size: 96, text: "96px, male color.", color: "var(--male-color)"},
    {size: 192, text: "192px, female color.", color: "var(--female-color)"}
]
const iconUrl = "https://fraywmircvjqozsywdfx.supabase.co/storage/v1/object/public/icons/i_TEST.svg";
const descUrl = "https://fraywmircvjqozsywdfx.supabase.co/storage/v1/object/public/species/TEST_0211.svg";
const tooltipText = "This is a test tooltip text.";
// Test accordions
const accContent = [
    { id: "1", title: "Accordion 1", content: "Test content 1"},
    { id: "2", title: "Accordion 2", content: "Test content 2"}
];
// Test root
const rootColors = [
    "--prim-color", "--prim-color-L", "--prim-color-LL", "--prim-color-LLL",
    "--sec-color-DD", "--sec-color-D", "--sec-color"
]
const rootBright = ["none", "--low", "--bright", "--brighter"]
const rootShadow = ["--shadow", "--contrast"]


// ##### RENDERING #####
export default function SpeciesList() {
    return (
        <section id="test-container" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Text */}
            <div className="test-subcontainer" id="test-text">
                <h1 className="test-no-margin">Testing h1</h1>
                <h2 className="test-no-margin">Testing h2</h2>
                <h3 className="test-no-margin">Testing h3</h3>
                <h4 className="test-no-margin">Testing h4</h4>
                <h5 className="test-no-margin">Testing h5</h5>
            </div>

            {/* Links */}
            <div className="test-subcontainer" id ="test-links">
                <p className="test-no-margin">
                    <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">External link</a>
                </p>
                <p className="test-no-margin"><Link to="/test">Internal link</Link></p>
            </div>

            {/* Icons & Tooltips */}
            <div className="test-subcontainer" id="test-icons-tooltips">
                {iconList.map(ic => (
                    <Icon
                        iconUrl={iconUrl}
                        size={ic.size}
                        color={ic.color}
                        tooltipText={`${ic.text} ${tooltipText}`}
                        tooltipImage={descUrl}
                    />
                ))}
            </div>

            {/* Accordions */}
            <div className="test-subcontainer" id="test-accordions">
                <Accordion items={accContent} />
            </div>

            {/* Error & Skeleton */}
            <div className="test-subcontainer" id="test-error-skeleton">
                <div className="test-subcontainer" id="test-error">
                    <ErrorComponent title="404(?)" message="Test message, not a true error" />
                </div>
                <div className="test-subcontainer" id="test-skeleton">
                    <Skeleton count={5} height="50px" />
                </div>
            </div>

            {/* :root variables */}
            <div className="test-subcontainer" id="test-root">
                {rootColors.map(r => (
                    <div className="test-square" style={{ backgroundColor: `var(${r})` }}></div>
                ))}
                <br></br>
                {rootBright.map(r => ( <>
                    {r == "none"
                        ? <div className="test-square test-bright"></div>
                        : <div className="test-square test-bright" style={{ filter: `brightness(var(${r}))` }}></div>}
                </> ))}
                <br></br>
                {rootShadow.map(r => ( 
                    <div className="test-square test-shadow" style={{ filter: `drop-shadow(var(${r}))` }}></div>
                 ))}
            </div>

            {/* Buttons */}
            <div className="test-subcontainer" id="test-buttons">
                <button className="state-btn">Test</button>
                <button className="badge-active">Test</button>
            </div>

        </section>
    );
}
