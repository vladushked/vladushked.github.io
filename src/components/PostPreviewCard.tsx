import { Link } from "react-router";
import { PlayCircle } from "lucide-react";
import type { PostDefinition } from "../content/posts";

type PostPreviewCardProps = {
  post: PostDefinition;
};

export function PostPreviewCard({ post }: PostPreviewCardProps) {
  const hasMedia = Boolean(post.previewMedia);
  const showMetadata = post.meta.section === "blog";

  return (
    <Link
      to={post.route}
      className={`post-preview-card ${hasMedia ? "post-preview-card-with-media" : ""}`}
      aria-label={`Открыть материал "${post.meta.title}"`}
    >
      <div className="post-preview-copy">
        {showMetadata ? (
          <div className="post-tag-list">
            {post.meta.tags.map((tag) => (
              <span key={tag} className="post-tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <p className="type-eyebrow">{showMetadata ? post.meta.date : "/projects"}</p>
        <h2 className="post-preview-title">{post.meta.title}</h2>
        {post.previewText ? <p className="post-preview-excerpt">{post.previewText}</p> : null}
      </div>

      {post.previewMedia ? (
        <div className="post-preview-side">
          {renderPostPreviewMedia(post.previewMedia, post.meta.title, post.previewMediaThumbnail)}
        </div>
      ) : null}
    </Link>
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
