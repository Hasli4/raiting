(() => {
  "use strict";

  const COURSE_ROOT = "/d:/work/it/web_reps/python-study-top/";

  function localPath(url) {
    return decodeURIComponent(url.pathname).replaceAll("\\", "/").toLocaleLowerCase();
  }

  function isCoursePage() {
    return location.protocol === "file:" && localPath(new URL(location.href)).startsWith(COURSE_ROOT);
  }

  function isPdfLink(url) {
    return url.protocol === "file:" && url.pathname.toLocaleLowerCase().endsWith(".pdf");
  }

  function findLink(target) {
    return target instanceof Element ? target.closest("a[href]") : null;
  }

  if (!isCoursePage()) return;

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = findLink(event.target);
    if (!link || link.hasAttribute("download")) return;

    let pdfUrl;
    try {
      pdfUrl = new URL(link.getAttribute("href"), location.href);
    } catch (error) {
      return;
    }
    if (!isPdfLink(pdfUrl)) return;

    event.preventDefault();
    chrome.runtime.sendMessage({ type: "open-course-pdf", pdfUrl: pdfUrl.href }, function (response) {
      if (chrome.runtime.lastError || !response?.ok) {
        const reason = response?.error || "Не удалось открыть PDF в просмотрщике «Герои урока».";
        window.alert(reason);
      }
    });
  }, true);
})();
