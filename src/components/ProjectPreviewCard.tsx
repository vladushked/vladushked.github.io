import { Link } from "react-router";
import type { ProjectDefinition } from "../content/projects";

type ProjectPreviewCardProps = {
  project: ProjectDefinition;
};

export function ProjectPreviewCard({ project }: ProjectPreviewCardProps) {
  return (
    <Link
      to={project.route}
      className="post-preview-card"
      aria-label={`Открыть проект "${project.meta.title}"`}
    >
      <div className="post-preview-copy">
        <h2 className="post-preview-title">{project.meta.title}</h2>
        {project.previewText ? <p className="post-preview-excerpt">{project.previewText}</p> : null}
      </div>
    </Link>
  );
}
