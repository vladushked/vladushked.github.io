import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const postsDir = path.join(projectRoot, "src", "content", "posts");
const outputDir = path.join(projectRoot, "src", "content", "generated");
const outputFile = path.join(outputDir, "postVideoThumbnails.ts");

const postFiles = (await readdir(postsDir)).filter((entry) => entry.endsWith(".md")).sort();
const manifest = {};

for (const filename of postFiles) {
  const slug = filename.slice(0, -3);
  const source = await readFile(path.join(postsDir, filename), "utf8");
  const firstVideoMediaSrc = extractFirstVideoMediaSource(source);

  if (!firstVideoMediaSrc) {
    manifest[slug] = null;
    continue;
  }

  manifest[slug] = await resolveThumbnail(firstVideoMediaSrc);
}

await mkdir(outputDir, { recursive: true });
await writeFile(outputFile, renderManifest(manifest), "utf8");

function extractFirstVideoMediaSource(source) {
  const normalized = source.replace(/\r\n/g, "\n");
  const mediaBlockPattern = /::media\s*\n([\s\S]*?)\n::/g;

  for (const match of normalized.matchAll(mediaBlockPattern)) {
    const body = match[1];
    const kind = matchDirectiveField(body, "kind");

    if (kind !== "video") {
      continue;
    }

    return matchDirectiveField(body, "src");
  }

  return null;
}

function matchDirectiveField(body, fieldName) {
  const fieldPattern = new RegExp(`^\\s*${escapeRegExp(fieldName)}:\\s*(.+)\\s*$`, "m");
  const match = body.match(fieldPattern);

  if (!match) {
    return null;
  }

  return stripMatchingQuotes(match[1].trim());
}

async function resolveThumbnail(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; post-thumbnail-bot/1.0; +https://vladislavplotnikov.ru)",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("text/html")) {
      return null;
    }

    const html = await response.text();
    const thumbnailUrl =
      extractMetaContent(html, "property", "og:image") ??
      extractMetaContent(html, "name", "twitter:image");

    if (!thumbnailUrl) {
      return null;
    }

    try {
      return new URL(thumbnailUrl, url).toString();
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

function extractMetaContent(html, attributeName, attributeValue) {
  const directPattern = new RegExp(
    `<meta[^>]*${attributeName}=["']${escapeRegExp(attributeValue)}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const reversePattern = new RegExp(
    `<meta[^>]*content=["']([^"']+)["'][^>]*${attributeName}=["']${escapeRegExp(attributeValue)}["'][^>]*>`,
    "i",
  );

  const directMatch = html.match(directPattern);

  if (directMatch?.[1]) {
    return decodeHtmlEntities(directMatch[1]);
  }

  const reverseMatch = html.match(reversePattern);

  if (reverseMatch?.[1]) {
    return decodeHtmlEntities(reverseMatch[1]);
  }

  return null;
}

function renderManifest(entries) {
  const lines = [
    "export const postVideoThumbnails: Record<string, string | null> = {",
    ...Object.entries(entries).map(([slug, value]) => `  ${JSON.stringify(slug)}: ${JSON.stringify(value)},`),
    "};",
    "",
  ];

  return lines.join("\n");
}

function stripMatchingQuotes(value) {
  if (value.length < 2) {
    return value;
  }

  const firstChar = value[0];
  const lastChar = value[value.length - 1];

  if ((firstChar === "\"" && lastChar === "\"") || (firstChar === "'" && lastChar === "'")) {
    return value.slice(1, -1);
  }

  return value;
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
