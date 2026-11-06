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
    role: "техлид в робототехнике",
    projects: "проекты",
    blog: "блог",
    consult: "консультации",
    resume: "резюме",
    more: "ещё",
    home: "на главную",
    allPosts: "все публикации",
    backNavigation: "навигация назад",
    skipContent: "к содержимому",
    language: "язык интерфейса",
    socialLinks: "контакты",
    email: "почта",
    aboutAuthor: "об авторе",
    filters: "фильтры",
    topicFilter: "фильтр по темам",
    all: "все",
    emptyTopics: "по этим темам пока ничего нет.",
    emptyPosts: "здесь пока нет публикаций.",
    experienceDetails: "подробнее об опыте",
    messageTelegram: "написать в telegram",
    viewExperience: "посмотреть опыт",
    visitChannel: "перейти в канал",
    roboticsConsulting: "консультации по робототехнике",
    pageNotFound: "страница не найдена.",
    notFoundHelp: "вернуться на главную страницу",
    loadingDemo: "загрузка интерактивного демо…",
    demoLoadFailed: "не удалось загрузить демонстрацию.",
    retry: "попробовать снова",
    projectMedia: "медиа проекта",
    video: "видео",
    openVideo: "открыть видео",
    codeExample: "пример кода",
    copy: "копировать",
    copied: "скопировано",
    copyFailed: "не удалось скопировать. выделите код вручную.",
  },
  en: {
    name: "Vladislav Plotnikov",
    role: "robotics tech lead",
    projects: "projects",
    blog: "blog",
    consult: "consulting",
    resume: "cv",
    more: "more",
    home: "home",
    allPosts: "all posts",
    backNavigation: "back navigation",
    skipContent: "skip to content",
    language: "interface language",
    socialLinks: "contact links",
    email: "email",
    aboutAuthor: "about the author",
    filters: "filters",
    topicFilter: "filter by topic",
    all: "all",
    emptyTopics: "no items match these topics yet.",
    emptyPosts: "no posts yet.",
    experienceDetails: "more about this role",
    messageTelegram: "message on telegram",
    viewExperience: "view experience",
    visitChannel: "visit the channel",
    roboticsConsulting: "robotics consulting",
    pageNotFound: "page not found.",
    notFoundHelp: "return to the homepage",
    loadingDemo: "loading the interactive demo…",
    demoLoadFailed: "the demo could not be loaded.",
    retry: "try again",
    projectMedia: "project media",
    video: "video",
    openVideo: "open video",
    codeExample: "code example",
    copy: "copy",
    copied: "copied",
    copyFailed: "could not copy. select the code manually.",
  },
} as const;

type MessageKey = keyof typeof messages.ru;
const STORAGE_KEY = "site-language-override";

function initialLanguage(): Language {
  const preferred =
    typeof navigator === "undefined"
      ? "en"
      : navigator.languages?.[0] || navigator.language || "en";
  const system = preferred.toLowerCase().startsWith("ru") ? "ru" : "en";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ru" || saved === "en") return saved;
  } catch {
    // Browser language still applies when storage is unavailable.
  }
  return system;
}
const LanguageContext = createContext({
  language: "ru" as Language,
  setLanguage: (_language: Language) => {},
  t: (key: MessageKey): string => messages.ru[key],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, changeLanguage] = useState<Language>(initialLanguage);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  const value = useMemo(
    () => ({
      language,
      setLanguage: (nextLanguage: Language) => {
        changeLanguage(nextLanguage);
        try {
          localStorage.setItem(STORAGE_KEY, nextLanguage);
        } catch {
          // The explicit selection still works for the current visit.
        }
      },
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
  выступление: { ru: "выступление", en: "talks" },
  соревнование: { ru: "соревнование", en: "competitions" },
  родословная: { ru: "родословная", en: "genealogy" },
};
export function topicLabel(topic: string, language: Language) {
  return topicLabels[topic]?.[language] ?? topic.toLocaleLowerCase(language);
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
