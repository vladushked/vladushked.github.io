import { Link } from "react-router";
import { PlayCircle } from "lucide-react";
import type { PostDefinition } from "../content/posts";

type PostPreviewCardProps = {
  post: PostDefinition;
  filterTags: string[];
  onTagToggle: (tag: string) => void;
};

export function PostPreviewCard({ post, filterTags, onTagToggle }: PostPreviewCardProps) {
  const hasMedia = Boolean(post.previewMedia);
  const visibleTags = filterTags.filter((tag) => !isYearTag(tag));

  return (
    <article className={`post-preview-card ${hasMedia ? "post-preview-card-with-media" : ""}`}>
      <div className="post-preview-tags" aria-label="Теги поста">
        {visibleTags.map((tag) => (
          <button
            key={tag}
            type="button"
            className="post-preview-tag-button"
            onClick={() => onTagToggle(tag)}
          >
            <span className="post-preview-tag-text">
              {tag}
            </span>
          </button>
        ))}
      </div>

      <Link
        to={post.route}
        className="post-preview-link"
        aria-label={`Открыть материал "${post.meta.title}"`}
      >
        <div className="post-preview-copy">
          <p className="type-eyebrow">{post.meta.date}</p>
          <h2 className="post-preview-title">{post.meta.title}</h2>
          {post.previewText ? <p className="post-preview-excerpt">{post.previewText}</p> : null}
        </div>

        {post.previewMedia ? (
          <div className="post-preview-side">
            {renderPostPreviewMedia(post.previewMedia, post.meta.title, post.previewMediaThumbnail)}
          </div>
        ) : null}
      </Link>
    </article>
  );
}

function renderPostPreviewMedia(
  media: NonNullable<PostDefinition["previewMedia"]>,
  title: string,
  thumbnailUrl?: string,
) {
  if (thumbnailUrl) {
    return (
      <div className="post-preview-media-frame">
        <img src={thumbnailUrl} alt={media.alt ?? title} className="post-preview-image" />
        {media.kind === "video" ? (
          <span className="post-preview-video-overlay" aria-hidden="true">
            <PlayCircle size={32} strokeWidth={1.7} />
            <span className="post-preview-media-label">Видео</span>
          </span>
        ) : null}
      </div>
    );
  }

  if (media.kind === "image") {
    return (
      <div className="post-preview-media-frame">
        <img src={media.src} alt={media.alt ?? title} className="post-preview-image" />
      </div>
    );
  }

  return (
    <div className="post-preview-media-frame post-preview-video" aria-label={`Видео "${title}"`}>
      <PlayCircle size={32} strokeWidth={1.7} />
      <span className="post-preview-media-label">Видео</span>
    </div>
  );
}

function isYearTag(tag: string) {
  return /^\d{4}$/.test(tag);
}
