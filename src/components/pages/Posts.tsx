import { Link } from 'react-router';
import { Clock } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  date: string;
  tags: string[];
  preview: string;
  readTime: string;
}

export function Posts() {
  const posts: Post[] = [
    {
      id: '1',
      title: 'Введение в ROS2: от теории к практике',
      date: '2026-02-05',
      tags: ['ROS2', 'Tutorial', 'Robotics'],
      preview: 'Обзор основных концепций ROS2 и практические примеры создания первого робототехнического приложения.',
      readTime: '8 min',
    },
    {
      id: '2',
      title: 'Оптимизация алгоритмов компьютерного зрения',
      date: '2026-01-28',
      tags: ['Computer Vision', 'Performance', 'C++'],
      preview: 'Техники оптимизации алгоритмов обработки изображений для работы в реальном времени на embedded системах.',
      readTime: '12 min',
    },
    {
      id: '3',
      title: 'Управление подводным роботом: вызовы и решения',
      date: '2026-01-20',
      tags: ['Underwater', 'Control', 'PID'],
      preview: 'Особенности разработки систем управления для подводных аппаратов: от моделирования до тестирования.',
      readTime: '10 min',
    },
    {
      id: '4',
      title: 'SLAM для мобильных роботов',
      date: '2026-01-12',
      tags: ['SLAM', 'Navigation', 'Robotics'],
      preview: 'Разбор алгоритмов одновременной локализации и построения карты на примере реального проекта.',
      readTime: '15 min',
    },
    {
      id: '5',
      title: 'Менторинг в робототехнике: опыт и советы',
      date: '2026-01-05',
      tags: ['Mentoring', 'Education', 'Team'],
      preview: 'Как эффективно обучать студентов робототехнике и помогать им развивать технические навыки.',
      readTime: '6 min',
    },
    {
      id: '6',
      title: 'Интеграция сенсоров в ROS',
      date: '2025-12-22',
      tags: ['ROS', 'Sensors', 'Integration'],
      preview: 'Практическое руководство по подключению и калибровке различных типов сенсоров в экосистеме ROS.',
      readTime: '9 min',
    },
    {
      id: '7',
      title: 'Тестирование робототехнического ПО',
      date: '2025-12-15',
      tags: ['Testing', 'CI/CD', 'Quality'],
      preview: 'Подходы к тестированию робототехнических систем: от unit-тестов до симуляции полного цикла.',
      readTime: '11 min',
    },
    {
      id: '8',
      title: 'Computer Vision под водой',
      date: '2025-12-08',
      tags: ['Computer Vision', 'Underwater', 'Challenges'],
      preview: 'Специфика обработки изображений в подводной среде и методы решения типичных проблем.',
      readTime: '13 min',
    },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="mono uppercase text-xs tracking-wider text-[var(--color-gray)]">
            Blog
          </div>
          <h2>Посты</h2>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/posts/${post.id}`}
              className="block border border-[var(--color-border)] rounded-sm p-6 hover:border-[var(--color-mint)] transition-all group"
            >
              <div className="space-y-4">
                {/* Title and Meta */}
                <div className="space-y-2">
                  <h3 className="group-hover:text-[var(--color-mint)] transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-4 mono text-xs text-[var(--color-gray)]">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} strokeWidth={1.5} />
                      {post.readTime}
                    </span>
                  </div>
                </div>

                {/* Preview */}
                <p className="text-sm text-[var(--color-gray)] leading-relaxed">
                  {post.preview}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="mono text-xs px-2 py-1 border border-[var(--color-border)] rounded-sm group-hover:border-[var(--color-mint)] transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
