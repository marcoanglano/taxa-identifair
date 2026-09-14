// ##### IMPORTS #####
// LIBRARIES
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
// PAGES
import App from "./App.jsx"
// STYLES
import "./styles/index.css"


// ##### ROOT RENDER #####
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
