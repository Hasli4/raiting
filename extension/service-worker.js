const DEFAULT_SITE_URL = "https://hasli4.github.io/raiting/";
const COURSE_ROOT = "/d:/work/it/web_reps/python-study-top/";

async function getConfig() {
  const stored = await chrome.storage.local.get(["classWorldConfig"]);
  return stored.classWorldConfig || null;
}

function normalizeSiteUrl(value) {
  const url = new URL(value);
  return url.href.endsWith("/") ? url.href : url.href + "/";
}

function parseSiteConfig(source, siteUrl) {
  const urlMatch = source.match(/supabaseUrl\s*:\s*["']([^"']+)["']/);
  const keyMatch = source.match(/supabasePublishableKey\s*:\s*["']([^"']+)["']/)
    || source.match(/supabaseAnonKey\s*:\s*["']([^"']+)["']/);
  if (!urlMatch?.[1] || !keyMatch?.[1]) {
    throw new Error("На сайте не найдены публичные настройки Supabase.");
  }
  return {
    siteUrl: normalizeSiteUrl(siteUrl),
    supabaseUrl: urlMatch[1].replace(/\/$/, ""),
    publishableKey: keyMatch[1],
    refreshSeconds: 2
  };
}

async function getOrCreateConfig() {
  const storedConfig = await getConfig();
  if (storedConfig) return storedConfig;

  const response = await fetch(DEFAULT_SITE_URL + "app.config.js");
  if (!response.ok) throw new Error("Не удалось автоматически подключиться к рейтингу.");
  const config = parseSiteConfig(await response.text(), DEFAULT_SITE_URL);
  await chrome.storage.local.set({ classWorldConfig: config });
  return config;
}

async function fetchHeroes() {
  const config = await getOrCreateConfig();
  const response = await fetch(
    config.supabaseUrl + "/rest/v1/students?select=id,display_name,avatar_id,color,score,updated_at&score=gt.1&order=score.desc",
    {
      headers: {
        apikey: config.publishableKey,
        Authorization: "Bearer " + config.publishableKey
      }
    }
  );
  if (!response.ok) throw new Error("Supabase ответил с ошибкой " + response.status + ".");
  return response.json();
}

chrome.runtime.onInstalled.addListener(function () {
  getOrCreateConfig().catch(function () {
    // Настройки можно будет повторно получить кнопкой в окне расширения.
  });
});

async function showOverlay(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["overlay.js"]
    });
    await chrome.tabs.sendMessage(tabId, { type: "show-overlay" });
    return { ok: true };
  } catch (error) {
    const message = String(error?.message || "");
    if (message.includes("file")) {
      return { ok: false, error: "Разрешите расширению доступ к URL файлов." };
    }
    return { ok: false, error: "На этой странице нельзя показать героев." };
  }
}

function getCoursePdfUrl(value) {
  try {
    const url = new URL(value);
    const path = decodeURIComponent(url.pathname).replaceAll("\\", "/").toLocaleLowerCase();
    if (url.protocol !== "file:" || !path.startsWith(COURSE_ROOT) || !path.endsWith(".pdf")) return null;
    return url.href;
  } catch (error) {
    return null;
  }
}

async function openPdfViewer(pdfUrl) {
  try {
    const viewerUrl = new URL(chrome.runtime.getURL("pdf-viewer.html"));
    if (pdfUrl) viewerUrl.searchParams.set("file", pdfUrl);
    await chrome.tabs.create({ url: viewerUrl.href });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Не удалось открыть вкладку просмотрщика PDF." };
  }
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "setup-from-site") {
    fetch(normalizeSiteUrl(message.siteUrl) + "app.config.js")
      .then(function (response) {
        if (!response.ok) throw new Error("Не удалось открыть app.config.js.");
        return response.text();
      })
      .then(function (source) {
        sendResponse({ ok: true, config: parseSiteConfig(source, message.siteUrl) });
      })
      .catch(function (error) {
        sendResponse({ ok: false, error: error.message });
      });
    return true;
  }

  if (message.type === "fetch-heroes") {
    fetchHeroes()
      .then(function (heroes) { sendResponse({ ok: true, heroes: heroes }); })
      .catch(function (error) { sendResponse({ ok: false, error: error.message }); });
    return true;
  }

  if (message.type === "show-overlay") {
    showOverlay(message.tabId)
      .then(sendResponse);
    return true;
  }

  if (message.type === "open-pdf-viewer") {
    openPdfViewer()
      .then(sendResponse);
    return true;
  }

  if (message.type === "open-course-pdf") {
    const pdfUrl = getCoursePdfUrl(message.pdfUrl);
    if (!pdfUrl) {
      sendResponse({ ok: false, error: "Можно открыть только PDF из папки сайта курса." });
      return;
    }
    openPdfViewer(pdfUrl)
      .then(sendResponse);
    return true;
  }
});

