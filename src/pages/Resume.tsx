import { ExperienceItem } from "../components/ExperienceItem";
import { Tag } from "../components/Tag";

export function Resume() {
  const experience = [
    {
      company: "RoboTech Solutions",
      role: "Senior Robotics Software Engineer",
      period: "2022 — Present",
      responsibilities: [
        "Разработка алгоритмов автономной навигации для промышленных роботов",
        "Интеграция компьютерного зрения для задач object detection и tracking",
        "Архитектура и имплементация распределённых систем на ROS2",
      ],
    },
    {
      company: "Innovation Lab",
      role: "Robotics Engineer",
      period: "2020 — 2022",
      responsibilities: [
        "Разработка системы локализации и картографирования (SLAM) для мобильных роботов",
        "Оптимизация алгоритмов планирования траекторий",
        "Настройка CI/CD пайплайнов для автоматизированного тестирования",
      ],
    },
    {
      company: "Underwater Robotics Project",
      role: "Lead Programmer & Mentor",
      period: "2021 — Present",
      responsibilities: [
        "Руководство командой из 5 студентов-программистов",
        "Проектирование архитектуры ПО для автономного подводного аппарата",
        "Обучение команды best practices в разработке и code review",
      ],
    },
  ];

  const skills = {
    "Programming Languages": ["C++", "Python", "Rust", "Bash"],
    "Robotics & Frameworks": ["ROS", "ROS2", "Gazebo", "MoveIt"],
    "Computer Vision": ["OpenCV", "PCL", "TensorFlow", "PyTorch"],
    "Embedded Systems": ["ARM", "STM32", "Arduino", "Raspberry Pi"],
    "Tools & Other": ["Linux", "Git", "Docker", "CMake", "CI/CD", "GTest"],
  };

  const education = [
    {
      institution: "Московский технический университет",
      degree: "Магистр, Робототехника и мехатроника",
      period: "2018 — 2020",
    },
    {
      institution: "Московский технический университет",
      degree: "Бакалавр, Прикладная математика и информатика",
      period: "2014 — 2018",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 py-16 space-y-12">
      <div>
        <h1 className="mb-2">Резюме</h1>
        <p className="text-muted-foreground">
          Опыт работы, навыки и образование
        </p>
      </div>

      {/* Experience */}
      <section>
        <h2 className="mb-6">Опыт работы</h2>
        <div className="space-y-4">
          {experience.map((exp, index) => (
            <ExperienceItem key={index} {...exp} />
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="border-t border-border pt-12">
        <h2 className="mb-6">Навыки</h2>
        <div className="space-y-6">
          {Object.entries(skills).map(([category, items]) => (
            <div key={category}>
              <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                {category}
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <Tag key={skill}>{skill}</Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="border-t border-border pt-12">
        <h2 className="mb-6">Образование</h2>
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div key={index} className="border border-border rounded bg-white p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                <div>
                  <h3>{edu.degree}</h3>
                  <div className="text-sm text-muted-foreground">{edu.institution}</div>
                </div>
                <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                  {edu.period}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
