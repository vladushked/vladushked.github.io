import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "ru" | "en";

const messages = {
  ru: {
    name: "Владислав Плотников",
    role: "Техлид в робототехнике",
    projects: "Проекты",
    blog: "Блог",
    consult: "Консультации",
    resume: "Резюме",
    more: "далее",
    home: "На главную",
    allPosts: "Все публикации",
    backNavigation: "Навигация назад",
    skipContent: "К содержимому",
    language: "Язык интерфейса",
    socialLinks: "Контакты",
    email: "почта",
    aboutAuthor: "Об авторе",
    filters: "Фильтры",
    topicFilter: "Фильтр по темам",
    all: "Все",
    emptyTopics: "По этим темам пока ничего нет.",
    emptyPosts: "Здесь пока нет публикаций.",
    experienceDetails: "Подробнее об опыте",
    messageTelegram: "Написать в Telegram",
    viewExperience: "Посмотреть опыт",
    visitChannel: "Перейти в канал",
    roboticsConsulting: "Консультации по робототехнике",
    pageNotFound: "Страница не найдена.",
    notFoundHelp: "Вернуться на главную страницу",
    loadingDemo: "Загрузка интерактивного демо…",
    demoLoadFailed: "Не удалось загрузить демонстрацию.",
    retry: "Попробовать снова",
    projectMedia: "Медиа проекта",
    video: "Видео",
    openVideo: "Открыть видео",
    codeExample: "Пример кода",
    copy: "Копировать",
    copied: "Скопировано",
    copyFailed: "Не удалось скопировать. Выделите код вручную.",
  },
  en: {
    name: "Vladislav Plotnikov",
    role: "Robotics Tech Lead",
    projects: "Projects",
    blog: "Blog",
    consult: "Consulting",
    resume: "CV",
    more: "more",
    home: "Home",
    allPosts: "All posts",
    backNavigation: "Back navigation",
    skipContent: "Skip to content",
    language: "Interface language",
    socialLinks: "Contact links",
    email: "email",
    aboutAuthor: "About the author",
    filters: "Filters",
    topicFilter: "Filter by topic",
    all: "All",
    emptyTopics: "No items match these topics yet.",
    emptyPosts: "No posts yet.",
    experienceDetails: "More about this role",
    messageTelegram: "Message on Telegram",
    viewExperience: "View experience",
    visitChannel: "Visit the channel",
    roboticsConsulting: "Robotics consulting",
    pageNotFound: "Page not found.",
    notFoundHelp: "Return to the homepage",
    loadingDemo: "Loading the interactive demo…",
    demoLoadFailed: "The demo could not be loaded.",
    retry: "Try again",
    projectMedia: "Project media",
    video: "Video",
    openVideo: "Open video",
    codeExample: "Code example",
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Could not copy. Select the code manually.",
  },
} as const;

type MessageKey = keyof typeof messages.ru;
const STORAGE_KEY = "site-language";
const LanguageContext = createContext({
  language: "ru" as Language,
  setLanguage: (_language: Language) => {},
  t: (key: MessageKey): string => messages.ru[key],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "ru";
    } catch {
      return "ru";
    }
  });
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // The current selection still works when browser storage is unavailable.
    }
  }, [language]);
  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: MessageKey): string => messages[language][key],
    }),
    [language],
  );
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

const topicLabels: Record<string, { ru: string; en: string }> = {
  выступление: { ru: "выступление", en: "Talks" },
  соревнование: { ru: "соревнование", en: "Competitions" },
  родословная: { ru: "родословная", en: "Genealogy" },
};
export function topicLabel(topic: string, language: Language) {
  return topicLabels[topic]?.[language] ?? topic;
}

const countForms = {
  posts: { one: "публикация", few: "публикации", many: "публикаций" },
  projects: { one: "проект", few: "проекта", many: "проектов" },
};
const russianPlurals = new Intl.PluralRules("ru");
export function formatCount(
  count: number,
  noun: "posts" | "projects",
  language: Language,
) {
  if (language === "en") {
    const singular = noun === "posts" ? "post" : "project";
    return `${count} ${count === 1 ? singular : noun}`;
  }
  const forms = countForms[noun];
  return `${count} ${forms[russianPlurals.select(count) as keyof typeof forms] ?? forms.many}`;
}
