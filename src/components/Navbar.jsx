// LIBRARIES
import { NavLink } from "react-router-dom";

// STYLES
import "../styles/Navbar.css";

export default function Navbar() {
    return (
        <nav className="app-nav nav-bg nav-bd">
            <NavLink
                to="/"
                end
                className={({ isActive }) => isActive ? "nav-btn nav-style active" : "nav-btn nav-style"}
            >
                Home
            </NavLink>

            <NavLink
                to="/species"
                end
                className={({ isActive }) => isActive ? "nav-btn nav-style active" : "nav-btn nav-style"}
            >
                Species List
            </NavLink>
            
            <NavLink
                to="/identify"
                end
                className={({ isActive }) => isActive ? "nav-btn nav-style active" : "nav-btn nav-style"}
            >
                Identify
            </NavLink>
        </nav>
    );
}
