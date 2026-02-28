import { Mail, MessageCircle, Github, Linkedin, MapPin, Code, Waves, Users } from "lucide-react";

export function About() {
  return (
    <div className="min-h-screen px-6 md:px-12 py-12 md:py-20">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-light tracking-tight">
              Владислав Плотников
            </h1>
            <p className="text-xl md:text-2xl text-[var(--color-secondary)] font-light">
              Robotics Software Engineer
            </p>
          </div>
        </div>

        {/* Intro */}
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            Я инженер-программист с фокусом на робототехнику и автономные системы. 
            Разрабатываю программное обеспечение для промышленных роботов, работаю с ROS/ROS2, 
            компьютерным зрением и embedded-системами.
          </p>
          <p className="text-lg leading-relaxed text-[var(--color-secondary)]">
            Мой опыт включает разработку систем управления, алгоритмов навигации и восприятия окружающей среды, 
            интеграцию сенсоров и разработку надёжного ПО для работы в реальном времени.
          </p>
          <p className="text-lg leading-relaxed text-[var(--color-secondary)]">
            Помимо основной работы, активно развиваю проект в области подводной робототехники 
            и делюсь опытом с молодыми специалистами в качестве ментора.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--color-border)]"></div>

        {/* Focus Areas */}
        <div className="space-y-8">
          <h2 className="text-sm mono tracking-widest text-[var(--color-secondary)] uppercase pb-2">
            Фокус
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 p-6 border border-[var(--color-border)]">
              <div className="w-12 h-12 border border-[var(--color-border)] flex items-center justify-center">
                <Code size={24} strokeWidth={1.5} className="text-[var(--color-mint)]" />
              </div>
              <h3 className="text-lg mono">Робототехника</h3>
              <p className="text-sm text-[var(--color-secondary)] leading-relaxed">
                Разработка ПО для промышленных роботов, систем автоматизации и автономных платформ
              </p>
            </div>

            <div className="space-y-4 p-6 border border-[var(--color-border)]">
              <div className="w-12 h-12 border border-[var(--color-border)] flex items-center justify-center">
                <Waves size={24} strokeWidth={1.5} className="text-[var(--color-mint)]" />
              </div>
              <h3 className="text-lg mono">Подводная робототехника</h3>
              <p className="text-sm text-[var(--color-secondary)] leading-relaxed">
                Развитие проекта по созданию автономных подводных аппаратов и систем управления
              </p>
            </div>

            <div className="space-y-4 p-6 border border-[var(--color-border)]">
              <div className="w-12 h-12 border border-[var(--color-border)] flex items-center justify-center">
                <Users size={24} strokeWidth={1.5} className="text-[var(--color-mint)]" />
              </div>
              <h3 className="text-lg mono">Менторство</h3>
              <p className="text-sm text-[var(--color-secondary)] leading-relaxed">
                Обучение программистов в студенческой команде, передача опыта и best practices
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--color-border)]"></div>

        {/* Approach */}
        <div className="space-y-8">
          <h2 className="text-sm mono tracking-widest text-[var(--color-secondary)] uppercase pb-2">
            Подход
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-4 p-4 border border-[var(--color-border)]">
              <div className="mono text-[var(--color-mint)] text-sm shrink-0">01</div>
              <p className="text-sm">
                Пишу чистый, понятный код с фокусом на поддерживаемость и масштабируемость
              </p>
            </div>
            <div className="flex gap-4 p-4 border border-[var(--color-border)]">
              <div className="mono text-[var(--color-mint)] text-sm shrink-0">02</div>
              <p className="text-sm">
                Использую современные инструменты и практики: Git, CI/CD, code review, тестирование
              </p>
            </div>
            <div className="flex gap-4 p-4 border border-[var(--color-border)]">
              <div className="mono text-[var(--color-mint)] text-sm shrink-0">03</div>
              <p className="text-sm">
                Стремлюсь к глубокому пониманию систем — от низкоуровневых деталей до архитектуры
              </p>
            </div>
            <div className="flex gap-4 p-4 border border-[var(--color-border)]">
              <div className="mono text-[var(--color-mint)] text-sm shrink-0">04</div>
              <p className="text-sm">
                Работаю в команде, делюсь знаниями и открыт к обратной связи
              </p>
            </div>
            <div className="flex gap-4 p-4 border border-[var(--color-border)]">
              <div className="mono text-[var(--color-mint)] text-sm shrink-0">05</div>
              <p className="text-sm">
                Постоянно учусь новому и слежу за развитием технологий в робототехнике
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--color-border)]"></div>

        {/* Contacts */}
        <div className="space-y-8">
          <h2 className="text-sm mono tracking-widest text-[var(--color-secondary)] uppercase pb-2">
            Контакты
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="mailto:ivan.petrov@example.com"
              className="flex items-center gap-3 p-4 border border-[var(--color-border)] hover:border-[var(--color-text)] transition-colors group"
            >
              <Mail size={20} strokeWidth={1.5} className="text-[var(--color-secondary)] group-hover:text-[var(--color-mint)] transition-colors" />
              <div className="flex flex-col">
                <span className="text-xs mono text-[var(--color-secondary)]">EMAIL</span>
                <span className="text-sm">ivan.petrov@example.com</span>
              </div>
            </a>

            <a 
              href="https://t.me/ivanpetrov"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border border-[var(--color-border)] hover:border-[var(--color-text)] transition-colors group"
            >
              <MessageCircle size={20} strokeWidth={1.5} className="text-[var(--color-secondary)] group-hover:text-[var(--color-mint)] transition-colors" />
              <div className="flex flex-col">
                <span className="text-xs mono text-[var(--color-secondary)]">TELEGRAM</span>
                <span className="text-sm">@ivanpetrov</span>
              </div>
            </a>

            <a 
              href="https://github.com/ivanpetrov"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border border-[var(--color-border)] hover:border-[var(--color-text)] transition-colors group"
            >
              <Github size={20} strokeWidth={1.5} className="text-[var(--color-secondary)] group-hover:text-[var(--color-mint)] transition-colors" />
              <div className="flex flex-col">
                <span className="text-xs mono text-[var(--color-secondary)]">GITHUB</span>
                <span className="text-sm">github.com/ivanpetrov</span>
              </div>
            </a>

            <a 
              href="https://linkedin.com/in/ivanpetrov"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border border-[var(--color-border)] hover:border-[var(--color-text)] transition-colors group"
            >
              <Linkedin size={20} strokeWidth={1.5} className="text-[var(--color-secondary)] group-hover:text-[var(--color-mint)] transition-colors" />
              <div className="flex flex-col">
                <span className="text-xs mono text-[var(--color-secondary)]">LINKEDIN</span>
                <span className="text-sm">linkedin.com/in/ivanpetrov</span>
              </div>
            </a>
          </div>

          <div className="flex items-center gap-3 p-4 border border-[var(--color-border)]">
            <MapPin size={20} strokeWidth={1.5} className="text-[var(--color-secondary)]" />
            <div className="flex flex-col">
              <span className="text-xs mono text-[var(--color-secondary)]">LOCATION</span>
              <span className="text-sm">Москва, Россия</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}