import { Target, Waves, Users } from 'lucide-react';

export function About() {
  const focus = [
    {
      icon: Target,
      title: 'Робототехника',
      description: 'Разработка программного обеспечения для автономных систем и роботов',
    },
    {
      icon: Waves,
      title: 'Подводная робототехника',
      description: 'Создание и развитие проекта в области подводных роботизированных систем',
    },
    {
      icon: Users,
      title: 'Менторство',
      description: 'Обучение и руководство командой программистов студенческого проекта',
    },
  ];

  const approach = [
    'Системный подход к решению технических задач',
    'Фокус на чистом коде и архитектуре',
    'Постоянное развитие и изучение новых технологий',
    'Командная работа и передача знаний',
    'Баланс между теорией и практикой',
  ];

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <div className="mono uppercase text-xs tracking-wider text-[var(--color-gray)]">
            About
          </div>
          <h2>Обо мне</h2>
        </div>

        {/* Intro Text */}
        <div className="space-y-6 text-lg">
          <p>
            Специализируюсь на разработке программного обеспечения для робототехнических 
            систем. Работаю с компьютерным зрением, навигацией, управлением и интеграцией 
            различных сенсоров и актуаторов.
          </p>
          <p>
            В свободное время развиваю проект по подводной робототехнике, где применяю 
            современные технологии для решения сложных задач подводной навигации и управления. 
            Этот проект позволяет мне экспериментировать с новыми подходами и технологиями.
          </p>
          <p>
            Делюсь опытом со студентами, помогая им освоить робототехнику, научиться работать 
            в команде и создавать действительно работающие системы.
          </p>
        </div>

        {/* Focus Areas */}
        <div className="space-y-8">
          <div className="mono uppercase text-xs tracking-wider text-[var(--color-gray)]">
            Фокус
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {focus.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="border border-[var(--color-border)] p-6 rounded-sm hover:border-[var(--color-mint)] transition-colors"
                >
                  <Icon size={24} strokeWidth={1.5} className="mb-4 text-[var(--color-mint)]" />
                  <h3 className="mb-3">{item.title}</h3>
                  <p className="text-sm text-[var(--color-gray)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Approach */}
        <div className="space-y-6">
          <div className="mono uppercase text-xs tracking-wider text-[var(--color-gray)]">
            Подход
          </div>
          <div className="space-y-3">
            {approach.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 py-3 border-b border-[var(--color-border)] last:border-0"
              >
                <span className="mono text-[var(--color-mint)] text-sm mt-1">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="flex-1">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
