
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

const analyticsToken = import.meta.env.VITE_CF_WEB_ANALYTICS_TOKEN?.trim();
if (
  import.meta.env.PROD &&
  window.location.hostname === "vladislavplotnikov.ru" &&
  analyticsToken &&
  !document.querySelector('script[src^="https://static.cloudflareinsights.com/beacon.min.js"]')
) {
  const script = document.createElement("script");
  script.type = "module";
  script.src = "https://static.cloudflareinsights.com/beacon.min.js";
  script.dataset.cfBeacon = JSON.stringify({ token: analyticsToken });
  document.body.append(script);
}
