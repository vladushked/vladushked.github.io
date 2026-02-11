import { ExternalLink, Github } from "lucide-react";
import { Tag } from "./Tag";

interface ProjectCardProps {
  title: string;
  description: string;
  role: string;
  techStack: string[];
  repoUrl?: string;
  demoUrl?: string;
  category: "work" | "underwater";
}

export function ProjectCard({
  title,
  description,
  role,
  techStack,
  repoUrl,
  demoUrl,
}: ProjectCardProps) {
  return (
    <div className="border border-border rounded bg-white p-6 hover:border-foreground/20 transition-all">
      <h3 className="mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      
      <div className="mb-4">
        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
          Role
        </div>
        <div className="text-sm">{role}</div>
      </div>

      <div className="mb-4">
        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Tech Stack
        </div>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-border">
        {repoUrl && (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm hover:text-[--mint] transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>Repository</span>
          </a>
        )}
        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm hover:text-[--mint] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Demo</span>
          </a>
        )}
      </div>
    </div>
  );
}
