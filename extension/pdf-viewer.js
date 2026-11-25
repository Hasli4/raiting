const elements = {
  file: document.querySelector("#pdfFile"),
  choose: document.querySelector("#choosePdf"),
  chooseEmpty: document.querySelector("#choosePdfEmpty"),
  embed: document.querySelector("#pdfEmbed"),
  empty: document.querySelector("#emptyState"),
  toggleHeroes: document.querySelector("#toggleHeroes"),
  toggleFullscreen: document.querySelector("#toggleFullscreen")
};

const state = { objectUrl: null, heroesVisible: true };
const suppliedPdfUrl = new URLSearchParams(location.search).get("file");

function fileNameFromUrl(value) {
  const url = new URL(value);
  const parts = url.pathname.split("/");
  return decodeURIComponent(parts[parts.length - 1]) || "Презентация.pdf";
}

function choosePdf() {
  elements.file.click();
}

function showFileAccessHelp(message) {
  const help = document.querySelector("#fileAccessHelp");
  help.textContent = message;
  help.hidden = false;
  elements.embed.hidden = true;
  elements.empty.hidden = false;
}

function clearFileAccessHelp() {
  const help = document.querySelector("#fileAccessHelp");
  help.hidden = true;
  help.textContent = "";
}

function checkFileSchemeAccess() {
  if (!globalThis.chrome?.extension?.isAllowedFileSchemeAccess) return;
  chrome.extension.isAllowedFileSchemeAccess(function (allowed) {
    if (!allowed) {
      showFileAccessHelp("Чтобы автоматически открывать PDF со страниц курса, включите для «Героев урока» «Разрешить доступ к URL файлов» / Allow access to file URLs в chrome://extensions или edge://extensions.");
    }
  });
}

function displayPdf(blob, name) {
  if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
  state.objectUrl = URL.createObjectURL(blob);
  elements.embed.src = state.objectUrl;
  elements.embed.hidden = false;
  elements.empty.hidden = true;
  clearFileAccessHelp();
  document.title = name + " — PDF с героями";
}

function loadPdf(file) {
  if (!file) return;
  if (file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    window.alert("Выберите файл в формате PDF.");
    return;
  }
  displayPdf(file, file.name);
}

async function loadLocalPdfFromUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch (error) {
    return;
  }
  if (url.protocol !== "file:" || !url.pathname.toLocaleLowerCase().endsWith(".pdf")) return;

  try {
    const response = await fetch(url.href);
    if (!response.ok) throw new Error("Файл не найден");
    const blob = await response.blob();
    displayPdf(blob, fileNameFromUrl(url.href));
  } catch (error) {
    showFileAccessHelp("Не удалось открыть локальный PDF. Проверьте, что файл существует, а в chrome://extensions или edge://extensions для «Героев урока» включено «Разрешить доступ к URL файлов» / Allow access to file URLs.");
  }
}

function setHeroesVisible(visible) {
  state.heroesVisible = visible;
  const overlay = window.__classWorldOverlay;
  if (overlay) {
    if (visible) overlay.show();
    else overlay.hide();
  }
  elements.toggleHeroes.textContent = visible ? "Скрыть героев" : "Показать героев";
  elements.toggleHeroes.setAttribute("aria-pressed", String(visible));
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch (error) {
    window.alert("Браузер не смог включить полноэкранный режим.");
  }
}

function updateFullscreenButton() {
  const isFullscreen = Boolean(document.fullscreenElement);
  elements.toggleFullscreen.textContent = isFullscreen ? "Выйти из полного экрана" : "Во весь экран";
  elements.toggleFullscreen.setAttribute("aria-pressed", String(isFullscreen));
}

elements.choose.addEventListener("click", choosePdf);
elements.chooseEmpty.addEventListener("click", choosePdf);
elements.file.addEventListener("change", function () {
  loadPdf(elements.file.files && elements.file.files[0]);
});
elements.toggleHeroes.addEventListener("click", function () {
  setHeroesVisible(!state.heroesVisible);
});
elements.toggleFullscreen.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", updateFullscreenButton);
window.addEventListener("beforeunload", function () {
  if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
});

checkFileSchemeAccess();
if (suppliedPdfUrl) loadLocalPdfFromUrl(suppliedPdfUrl);
