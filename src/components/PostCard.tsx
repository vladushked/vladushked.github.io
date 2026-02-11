import { Clock } from "lucide-react";
import { Link } from "react-router";
import { Tag } from "./Tag";

interface PostCardProps {
  id: string;
  title: string;
  date: string;
  tags: string[];
  preview: string;
  readTime: string;
}

export function PostCard({ id, title, date, tags, preview, readTime }: PostCardProps) {
  return (
    <Link
      to={`/posts/${id}`}
      className="block border border-border rounded bg-white p-6 hover:border-foreground/20 transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono text-muted-foreground">{date}</span>
        <span className="text-muted-foreground">•</span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{readTime}</span>
        </div>
      </div>

      <h3 className="mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{preview}</p>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </Link>
  );
}
