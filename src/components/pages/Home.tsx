import { Mail, Send, Github, Linkedin, MapPin } from 'lucide-react';

export function Home() {
  const links = [
    { icon: Mail, label: 'hello@example.com', href: 'mailto:hello@example.com' },
    { icon: Send, label: '@username', href: 'https://t.me/username' },
    { icon: Github, label: 'github', href: 'https://github.com' },
    { icon: Linkedin, label: 'linkedin', href: 'https://linkedin.com' },
    { icon: MapPin, label: 'Москва, Россия', href: '#' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-12">
        {/* Name */}
        <div className="space-y-2">
          <h1>Имя Фамилия</h1>
          <p className="text-xl text-[var(--color-gray)]">Robotics Software Engineer</p>
        </div>

        {/* Note */}
        <div className="space-y-4 border-l-2 border-[var(--color-mint)] pl-6">
          <p className="text-lg leading-relaxed">
            Работаю в IT-робототехнике, разрабатываю решения для автономных систем. 
            Развиваю проект по подводной робототехнике. Менторю программистов 
            студенческой команды, помогая создавать сложные технические системы.
          </p>
        </div>

        {/* Contacts */}
        <div className="space-y-3">
          <div className="mono uppercase text-xs tracking-wider text-[var(--color-gray)] mb-4">
            Contacts
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 py-2 text-[var(--color-text)] hover:text-[var(--color-mint)] transition-colors group"
              >
                <Icon size={18} strokeWidth={1.5} />
                <span className="mono text-sm group-hover:underline">{link.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
