import { useLanguage } from "../../i18n";

export function LanguageSwitch() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div className="ps-language-switch" role="group" aria-label={t("language")}>
      {(["ru", "en"] as const).map((option) => (
        <button
          key={option}
          type="button"
          lang={option}
          aria-label={option === "ru" ? "Русский" : "English"}
          aria-pressed={language === option}
          onClick={() => setLanguage(option)}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
