import { useParams, Link, useLocation, useNavigate } from "react-router";
import { ArrowLeft, Clock, Calendar, ArrowRight } from "lucide-react";

const postContent: Record<string, {
  title: string;
  date: string;
  readTime: string;
  tags: string[];
  content: string[];
  image: string;
}> = {
  "1": {
    title: "Настройка ROS2 для управления манипулятором",
    date: "2026-02-05",
    readTime: "8 min",
    tags: ["ROS2", "MoveIt", "Tutorial"],
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop",
    content: [
      "ROS2 стал стандартом де-факто для разработки сложных робототехнических систем. В этой статье я расскажу о практических аспектах настройки ROS2 для управления 6-DOF манипулятором.",
      "Первый шаг — правильная установка окружения. Я рекомендую использовать ROS2 Humble на Ubuntu 22.04. Это наиболее стабильная связка на данный момент.",
      "Для управления манипулятором нам понадобится MoveIt2 — мощный фреймворк для планирования траекторий и управления. Установка достаточно простая через apt, но есть несколько нюансов с зависимостями.",
      "Важный момент — правильная настройка URDF-модели робота. От качества модели зависит точность планирования траекторий. Обязательно проверьте collision meshes и limits для каждого сустава.",
      "Для тестирования я использую Gazebo в связке с ros2_control. Это позволяет отработать алгоритмы до запуска на реальном железе.",
      "Не забудьте про настройку контроллеров. Для большинства задач подойдёт JointTrajectoryController, но для точного управления силой/моментом потребуется более продвинутый подход.",
      "В следующей статье расскажу про интеграцию компьютерного зрения для автоматической детекции объектов.",
    ],
  },
  "2": {
    title: "Оптимизация алгоритмов SLAM для подводной навигации",
    date: "2026-01-28",
    readTime: "12 min",
    tags: ["SLAM", "Underwater", "Navigation"],
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop",
    content: [
      "Подводная навигация — одна из самых сложных задач в робототехнике. Ограниченная видимость, динамическая среда, отсутствие GPS — всё это создаёт уникальные вызовы.",
      "Классические SLAM-алгоритмы, работающие отлично на суше, требуют существенных модификаций для подводной среды.",
      "Первая проблема — качество визуальных данных. Под водой освещение неравномерное, много взвешенных частиц, цвета искажены. Стандартные детекторы фич работают плохо.",
      "Мы используем комбинацию визуальной и инерциальной одометрии (VIO) с акустическими маяками. Это даёт более стабильную локализацию.",
      "Важный момент — фильтрация шумных измерений. Extended Kalman Filter или его вариации показывают хорошие результаты.",
      "Для оптимизации производительности мы перешли на graph-based SLAM подход. Он позволяет эффективно обрабатывать loop closures и корректировать траекторию.",
      "Результаты тестов показали улучшение точности локализации на 40% по сравнению с базовым EKF-SLAM.",
    ],
  },
};

const postTitles: Record<string, string> = {
  "1": "Настройка ROS2 для управления манипулятором",
  "2": "Оптимизация алгоритмов SLAM для подводной навигации",
  "3": "Интеграция компьютерного зрения в ROS",
  "4": "Best practices разработки ПО для робототехники",
  "5": "Отладка систем реального времени",
  "6": "Обзор соревнований по подводной робототехнике",
  "7": "Настройка CI/CD для ROS-проектов",
  "8": "Менторство в робототехнике: с чего начать",
};

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const post = id && postContent[id] ? postContent[id] : null;
  const scrollPosition = (location.state as { scrollPosition?: number })?.scrollPosition || 0;

  const handleBackToPosts = () => {
    navigate("/posts", { state: { scrollPosition } });
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 0);
  };

  if (!post) {
    return (
      <div className="min-h-screen px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-3xl mx-auto space-y-12">
          <button
            onClick={handleBackToPosts}
            className="inline-flex items-center gap-2 text-sm mono text-[var(--color-secondary)] hover:text-[var(--color-mint)] transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            BACK TO POSTS
          </button>
          
          <div className="text-center space-y-4 py-20">
            <h1 className="text-2xl">Пост не найден</h1>
          </div>
        </div>
      </div>
    );
  }

  const currentId = parseInt(id || "1");
  const prevPost = currentId > 1 ? currentId - 1 : null;
  const nextPost = currentId < Object.keys(postTitles).length ? currentId + 1 : null;

  return (
    <div className="min-h-screen px-6 md:px-12 py-12 md:py-20">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Back Link */}
        <button
          onClick={handleBackToPosts}
          className="inline-flex items-center gap-2 text-sm mono text-[var(--color-secondary)] hover:text-[var(--color-mint)] transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          BACK TO POSTS
        </button>

        {/* Header */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-5xl font-light tracking-tight leading-tight">
            {post.title}
          </h1>

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

          {/* Featured Image */}
          <div className="w-full h-64 md:h-96 overflow-hidden border border-[var(--color-border)]">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="border-t border-[var(--color-border)]"></div>
        </div>

        {/* Content */}
        <article className="space-y-6 text-lg leading-relaxed">
          {post.content.map((paragraph, index) => (
            <p key={index} className="text-[var(--color-secondary)]">
              {paragraph}
            </p>
          ))}
        </article>

        {/* Divider */}
        <div className="border-t border-[var(--color-border)]"></div>

        {/* Navigation */}
        <div className="flex flex-col md:flex-row gap-4 md:justify-between">
          {prevPost ? (
            <Link
              to={`/posts/${prevPost}`}
              state={{ scrollPosition: 0 }}
              className="flex items-center gap-3 p-4 border border-[var(--color-border)] hover:border-[var(--color-text)] transition-colors group flex-1"
            >
              <ArrowLeft size={16} strokeWidth={1.5} className="text-[var(--color-secondary)] group-hover:text-[var(--color-mint)] transition-colors shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs mono text-[var(--color-secondary)]">PREVIOUS</span>
                <span className="text-sm truncate">{postTitles[prevPost.toString()]}</span>
              </div>
            </Link>
          ) : (
            <div className="flex-1"></div>
          )}

          {nextPost ? (
            <Link
              to={`/posts/${nextPost}`}
              state={{ scrollPosition: 0 }}
              className="flex items-center gap-3 p-4 border border-[var(--color-border)] hover:border-[var(--color-text)] transition-colors group flex-1"
            >
              <div className="flex flex-col text-right min-w-0 flex-1">
                <span className="text-xs mono text-[var(--color-secondary)]">NEXT</span>
                <span className="text-sm truncate">{postTitles[nextPost.toString()]}</span>
              </div>
              <ArrowRight size={16} strokeWidth={1.5} className="text-[var(--color-secondary)] group-hover:text-[var(--color-mint)] transition-colors shrink-0" />
            </Link>
          ) : (
            <div className="flex-1"></div>
          )}
        </div>
      </div>
    </div>
  );
}
