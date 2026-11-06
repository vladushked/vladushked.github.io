/* Site-owned browser-host chrome. The frozen plugin bundle is never modified. */
(() => {
  // Hide only the workspace chrome; the same native controls and their handlers stay mounted.
  const style = document.createElement("style");
  style.textContent = ".native-header { display: none !important; }";
  document.head.append(style);
  // Use the native plugin's language API; person notes and the frozen bundle stay intact.
  window.addEventListener("message", async (event) => {
    if (
      event.source !== parent ||
      event.data?.type !== "genealogy-demo-language"
    ) return;
    const language = event.data.language;
    if (language !== "en" && language !== "ru") return;
    const plugin = window.__nativeGenealogy?.plugin;
    document.documentElement.lang = language;
    if (!plugin || plugin.settings.language === language) return;
    plugin.settings.language = language;
    await plugin.saveSettings();
    await plugin.languageChanged();
  });
  window.addEventListener("message", (event) => {
    if (
      event.source !== parent ||
      event.data?.type !== "genealogy-demo-command"
    )
      return;
    const runtime = window.__nativeGenealogy;
    if (!runtime?.plugin.hostActive) return;
    const labels = {
      settings: "Настройки учебного хранилища",
      reset: "Сбросить учебные данные",
    };
    const label = labels[event.data.command];
    if (!label) return;
    const button = [
      ...document.querySelectorAll(".native-host-actions button"),
    ].find((button) => button.getAttribute("aria-label") === label);
    // Reuse bootstrap.ts's genuine handlers, including its reset confirmation and reload.
    if (
      event.data.command !== "reset" ||
      document.documentElement.lang !== "en"
    ) {
      button?.click();
      return;
    }
    // The browser-host confirmation predates native localization. Keep its real decision flow.
    const confirm = window.confirm;
    window.confirm = () =>
      confirm.call(window, "Reset changes and restore the original fictional family?");
    try {
      button?.click();
    } finally {
      window.confirm = confirm;
    }
  });
})();
