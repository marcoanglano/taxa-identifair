// ##### IMPORTS #####
// LIB
import { NavLink } from "react-router-dom";


// ##### LIST OF LINKS #####
const linkList = [
    {icon: "⌂", name: "Home", path: "/"},               // Homepage
    {icon: "≡", name: "Species", path: "/species"},     // Species list by family
    {icon: "👁", name: "Identify", path: "/identify"},  // Interactive identification
]


// ##### RENDERING #####
export default function Navbar() {
    return (
        <nav className="app-nav nav-bg nav-bd" id="nav-container">
            {linkList.map((page) => {
                return (
                    
                    // Generates buttons for each link
                    <NavLink
                        key={page.name}
                        to={page.path}
                        end
                        className={({ isActive }) => isActive ? "nav-btn nav-active" : "nav-btn"}
                    >
                        <h2><span id="nav-icon">{page.icon}</span> {page.name}</h2>
                    </NavLink>

                )
            })}
        </nav>
    );
}
