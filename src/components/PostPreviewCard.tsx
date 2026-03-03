import { Link } from "react-router";
import type { PostDefinition } from "../content/posts";
import { renderPostPreviewMedia } from "./PostPage";

type PostPreviewCardProps = {
  post: PostDefinition;
};

export function PostPreviewCard({ post }: PostPreviewCardProps) {
  const hasMedia = Boolean(post.previewMedia);

  return (
    <Link
      to={post.route}
      className={`post-preview-card ${hasMedia ? "post-preview-card-with-media" : ""}`}
      aria-label={`Открыть пост "${post.meta.title}"`}
    >
      <div className="post-preview-copy">
        <div className="post-tag-list">
          {post.meta.tags.map((tag) => (
            <span key={tag} className="post-tag">
              {tag}
            </span>
          ))}
        </div>
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
  );
}
