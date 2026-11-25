const DEFAULT_SITE_URL = "https://hasli4.github.io/raiting/";

const elements = {
  status: document.querySelector("#status"),
  actions: document.querySelector("#connectedActions"),
  settings: document.querySelector("#settings"),
  siteUrl: document.querySelector("#siteUrl"),
  supabaseUrl: document.querySelector("#supabaseUrl"),
  publishableKey: document.querySelector("#publishableKey"),
  connectSite: document.querySelector("#connectSite"),
  saveManual: document.querySelector("#saveManual"),
  openPdfViewer: document.querySelector("#openPdfViewer"),
  showOverlay: document.querySelector("#showOverlay"),
  hideOverlay: document.querySelector("#hideOverlay")
};

function normalizeSiteUrl(value) {
  const url = new URL(value);
  return url.href.endsWith("/") ? url.href : url.href + "/";
}

function setStatus(message, isError) {
  elements.status.textContent = message;
  elements.status.classList.toggle("is-error", Boolean(isError));
}

async function getConfig() {
  const stored = await chrome.storage.local.get(["classWorldConfig"]);
  return stored.classWorldConfig || null;
}

async function saveConfig(config) {
  await chrome.storage.local.set({ classWorldConfig: config });
}

async function setupFromSite() {
  const siteUrl = normalizeSiteUrl(elements.siteUrl.value || DEFAULT_SITE_URL);
  setStatus("Подключаюсь к сайту рейтинга…");
  const response = await chrome.runtime.sendMessage({
    type: "setup-from-site",
    siteUrl: siteUrl
  });
  if (!response?.ok) {
    setStatus(response?.error || "Не удалось получить настройки.", true);
    elements.settings.open = true;
    return;
  }
  await saveConfig(response.config);
  elements.siteUrl.value = response.config.siteUrl;
  elements.supabaseUrl.value = response.config.supabaseUrl;
  elements.publishableKey.value = response.config.publishableKey;
  await updateView();
}

async function saveManualConfig() {
  const supabaseUrl = elements.supabaseUrl.value.trim().replace(/\/$/, "");
  const publishableKey = elements.publishableKey.value.trim();
  if (!/^https:\/\/[^/]+\.supabase\.co$/i.test(supabaseUrl) || !publishableKey) {
    setStatus("Укажите корректный Supabase URL и Publishable key.", true);
    return;
  }
  await saveConfig({
    siteUrl: normalizeSiteUrl(elements.siteUrl.value || DEFAULT_SITE_URL),
    supabaseUrl: supabaseUrl,
    publishableKey: publishableKey,
    refreshSeconds: 2
  });
  await updateView();
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function showHeroes() {
  const tab = await getActiveTab();
  if (!tab?.id || !/^(https?|file):/i.test(tab.url || "")) {
    setStatus("Откройте веб- или локальную HTML-страницу.", true);
    return;
  }
  if (/^file:/i.test(tab.url || "")) {
    const fileAccessAllowed = await chrome.extension.isAllowedFileSchemeAccess();
    if (!fileAccessAllowed) {
      setStatus("Разрешите доступ к URL файлов в настройках расширения.", true);
      return;
    }
  }
  const response = await chrome.runtime.sendMessage({ type: "show-overlay", tabId: tab.id });
  if (!response?.ok) setStatus(response?.error || "Не удалось показать героев.", true);
  else setStatus("Герои показываются на этой вкладке.");
}

async function hideHeroes() {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  await chrome.tabs.sendMessage(tab.id, { type: "hide-overlay" }).catch(function () {});
  setStatus("Герои скрыты на этой вкладке.");
}

async function openPdfViewer() {
  const response = await chrome.runtime.sendMessage({ type: "open-pdf-viewer" });
  if (!response?.ok) setStatus(response?.error || "Не удалось открыть просмотрщик PDF.", true);
}

async function updateView() {
  const config = await getConfig();
  elements.siteUrl.value = config?.siteUrl || DEFAULT_SITE_URL;
  elements.supabaseUrl.value = config?.supabaseUrl || "";
  elements.publishableKey.value = config?.publishableKey || "";
  elements.actions.hidden = !config;
  if (config) {
    setStatus("Рейтинг подключён. Можно открыть героев на вкладке.");
  } else {
    setStatus("Подключите расширение к сайту рейтинга.");
    elements.settings.open = true;
  }
}

elements.connectSite.addEventListener("click", function () {
  setupFromSite().catch(function (error) {
    setStatus("Ошибка подключения: " + error.message, true);
  });
});
elements.saveManual.addEventListener("click", saveManualConfig);
elements.openPdfViewer.addEventListener("click", openPdfViewer);
elements.showOverlay.addEventListener("click", showHeroes);
elements.hideOverlay.addEventListener("click", hideHeroes);

updateView();

