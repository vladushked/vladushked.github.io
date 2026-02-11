import { Mail, Github, Linkedin, MapPin, MessageSquare } from "lucide-react";

export function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h1 className="text-5xl md:text-6xl mb-4">Иван Иванов</h1>
          <div className="text-xl text-muted-foreground font-mono">
            Robotics Software Engineer
          </div>
        </div>

        <div className="border-t border-b border-border py-8">
          <p className="text-base leading-relaxed">
            Работаю в IT-робототехнике, разрабатываю программное обеспечение для автономных систем.
            Параллельно развиваю проект по подводной робототехнике и менторю команду
            программистов-студентов, помогая им развивать навыки в ROS, компьютерном зрении и системной интеграции.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="mailto:ivan@example.com"
            className="flex items-center gap-3 p-4 border border-border rounded hover:border-[--mint] hover:bg-[--mint]/5 transition-all"
          >
            <Mail className="w-5 h-5" />
            <div>
              <div className="text-xs font-mono uppercase text-muted-foreground mb-0.5">
                Email
              </div>
              <div className="text-sm">ivan@example.com</div>
            </div>
          </a>

          <a
            href="https://t.me/ivanivanov"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-border rounded hover:border-[--mint] hover:bg-[--mint]/5 transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            <div>
              <div className="text-xs font-mono uppercase text-muted-foreground mb-0.5">
                Telegram
              </div>
              <div className="text-sm">@ivanivanov</div>
            </div>
          </a>

          <a
            href="https://github.com/ivanivanov"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-border rounded hover:border-[--mint] hover:bg-[--mint]/5 transition-all"
          >
            <Github className="w-5 h-5" />
            <div>
              <div className="text-xs font-mono uppercase text-muted-foreground mb-0.5">
                GitHub
              </div>
              <div className="text-sm">@ivanivanov</div>
            </div>
          </a>

          <a
            href="https://linkedin.com/in/ivanivanov"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-border rounded hover:border-[--mint] hover:bg-[--mint]/5 transition-all"
          >
            <Linkedin className="w-5 h-5" />
            <div>
              <div className="text-xs font-mono uppercase text-muted-foreground mb-0.5">
                LinkedIn
              </div>
              <div className="text-sm">Ivan Ivanov</div>
            </div>
          </a>

          <div className="flex items-center gap-3 p-4 border border-border rounded sm:col-span-2">
            <MapPin className="w-5 h-5" />
            <div>
              <div className="text-xs font-mono uppercase text-muted-foreground mb-0.5">
                Location
              </div>
              <div className="text-sm">Moscow, Russia</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
