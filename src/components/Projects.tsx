import { useState } from "react";
import { ExternalLink, Github } from "lucide-react";

type Project = {
  id: string;
  title: string;
  description: string;
  role: string;
  category: "robotics" | "underwater";
  tech: string[];
  repo?: string;
  demo?: string;
};

const projects: Project[] = [
  {
    id: "1",
    title: "Система управления манипулятором",
    description: "Разработка системы управления 6-DOF манипулятором с обратной связью по силе и моменту",
    role: "Lead Developer",
    category: "robotics",
    tech: ["ROS2", "C++", "MoveIt", "Python"],
    repo: "https://github.com/example/manipulator-control",
  },
  {
    id: "2",
    title: "Компьютерное зрение для pick-and-place",
    description: "Система распознавания и локализации объектов для автоматизации задач складской логистики",
    role: "Computer Vision Engineer",
    category: "robotics",
    tech: ["OpenCV", "Python", "YOLO", "ROS2"],
    demo: "https://example.com/demo",
  },
  {
    id: "3",
    title: "Автономный подводный аппарат",
    description: "Разработка ПО для автономной навигации и выполнения подводных задач",
    role: "Software Lead & Mentor",
    category: "underwater",
    tech: ["ROS", "C++", "Python", "Computer Vision"],
    repo: "https://github.com/example/auv",
  },
  {
    id: "4",
    title: "Система подводной локализации",
    description: "Алгоритмы SLAM для навигации в подводной среде с использованием акустических маяков",
    role: "Algorithm Developer",
    category: "underwater",
    tech: ["C++", "Python", "ROS", "Gazebo"],
  },
  {
    id: "5",
    title: "Симулятор робототехнических систем",
    description: "Разработка инструментов для симуляции и тестирования робототехнических алгоритмов",
    role: "Developer",
    category: "robotics",
    tech: ["Gazebo", "ROS2", "Python", "Docker"],
    repo: "https://github.com/example/simulator",
  },
  {
    id: "6",
    title: "Система распознавания объектов под водой",
    description: "Нейросетевая система для детекции и классификации подводных объектов в условиях низкой видимости",
    role: "ML Engineer",
    category: "underwater",
    tech: ["PyTorch", "OpenCV", "Python", "ROS"],
    demo: "https://example.com/underwater-detection",
  },
];

export function Projects() {
  const [filter, setFilter] = useState<"all" | "robotics" | "underwater">("all");

  const filteredProjects = filter === "all" 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <div className="min-h-screen px-6 md:px-12 py-12 md:py-20">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm mono border transition-colors ${
              filter === "all"
                ? "bg-[var(--color-mint)] border-[var(--color-mint)]"
                : "border-[var(--color-border)] hover:border-[var(--color-text)]"
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setFilter("robotics")}
            className={`px-4 py-2 text-sm mono border transition-colors ${
              filter === "robotics"
                ? "bg-[var(--color-mint)] border-[var(--color-mint)]"
                : "border-[var(--color-border)] hover:border-[var(--color-text)]"
            }`}
          >
            ROBOTICS
          </button>
          <button
            onClick={() => setFilter("underwater")}
            className={`px-4 py-2 text-sm mono border transition-colors ${
              filter === "underwater"
                ? "bg-[var(--color-mint)] border-[var(--color-mint)]"
                : "border-[var(--color-border)] hover:border-[var(--color-text)]"
            }`}
          >
            UNDERWATER
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="border border-[var(--color-border)] hover:border-[var(--color-text)] transition-colors p-6 space-y-4 flex flex-col"
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg leading-tight mono">{project.title}</h3>
                  <span className="text-[10px] mono text-[var(--color-secondary)] uppercase shrink-0">
                    {project.category === "robotics" ? "ROB" : "UW"}
                  </span>
                </div>
                
                <p className="text-sm text-[var(--color-secondary)] leading-relaxed">
                  {project.description}
                </p>

                <div className="text-xs mono text-[var(--color-secondary)]">
                  ROLE: {project.role}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs border border-[var(--color-border)] mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-xs border border-[var(--color-border)] hover:border-[var(--color-text)] transition-colors"
                    >
                      <Github size={14} strokeWidth={1.5} />
                      <span className="mono">REPO</span>
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-xs border border-[var(--color-border)] hover:border-[var(--color-text)] transition-colors"
                    >
                      <ExternalLink size={14} strokeWidth={1.5} />
                      <span className="mono">DEMO</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}