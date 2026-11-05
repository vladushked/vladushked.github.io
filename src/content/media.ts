import {
  normalizeOptionalField,
  sanitizeHref,
  splitField,
} from "./sharedMarkdown";

export type PostMediaBlock = {
  type: "media";
  kind: "image" | "video";
  src: string;
  preview?: string;
  alt?: string;
  caption?: string;
};

export function parseMediaDirective(
  lines: string[],
  slug: string,
  context = "Post",
): PostMediaBlock {
  let kind = "";
  let src = "";
  let preview = "";
  let alt = "";
  let caption = "";

  for (const rawLine of lines) {
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      continue;
    }

    const field = splitField(trimmedLine, context, slug, "media");

    if (field.key === "kind") {
      kind = field.value;
      continue;
    }

    if (field.key === "src") {
      const safeHref = sanitizeHref(field.value);

      if (!safeHref) {
        throw new Error(
          `${context} "${slug}" media has unsupported src "${field.value}".`,
        );
      }

      src = safeHref;
      continue;
    }

    if (field.key === "preview") {
      const safeHref = sanitizeHref(field.value);

      if (!safeHref) {
        throw new Error(
          `${context} "${slug}" media has unsupported preview "${field.value}".`,
        );
      }

      preview = safeHref;
      continue;
    }

    if (field.key === "alt") {
      alt = field.value;
      continue;
    }

    if (field.key === "caption") {
      caption = field.value;
      continue;
    }

    throw new Error(
      `${context} "${slug}" "::media" does not support field "${field.key}".`,
    );
  }

  if (!isMediaKind(kind) || !src) {
    throw new Error(
      `${context} "${slug}" "::media" requires valid "kind" and "src".`,
    );
  }

  if (preview && kind !== "video") {
    throw new Error(
      `${context} "${slug}" "::media" field "preview" is only supported for videos.`,
    );
  }

  return {
    type: "media",
    kind,
    src,
    preview: normalizeOptionalField(preview),
    alt: normalizeOptionalField(alt),
    caption: normalizeOptionalField(caption),
  };
}

function isMediaKind(value: string): value is PostMediaBlock["kind"] {
  return value === "image" || value === "video";
}
