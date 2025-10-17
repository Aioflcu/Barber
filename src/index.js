import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { register as registerServiceWorker } from './serviceWorkerRegistration';
const root = createRoot(document.getElementById("root"));
root.render(<App />);

// register PWA service worker
registerServiceWorker();
