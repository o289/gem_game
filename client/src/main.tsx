import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { GameConfigProvider } from "./context/GameConfigContext"

import App from "./App"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GameConfigProvider>
      <App />
    </GameConfigProvider>
  </StrictMode>
)