export function Resume() {
  return (
    <div className="min-h-screen px-6 md:px-12 py-12 md:py-20">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Experience */}
        <section className="space-y-8">
          <h2 className="text-sm mono tracking-widest text-[var(--color-secondary)] uppercase pb-2">
            Опыт работы
          </h2>
          
          <div className="space-y-8">
            {/* Experience Item 1 */}
            <div className="space-y-4 border-l-4 border-[var(--color-mint)] pl-6 py-2">
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <h3 className="text-xl mono">Robotics Software Engineer</h3>
                  <span className="text-sm mono text-[var(--color-secondary)]">2022 – Настоящее время</span>
                </div>
                <p className="text-[var(--color-secondary)]">ООО «РобоТех Системы»</p>
              </div>
              <ul className="space-y-2 text-sm text-[var(--color-secondary)]">
                <li className="flex gap-3">
                  <span className="text-[var(--color-secondary)] shrink-0">•</span>
                  <span>Разработка системы управления для промышленных манипуляторов на базе ROS2</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-secondary)] shrink-0">•</span>
                  <span>Интеграция компьютерного зрения для распознавания объектов и планирования траекторий</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-secondary)] shrink-0">•</span>
                  <span>Настройка CI/CD pipeline для автоматического тестирования и развёртывания</span>
                </li>
              </ul>
            </div>

            {/* Experience Item 2 */}
            <div className="space-y-4 border-l-4 border-[var(--color-mint)] pl-6 py-2">
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <h3 className="text-xl mono">Mentor / Software Engineer</h3>
                  <span className="text-sm mono text-[var(--color-secondary)]">2021 – Настоящее время</span>
                </div>
                <p className="text-[var(--color-secondary)]">Студенческая команда подводной робототехники</p>
              </div>
              <ul className="space-y-2 text-sm text-[var(--color-secondary)]">
                <li className="flex gap-3">
                  <span className="text-[var(--color-secondary)] shrink-0">•</span>
                  <span>Менторство программистов команды, проведение code review и обучающих сессий</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-secondary)] shrink-0">•</span>
                  <span>Разработка ПО для автономного подводного аппарата (навигация, компьютерное зрение)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-secondary)] shrink-0">•</span>
                  <span>Участие в международных соревнованиях по подводной робототехнике</span>
                </li>
              </ul>
            </div>

            {/* Experience Item 3 */}
            <div className="space-y-4 border-l-4 border-[var(--color-border)] pl-6 py-2">
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <h3 className="text-xl mono">Junior Software Engineer</h3>
                  <span className="text-sm mono text-[var(--color-secondary)]">2020 – 2022</span>
                </div>
                <p className="text-[var(--color-secondary)]">АО «Техносистемс»</p>
              </div>
              <ul className="space-y-2 text-sm text-[var(--color-secondary)]">
                <li className="flex gap-3">
                  <span className="text-[var(--color-secondary)] shrink-0">•</span>
                  <span>Разработка встроенного ПО для микроконтроллеров (C/C++)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-secondary)] shrink-0">•</span>
                  <span>Создание драйверов для сенсоров и исполнительных механизмов</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-secondary)] shrink-0">•</span>
                  <span>Отладка и тестирование систем реального времени</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-[var(--color-border)]"></div>

        {/* Skills */}
        <section className="space-y-8">
          <h2 className="text-sm mono tracking-widest text-[var(--color-secondary)] uppercase pb-2">
            Навыки
          </h2>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Programming Languages</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">C++</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">Python</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">C</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">Bash</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Robotics & Frameworks</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-sm border border-[var(--color-mint)] bg-[var(--color-mint)] mono">ROS</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-mint)] bg-[var(--color-mint)] mono">ROS2</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">Gazebo</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">MoveIt</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">OpenCV</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Computer Vision & AI</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">OpenCV</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">PCL</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">TensorFlow</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">PyTorch</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">YOLO</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Embedded & Hardware</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">STM32</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">ESP32</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">Arduino</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">Raspberry Pi</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">I2C</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">SPI</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">UART</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Tools & DevOps</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">Git</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">Docker</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">CI/CD</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">Linux</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">CMake</span>
                <span className="px-3 py-1 text-sm border border-[var(--color-border)] mono">GDB</span>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-[var(--color-border)]"></div>

        {/* Education */}
        <section className="space-y-8">
          <h2 className="text-sm mono tracking-widest text-[var(--color-secondary)] uppercase pb-2">
            Образование
          </h2>
          
          <div className="space-y-6">
            <div className="space-y-2 p-6 border border-[var(--color-border)]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <h3 className="text-xl mono">Магистр, Мехатроника и робототехника</h3>
                <span className="text-sm mono text-[var(--color-secondary)]">2019 – 2021</span>
              </div>
              <p className="text-[var(--color-secondary)]">МГТУ им. Н.Э. Баумана</p>
            </div>

            <div className="space-y-2 p-6 border border-[var(--color-border)]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <h3 className="text-xl mono">Бакалавр, Автоматизация технологических процессов</h3>
                <span className="text-sm mono text-[var(--color-secondary)]">2015 – 2019</span>
              </div>
              <p className="text-[var(--color-secondary)]">МГТУ им. Н.Э. Баумана</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}