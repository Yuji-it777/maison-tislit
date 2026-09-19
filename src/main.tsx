import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

// Fonts now use onload attribute in HTML, no manual swap needed

// Defer Three.js silk particle background so it doesn't block initial render.
// Skip entirely for users who prefer reduced motion (saves CPU/GPU + a11y).
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      import("./silkParticles").then((m) => m.initSilkParticles());
    });
  } else {
    setTimeout(() => {
      import("./silkParticles").then((m) => m.initSilkParticles());
    }, 1000);
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Remove the static hero placeholder once React has rendered the real one
requestAnimationFrame(() => {
  const staticHero = document.getElementById("static-hero");
  if (staticHero) staticHero.remove();
});
