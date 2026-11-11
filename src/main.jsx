// ##### IMPORTS #####
// LIB
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
// PAGES
import App from "./App.jsx"
// STYLES
import "./styles/index.css"


// ##### Application Entry Point #####
// Mounts the React root component wrapped in StrictMode and BrowserRouter for HTML5 routing.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
