import frozenDocument from "../../assets/genealogy-native.html?raw";
import hostOverride from "../../assets/genealogy-host-override.js?raw";

if (!frozenDocument.includes("</body>")) {
  throw new Error("Genealogy demo snapshot must contain a closing body tag.");
}

// Add a readable, separately versioned host extension without patching the plugin bundle.
export const nativeDocument = frozenDocument.replace(
  "</body>",
  `<script>${hostOverride.replace(/<\/script/gi, "<\\/script")}</script></body>`,
);
