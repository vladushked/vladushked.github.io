import { useState } from 'react';
import { ExternalLink, Github } from 'lucide-react';

type ProjectCategory = 'all' | 'robotics' | 'underwater';

interface Project {
  id: string;
  title: string;
  description: string;
  category: 'robotics' | 'underwater';
  role: string;
  tech: string[];
  repo?: string;
  demo?: string;
}

export function Projects() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('all');

  const projects: Project[] = [
    {
      id: '1',
      title: 'Autonomous Navigation System',
      description: 'Система автономной навигации для мобильных роботов с использованием SLAM и компьютерного зрения',
      category: 'robotics',
      role: 'Lead Developer',
      tech: ['C++', 'ROS2', 'PCL', 'OpenCV'],
      repo: 'https://github.com',
    },
    {
      id: '2',
      title: 'Underwater ROV Platform',
      description: 'Платформа для подводного телеуправляемого аппарата с системой стабилизации',
      category: 'underwater',
      role: 'Architect & Developer',
      tech: ['Python', 'ROS', 'Computer Vision', 'PID Control'],
      repo: 'https://github.com',
      demo: 'https://youtube.com',
    },
    {
      id: '3',
      title: 'Vision-based Object Detection',
      description: 'Система детекции и классификации объектов в реальном времени для робототехнических систем',
      category: 'robotics',
      role: 'Computer Vision Engineer',
      tech: ['Python', 'OpenCV', 'TensorFlow', 'ROS'],
      repo: 'https://github.com',
    },
    {
      id: '4',
      title: 'Underwater Object Tracking',
      description: 'Алгоритм трекинга подводных объектов в условиях плохой видимости',
      category: 'underwater',
      role: 'Research & Development',
      tech: ['C++', 'OpenCV', 'Kalman Filter'],
      repo: 'https://github.com',
    },
    {
      id: '5',
      title: 'Multi-Robot Coordination',
      description: 'Система координации нескольких роботов для выполнения совместных задач',
      category: 'robotics',
      role: 'Software Engineer',
      tech: ['ROS2', 'C++', 'Python', 'DDS'],
    },
    {
      id: '6',
      title: 'Sonar Data Processing',
      description: 'Обработка данных гидролокатора для построения карты подводного пространства',
      category: 'underwater',
      role: 'Algorithm Developer',
      tech: ['Python', 'NumPy', 'Signal Processing'],
      demo: 'https://youtube.com',
    },
  ];

  const filteredProjects = activeCategory === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-6">
          <div className="mono uppercase text-xs tracking-wider text-[var(--color-gray)]">
            Projects
          </div>
          <h2>Проекты</h2>

          {/* Category Filter */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setActiveCategory('all')}
              className={`
                px-4 py-2 rounded-sm border text-sm transition-all
                ${activeCategory === 'all'
                  ? 'bg-[var(--color-mint)] border-[var(--color-mint)] text-white'
                  : 'border-[var(--color-border)] hover:border-[var(--color-text)]'
                }
              `}
            >
              Все проекты
            </button>
            <button
              onClick={() => setActiveCategory('robotics')}
              className={`
                px-4 py-2 rounded-sm border text-sm transition-all
                ${activeCategory === 'robotics'
                  ? 'bg-[var(--color-mint)] border-[var(--color-mint)] text-white'
                  : 'border-[var(--color-border)] hover:border-[var(--color-text)]'
                }
              `}
            >
              Основная робототехника
            </button>
            <button
              onClick={() => setActiveCategory('underwater')}
              className={`
                px-4 py-2 rounded-sm border text-sm transition-all
                ${activeCategory === 'underwater'
                  ? 'bg-[var(--color-mint)] border-[var(--color-mint)] text-white'
                  : 'border-[var(--color-border)] hover:border-[var(--color-text)]'
                }
              `}
            >
              Подводная робототехника
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="border border-[var(--color-border)] rounded-sm p-6 hover:border-[var(--color-mint)] transition-all space-y-4 flex flex-col"
            >
              <div className="space-y-3 flex-1">
                <h3>{project.title}</h3>
                <p className="text-sm text-[var(--color-gray)] leading-relaxed">
                  {project.description}
                </p>
                <div className="mono text-xs text-[var(--color-gray)]">
                  Role: {project.role}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="mono text-xs px-2 py-1 border border-[var(--color-border)] rounded-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex gap-3 pt-2">
                {project.repo && (
                  <a
                    href={project.repo}
                    className="flex items-center gap-2 text-sm hover:text-[var(--color-mint)] transition-colors"
                  >
                    <Github size={16} strokeWidth={1.5} />
                    <span className="mono">Repo</span>
                  </a>
                )}
                {project.demo && (
                  <a
                    href={project.demo}
                    className="flex items-center gap-2 text-sm hover:text-[var(--color-mint)] transition-colors"
                  >
                    <ExternalLink size={16} strokeWidth={1.5} />
                    <span className="mono">Demo</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
