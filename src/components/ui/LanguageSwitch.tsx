import { useLanguage } from "../../i18n";

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  const target = language === "ru" ? "en" : "ru";
  return (
    <button
      className="ps-language-switch"
      type="button"
      lang={target}
      aria-label={target === "en" ? "switch to english" : "переключить на русский"}
      onClick={() => setLanguage(target)}
    >
      {target === "en" ? "en" : "ру"}
    </button>
  );
}
