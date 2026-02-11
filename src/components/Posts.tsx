import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Clock, Calendar } from "lucide-react";

type Post = {
  id: string;
  title: string;
  date: string;
  readTime: string;
  preview: string;
  tags: string[];
  image: string;
};

const posts: Post[] = [
  {
    id: "1",
    title: "Настройка ROS2 для управления манипулятором",
    date: "2026-02-05",
    readTime: "8 min",
    preview: "Практическое руководство по настройке ROS2 для управления 6-DOF манипулятором с использованием MoveIt2",
    tags: ["ROS2", "MoveIt", "Tutorial"],
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop",
  },
  {
    id: "2",
    title: "Оптимизация алгоритмов SLAM для подводной навигации",
    date: "2026-01-28",
    readTime: "12 min",
    preview: "Обзор методов оптимизации SLAM-алгоритмов для работы в условиях ограниченной видимости под водой",
    tags: ["SLAM", "Underwater", "Navigation"],
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop",
  },
  {
    id: "3",
    title: "Интеграция компьютерного зрения в ROS",
    date: "2026-01-15",
    readTime: "10 min",
    preview: "Как интегрировать OpenCV и нейросетевые модели детекции объектов в ROS-pipeline",
    tags: ["Computer Vision", "ROS", "OpenCV"],
    image: "https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=800&h=400&fit=crop",
  },
  {
    id: "4",
    title: "Best practices разработки ПО для робототехники",
    date: "2026-01-08",
    readTime: "6 min",
    preview: "Принципы написания надёжного, поддерживаемого кода для робототехнических систем",
    tags: ["Software Engineering", "Best Practices"],
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop",
  },
  {
    id: "5",
    title: "Отладка систем реального времени",
    date: "2025-12-20",
    readTime: "9 min",
    preview: "Инструменты и методы отладки embedded-систем и программ реального времени",
    tags: ["Embedded", "Debugging", "Real-time"],
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop",
  },
  {
    id: "6",
    title: "Обзор соревнований по подводной робототехнике",
    date: "2025-12-10",
    readTime: "7 min",
    preview: "Опыт участия в международных соревнованиях и полезные уроки для команд",
    tags: ["Underwater", "Competition", "Experience"],
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=400&fit=crop",
  },
  {
    id: "7",
    title: "Настройка CI/CD для ROS-проектов",
    date: "2025-11-25",
    readTime: "11 min",
    preview: "Автоматизация сборки, тестирования и развёртывания ROS-пакетов с помощью GitLab CI",
    tags: ["DevOps", "CI/CD", "ROS"],
    image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=400&fit=crop",
  },
  {
    id: "8",
    title: "Менторство в робототехнике: с чего начать",
    date: "2025-11-18",
    readTime: "5 min",
    preview: "Мысли о менторстве, передаче опыта и развитии молодых специалистов",
    tags: ["Mentoring", "Career", "Education"],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
  },
];

// Get all unique tags
const allTags = Array.from(new Set(posts.flatMap(post => post.tags))).sort();

export function Posts() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const location = useLocation();

  const filteredPosts = selectedTag 
    ? posts.filter(post => post.tags.includes(selectedTag))
    : posts;

  // Restore scroll position when returning from post detail
  const scrollPosition = (location.state as { scrollPosition?: number })?.scrollPosition || 0;

  return (
    <div className="min-h-screen px-6 md:px-12 py-12 md:py-20">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Tag Filter */}
        <div className="space-y-4">
          <h2 className="text-sm mono tracking-widest text-[var(--color-secondary)] uppercase pb-2">
            Фильтр по тегам
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-2 text-xs mono border transition-colors ${
                selectedTag === null
                  ? "bg-[var(--color-mint)] border-[var(--color-mint)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-text)]"
              }`}
            >
              ALL
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-2 text-xs mono border transition-colors ${
                  selectedTag === tag
                    ? "bg-[var(--color-mint)] border-[var(--color-mint)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-text)]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              to={`/posts/${post.id}`}
              state={{ scrollPosition: window.scrollY }}
              className="block border border-[var(--color-border)] hover:border-[var(--color-text)] transition-colors overflow-hidden group"
            >
              <div className="md:flex">
                {/* Image */}
                <div className="md:w-64 h-48 md:h-auto overflow-hidden bg-[var(--color-border)] shrink-0">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 flex-1">
                  <div className="space-y-3">
                    <h2 className="text-xl md:text-2xl mono">
                      {post.title}
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs mono text-[var(--color-secondary)]">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} strokeWidth={1.5} />
                        <span>{new Date(post.date).toLocaleDateString("ru-RU", { 
                          year: "numeric", 
                          month: "long", 
                          day: "numeric" 
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} strokeWidth={1.5} />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    <p className="text-[var(--color-secondary)] leading-relaxed">
                      {post.preview}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs border border-[var(--color-border)] mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}