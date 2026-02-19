// LIBRARIES
import { NavLink } from "react-router-dom";

// STYLES
import "../styles/Navbar.css";

export default function Navbar() {
    return (
        <nav className="app-nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                Home
            </NavLink>

            <NavLink to="/species" end className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                Species List
            </NavLink>

            <NavLink to="/identify" end className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                Identify
            </NavLink>
        </nav>
    );
}
