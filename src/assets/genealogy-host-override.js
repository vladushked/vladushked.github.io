/* Site-owned browser-host chrome. The frozen plugin bundle is never modified. */
(() => {
  // Hide only the workspace chrome; the same native controls and their handlers stay mounted.
  const style = document.createElement("style");
  style.textContent = ".native-header { display: none !important; }";
  document.head.append(style);
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
    button?.click();
  });
})();
