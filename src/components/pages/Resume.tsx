export function Resume() {
  const experience = [
    {
      company: 'Robotics Company',
      role: 'Senior Robotics Software Engineer',
      period: '2022 — Настоящее время',
      points: [
        'Разработка и поддержка программного обеспечения для автономных роботов',
        'Реализация алгоритмов компьютерного зрения и навигации',
        'Оптимизация производительности критичных модулей системы',
      ],
    },
    {
      company: 'Tech Startup',
      role: 'Robotics Software Engineer',
      period: '2020 — 2022',
      points: [
        'Создание системы управления для мобильных роботов',
        'Интеграция различных сенсоров и актуаторов',
        'Участие в архитектурных решениях проекта',
      ],
    },
    {
      company: 'Student Robotics Team',
      role: 'Programming Mentor',
      period: '2021 — Настоящее время',
      points: [
        'Обучение студентов основам робототехники и программирования',
        'Руководство разработкой подводного робота',
        'Организация технических воркшопов и code review',
      ],
    },
  ];

  const skills = [
    { name: 'C++', level: 'Expert' },
    { name: 'Python', level: 'Expert' },
    { name: 'ROS/ROS2', level: 'Advanced' },
    { name: 'Computer Vision', level: 'Advanced' },
    { name: 'Linux', level: 'Advanced' },
    { name: 'Embedded Systems', level: 'Intermediate' },
    { name: 'Git', level: 'Advanced' },
    { name: 'CI/CD', level: 'Intermediate' },
    { name: 'OpenCV', level: 'Advanced' },
    { name: 'Docker', level: 'Intermediate' },
    { name: 'PCL', level: 'Intermediate' },
    { name: 'Gazebo', level: 'Advanced' },
  ];

  const education = [
    {
      institution: 'Технический Университет',
      degree: 'Магистр, Робототехника и мехатроника',
      period: '2018 — 2020',
    },
    {
      institution: 'Технический Университет',
      degree: 'Бакалавр, Автоматизация и управление',
      period: '2014 — 2018',
    },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <div className="mono uppercase text-xs tracking-wider text-[var(--color-gray)]">
            Resume
          </div>
          <h2>Резюме</h2>
        </div>

        {/* Experience */}
        <section className="space-y-8">
          <div className="mono uppercase text-xs tracking-wider text-[var(--color-gray)]">
            Опыт работы
          </div>
          <div className="space-y-10">
            {experience.map((job, index) => (
              <div
                key={index}
                className="border-l-2 border-[var(--color-border)] pl-6 hover:border-[var(--color-mint)] transition-colors"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 gap-2">
                  <div>
                    <h3>{job.role}</h3>
                    <p className="text-[var(--color-gray)] mt-1">{job.company}</p>
                  </div>
                  <span className="mono text-sm text-[var(--color-gray)]">
                    {job.period}
                  </span>
                </div>
                <ul className="space-y-2">
                  {job.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[var(--color-mint)] mt-1.5">—</span>
                      <span className="text-sm text-[var(--color-gray)]">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="space-y-8">
          <div className="mono uppercase text-xs tracking-wider text-[var(--color-gray)]">
            Навыки
          </div>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="border border-[var(--color-border)] px-4 py-2 rounded-sm hover:border-[var(--color-mint)] transition-colors group"
              >
                <span className="text-sm">{skill.name}</span>
                <span className="mono text-xs text-[var(--color-gray)] ml-2 group-hover:text-[var(--color-mint)]">
                  {skill.level}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="space-y-8">
          <div className="mono uppercase text-xs tracking-wider text-[var(--color-gray)]">
            Образование
          </div>
          <div className="space-y-6">
            {education.map((edu, index) => (
              <div
                key={index}
                className="border border-[var(--color-border)] p-6 rounded-sm hover:border-[var(--color-mint)] transition-colors"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                  <div>
                    <h3 className="text-lg">{edu.degree}</h3>
                    <p className="text-[var(--color-gray)] mt-1">{edu.institution}</p>
                  </div>
                  <span className="mono text-sm text-[var(--color-gray)]">
                    {edu.period}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
