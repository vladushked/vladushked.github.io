import { Target, Users, Lightbulb } from "lucide-react";

export function About() {
  return (
    <div className="max-w-4xl mx-auto p-8 py-16 space-y-12">
      <div>
        <h1 className="mb-8">Обо мне</h1>
        
        <div className="space-y-6 text-base leading-relaxed">
          <p>
            Я разработчик программного обеспечения в области робототехники с фокусом на автономные системы,
            компьютерное зрение и системную интеграцию. Работаю над созданием надёжных и эффективных
            решений для промышленных и исследовательских роботов.
          </p>
          
          <p>
            Мой опыт охватывает полный цикл разработки: от проектирования архитектуры до развёртывания
            и поддержки систем в продакшене. Особое внимание уделяю качеству кода, тестированию
            и документированию.
          </p>

          <p>
            Помимо основной работы, развиваю проект по подводной робототехнике и менторю студенческую
            команду программистов, передавая опыт и помогая расти следующему поколению инженеров.
          </p>
        </div>
      </div>

      <div className="border-t border-border pt-12">
        <h2 className="mb-6">Фокус</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-border rounded p-6 bg-white">
            <Target className="w-8 h-8 mb-4 text-[--mint]" />
            <h3 className="mb-2">Робототехника</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Разработка ПО для промышленных роботов, автономных систем навигации
              и компьютерного зрения
            </p>
          </div>

          <div className="border border-border rounded p-6 bg-white">
            <Lightbulb className="w-8 h-8 mb-4 text-[--mint]" />
            <h3 className="mb-2">Подводная робототехника</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Исследовательский проект по созданию автономных подводных аппаратов
              для океанографии
            </p>
          </div>

          <div className="border border-border rounded p-6 bg-white">
            <Users className="w-8 h-8 mb-4 text-[--mint]" />
            <h3 className="mb-2">Менторство</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Обучение студентов-программистов современным практикам разработки
              в робототехнике
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-12">
        <h2 className="mb-6">Подход к работе</h2>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <span className="font-mono text-[--mint]">01</span>
            <div>
              <h4 className="mb-1">Системное мышление</h4>
              <p className="text-sm text-muted-foreground">
                Рассматриваю задачи в контексте всей системы, учитывая взаимодействие компонентов
                и долгосрочные последствия решений
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="font-mono text-[--mint]">02</span>
            <div>
              <h4 className="mb-1">Итеративная разработка</h4>
              <p className="text-sm text-muted-foreground">
                Предпочитаю пошаговый подход с регулярным тестированием и валидацией результатов
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="font-mono text-[--mint]">03</span>
            <div>
              <h4 className="mb-1">Чистый код</h4>
              <p className="text-sm text-muted-foreground">
                Пишу понятный, поддерживаемый код с акцентом на читаемость и документирование
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="font-mono text-[--mint]">04</span>
            <div>
              <h4 className="mb-1">Непрерывное обучение</h4>
              <p className="text-sm text-muted-foreground">
                Постоянно изучаю новые технологии и подходы, делюсь знаниями с командой
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="font-mono text-[--mint]">05</span>
            <div>
              <h4 className="mb-1">Практичность</h4>
              <p className="text-sm text-muted-foreground">
                Фокусируюсь на решениях, которые работают в реальных условиях, а не только в теории
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
