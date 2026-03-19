import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const cardsDir = path.join(projectRoot, "src", "content", "cards");
const outputDir = path.join(projectRoot, "src", "content", "generated");
const outputFile = path.join(outputDir, "postVideoThumbnails.ts");
const vkUserAccessToken = process.env.VK_USER_ACCESS_TOKEN?.trim() ?? "";
const vkApiVersion = "5.199";
let hasWarnedAboutMissingVkToken = false;

const postFiles = (await getMarkdownFiles(cardsDir)).sort();
const manifest = {};

for (const filepath of postFiles) {
  const slug = path.basename(filepath, ".md");
  const source = await readFile(filepath, "utf8");
  const firstVideoMediaSrc = extractFirstVideoMediaSource(source);

  if (!firstVideoMediaSrc) {
    manifest[slug] = null;
    continue;
  }

  manifest[slug] = await resolveThumbnail(firstVideoMediaSrc);
}

await mkdir(outputDir, { recursive: true });
await writeFile(outputFile, renderManifest(manifest), "utf8");

async function getMarkdownFiles(rootDir) {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getMarkdownFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(entryPath);
    }
  }

  return files;
}

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
  const vkVideoReference = parseVkVideoReference(url);

  if (vkVideoReference) {
    return resolveVkThumbnail(vkVideoReference, url);
  }

  return resolveOpenGraphThumbnail(url);
}

async function resolveOpenGraphThumbnail(url) {
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

function parseVkVideoReference(rawUrl) {
  try {
    const parsedUrl = new URL(rawUrl);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (
      hostname !== "vk.com" &&
      hostname !== "www.vk.com" &&
      hostname !== "vkvideo.ru" &&
      hostname !== "www.vkvideo.ru"
    ) {
      return null;
    }

    const directVideoMatch = parsedUrl.pathname.match(/\/video(-?\d+)_(\d+)/i);

    if (directVideoMatch) {
      return {
        ownerId: directVideoMatch[1],
        videoId: directVideoMatch[2],
      };
    }

    if (parsedUrl.pathname === "/video_ext.php") {
      const ownerId = parsedUrl.searchParams.get("oid")?.trim();
      const videoId = parsedUrl.searchParams.get("id")?.trim();

      if (ownerId && /^-?\d+$/.test(ownerId) && videoId && /^\d+$/.test(videoId)) {
        return {
          ownerId,
          videoId,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function resolveVkThumbnail(reference, sourceUrl) {
  if (!vkUserAccessToken) {
    if (!hasWarnedAboutMissingVkToken) {
      warnThumbnailResolution(
        `Skipping VK video thumbnails because VK_USER_ACCESS_TOKEN is not set. Falling back to the default video preview.`,
      );
      hasWarnedAboutMissingVkToken = true;
    }

    return null;
  }

  const params = new URLSearchParams({
    access_token: vkUserAccessToken,
    videos: `${reference.ownerId}_${reference.videoId}`,
    v: vkApiVersion,
  });
  const endpoint = `https://api.vk.com/method/video.get?${params.toString()}`;

  let response;

  try {
    response = await fetch(endpoint, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; post-thumbnail-bot/1.0; +https://vladislavplotnikov.ru)",
      },
      redirect: "follow",
    });
  } catch (error) {
    warnThumbnailResolution(`VK API request failed for "${sourceUrl}": ${String(error)}`);
    return null;
  }

  if (!response.ok) {
    warnThumbnailResolution(`VK API responded with HTTP ${response.status} for "${sourceUrl}".`);
    return null;
  }

  let payload;

  try {
    payload = await response.json();
  } catch {
    warnThumbnailResolution(`VK API returned invalid JSON for "${sourceUrl}".`);
    return null;
  }

  if (payload?.error) {
    warnThumbnailResolution(
      `VK API error for "${sourceUrl}": ${payload.error.error_code ?? "unknown"} ${payload.error.error_msg ?? "unknown error"}`,
    );
    return null;
  }

  const images = payload?.response?.items?.[0]?.image;
  const thumbnailUrl = pickLargestVkImage(images);

  if (!thumbnailUrl) {
    return null;
  }

  try {
    return new URL(thumbnailUrl).toString();
  } catch {
    return null;
  }
}

function pickLargestVkImage(images) {
  if (!Array.isArray(images)) {
    return null;
  }

  const sorted = images
    .filter((image) => image && typeof image.url === "string")
    .sort((left, right) => {
      const leftArea = Number(left.width ?? 0) * Number(left.height ?? 0);
      const rightArea = Number(right.width ?? 0) * Number(right.height ?? 0);
      return rightArea - leftArea;
    });

  return sorted[0]?.url ?? null;
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

function warnThumbnailResolution(message) {
  console.warn(`[post-video-thumbnails] ${message}`);
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
