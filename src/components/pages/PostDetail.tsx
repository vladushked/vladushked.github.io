import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock post data
  const post = {
    id: id || '1',
    title: 'Введение в ROS2: от теории к практике',
    date: '2026-02-05',
    tags: ['ROS2', 'Tutorial', 'Robotics'],
    readTime: '8 min',
    content: `
# Введение

ROS2 (Robot Operating System 2) представляет собой современную платформу для разработки робототехнического программного обеспечения. В этой статье мы рассмотрим основные концепции и создадим простое приложение.

## Основные концепции

### Nodes и Topics

Узлы (nodes) в ROS2 — это отдельные процессы, которые выполняют специфические задачи. Они общаются между собой через topics — именованные каналы для передачи сообщений.

### Publishers и Subscribers

Publisher отправляет сообщения в topic, а subscriber получает их. Это основной механизм асинхронной коммуникации в ROS2.

## Практический пример

Создадим простой publisher, который публикует данные с сенсора:

\`\`\`python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        
    def publish_message(self):
        msg = String()
        msg.data = 'Hello ROS2'
        self.publisher_.publish(msg)
\`\`\`

## Заключение

ROS2 предоставляет мощные инструменты для разработки робототехнических систем. Освоение основных концепций — первый шаг к созданию сложных проектов.
    `.trim(),
  };

  const handlePrevious = () => {
    const prevId = parseInt(id || '1') - 1;
    if (prevId >= 1) {
      navigate(`/posts/${prevId}`);
    }
  };

  const handleNext = () => {
    const nextId = parseInt(id || '1') + 1;
    if (nextId <= 8) {
      navigate(`/posts/${nextId}`);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Back Button */}
        <Link
          to="/posts"
          className="inline-flex items-center gap-2 text-sm hover:text-[var(--color-mint)] transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          <span>Назад к постам</span>
        </Link>

        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl">{post.title}</h1>
          <div className="flex items-center gap-4 mono text-xs text-[var(--color-gray)]">
            <span>{post.date}</span>
            <span className="flex items-center gap-1">
              <Clock size={12} strokeWidth={1.5} />
              {post.readTime}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="mono text-xs px-2 py-1 border border-[var(--color-border)] rounded-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--color-border)]" />

        {/* Content */}
        <article className="prose prose-neutral max-w-none">
          <div className="space-y-6 text-[var(--color-text)] leading-relaxed">
            {post.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('# ')) {
                return (
                  <h2 key={index} className="text-2xl font-medium mt-12 mb-4">
                    {paragraph.replace('# ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('## ')) {
                return (
                  <h3 key={index} className="text-xl font-medium mt-8 mb-3">
                    {paragraph.replace('## ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h4 key={index} className="text-lg font-medium mt-6 mb-2">
                    {paragraph.replace('### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('```')) {
                const code = paragraph.replace(/```\w*\n?/g, '');
                return (
                  <pre
                    key={index}
                    className="mono text-xs bg-[var(--color-bg)] border border-[var(--color-border)] p-4 rounded-sm overflow-x-auto my-6"
                  >
                    <code>{code}</code>
                  </pre>
                );
              }
              return (
                <p key={index} className="text-base">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </article>

        {/* Divider */}
        <div className="border-t border-[var(--color-border)]" />

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={parseInt(id || '1') <= 1}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] rounded-sm hover:border-[var(--color-mint)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border)]"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
            <span className="text-sm">Предыдущий</span>
          </button>
          <button
            onClick={handleNext}
            disabled={parseInt(id || '1') >= 8}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] rounded-sm hover:border-[var(--color-mint)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border)]"
          >
            <span className="text-sm">Следующий</span>
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
