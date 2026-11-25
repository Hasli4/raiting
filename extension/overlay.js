(() => {
  if (window.__classWorldOverlay) {
    window.__classWorldOverlay.show();
    return;
  }

  const COLORS = {
    amber: { primary: "#ed9a55", accent: "#fff0c7", dark: "#8c4e2c" },
    mint: { primary: "#78bb9a", accent: "#dbf2cf", dark: "#2f6e57" },
    sky: { primary: "#75aed6", accent: "#d5f0f2", dark: "#32698f" },
    lilac: { primary: "#aa91cf", accent: "#eee2f6", dark: "#684d92" },
    coral: { primary: "#e97c70", accent: "#ffe0cb", dark: "#a64443" }
  };

  const LEVELS = [
    { min: 0, name: "Путешественник" },
    { min: 5, name: "Исследователь" },
    { min: 15, name: "Знаток" },
    { min: 30, name: "Мастер" },
    { min: 50, name: "Легенда" }
  ];

  const state = {
    root: null,
    stage: null,
    status: null,
    scores: new Map(),
    heroes: new Map(),
    positions: new Map(),
    started: false,
    pollTimer: null,
    moveTimer: null,
    firstLoad: true
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function levelIndex(score) {
    let result = 0;
    LEVELS.forEach(function (level, index) {
      if (Number(score) >= level.min) result = index;
    });
    return result;
  }

  function getScale(score) {
    return Math.min(1.38, 0.74 + Math.sqrt(Math.max(0, Number(score))) * 0.09);
  }

  function animalSvg(hero) {
    const color = COLORS[hero.color] || COLORS.amber;
    const body = color.primary;
    const accent = color.accent;
    const dark = color.dark;
    const open = '<svg viewBox="0 0 90 100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">';
    const face = '<circle cx="34" cy="44" r="3" fill="#17332b"/><circle cx="56" cy="44" r="3" fill="#17332b"/><path d="M38 55 Q45 61 52 55" stroke="#17332b" stroke-width="3.2" fill="none" stroke-linecap="round"/>';

    if (hero.avatar_id === "owl") {
      return open + '<ellipse cx="45" cy="63" rx="29" ry="31" fill="' + body + '"/><path d="M21 40 l8-23 13 14 3-14 14-1 9 24" fill="' + dark + '"/><circle cx="34" cy="45" r="13" fill="' + accent + '"/><circle cx="56" cy="45" r="13" fill="' + accent + '"/><circle cx="34" cy="45" r="4" fill="#17332b"/><circle cx="56" cy="45" r="4" fill="#17332b"/><path d="M40 52 l5 8 5-8z" fill="#f4b554"/><path d="M22 64 Q10 76 24 81 M68 64 Q80 76 66 81" stroke="' + dark + '" stroke-width="7" fill="none" stroke-linecap="round"/></svg>';
    }
    if (hero.avatar_id === "capybara") {
      return open + '<ellipse cx="45" cy="65" rx="33" ry="25" fill="' + body + '"/><circle cx="31" cy="43" r="7" fill="' + dark + '"/><circle cx="59" cy="43" r="7" fill="' + dark + '"/><ellipse cx="45" cy="49" rx="25" ry="23" fill="' + body + '"/><ellipse cx="45" cy="55" rx="13" ry="9" fill="' + accent + '"/>' + face + '<path d="M24 80 v7 M65 80 v7" stroke="' + dark + '" stroke-width="7" stroke-linecap="round"/></svg>';
    }
    if (hero.avatar_id === "cat") {
      return open + '<path d="M19 47 l2-31 19 14 11-14 18 28v36H20z" fill="' + body + '"/><path d="M24 24 l3 15 9-8 M62 24 l-3 15-9-8" fill="' + accent + '"/><ellipse cx="45" cy="56" rx="24" ry="20" fill="' + body + '"/>' + face + '<path d="M22 55 h14 M54 55 h14 M21 61 h14 M55 61 h14" stroke="' + dark + '" stroke-width="2.3" stroke-linecap="round"/><path d="M28 76 Q17 87 8 81" stroke="' + body + '" stroke-width="10" fill="none" stroke-linecap="round"/></svg>';
    }
    if (hero.avatar_id === "panda") {
      return open + '<circle cx="26" cy="31" r="12" fill="#273d39"/><circle cx="64" cy="31" r="12" fill="#273d39"/><ellipse cx="45" cy="62" rx="31" ry="31" fill="' + body + '"/><ellipse cx="45" cy="49" rx="25" ry="24" fill="#fffdf2"/><ellipse cx="32" cy="43" rx="9" ry="11" fill="#273d39"/><ellipse cx="58" cy="43" rx="9" ry="11" fill="#273d39"/><circle cx="34" cy="43" r="2.5" fill="#fff"/><circle cx="56" cy="43" r="2.5" fill="#fff"/><ellipse cx="45" cy="53" rx="5" ry="3" fill="#273d39"/><path d="M38 59 Q45 65 52 59" stroke="#273d39" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';
    }
    return open + '<path d="M24 47 l5-31 16 16 16-16 5 31v33H24z" fill="' + body + '"/><path d="M31 26 l3 14 8-8 M59 26 l-3 14-8-8" fill="' + accent + '"/><ellipse cx="45" cy="58" rx="24" ry="22" fill="' + body + '"/>' + face + '<ellipse cx="45" cy="52" rx="4" ry="3" fill="' + dark + '"/><path d="M25 65 Q8 71 10 89 Q22 92 28 79" fill="' + accent + '" stroke="' + dark + '" stroke-width="3"/><path d="M29 80 v7 M61 80 v7" stroke="' + dark + '" stroke-width="7" stroke-linecap="round"/></svg>';
  }

  async function installStyle(shadow) {
    const response = await fetch(chrome.runtime.getURL("overlay.css"));
    const style = document.createElement("style");
    style.textContent = await response.text();
    shadow.appendChild(style);
  }

  async function mount() {
    if (state.root) return;
    const root = document.createElement("div");
    root.id = "class-world-extension-root";
    const shadow = root.attachShadow({ mode: "open" });
    const overlay = document.createElement("div");
    overlay.className = "cw-overlay";
    const stage = document.createElement("div");
    const status = document.createElement("div");
    status.className = "cw-status";
    overlay.append(stage, status);
    shadow.append(overlay);
    document.documentElement.append(root);
    state.root = root;
    state.stage = stage;
    state.status = status;
    await installStyle(shadow);
  }

  function setStatus(message, visible) {
    state.status.textContent = message;
    state.status.classList.toggle("is-visible", Boolean(visible));
  }

  function createHeroElement(hero) {
    const element = document.createElement("div");
    element.className = "cw-hero";
    element.dataset.id = hero.id;
    element.innerHTML = '<div class="cw-hero__motion"><div class="cw-hero__animal">' + animalSvg(hero) + '</div><span class="cw-hero__label">' + escapeHtml(hero.display_name) + '<span class="cw-hero__points">· ' + hero.score + '</span></span></div>';
    state.stage.appendChild(element);
    state.heroes.set(hero.id, element);
    return element;
  }

  function updateHeroElement(element, hero) {
    const animal = element.querySelector(".cw-hero__animal");
    const label = element.querySelector(".cw-hero__label");
    animal.innerHTML = animalSvg(hero);
    label.innerHTML = escapeHtml(hero.display_name) + '<span class="cw-hero__points">· ' + hero.score + "</span>";
    element.style.setProperty("--hero-scale", getScale(hero.score));
  }

  function placeHeroes(heroes, isMoving) {
    const total = heroes.length;
    heroes.forEach(function (hero, index) {
      const element = state.heroes.get(hero.id);
      const base = total === 1 ? 50 : 6 + (index * 88) / (total - 1);
      const prior = state.positions.get(hero.id);
      const target = isMoving
        ? Math.max(5, Math.min(95, (prior === undefined ? base : prior) + (Math.random() * 18 - 9)))
        : base;
      state.positions.set(hero.id, target);
      element.style.left = target + "%";
    });
  }

  function celebrate(element, delta, isLevelUp) {
    const plus = document.createElement("span");
    plus.className = "cw-hero__plus";
    plus.textContent = "+" + delta;
    element.appendChild(plus);
    element.classList.add("is-celebrating");
    if (isLevelUp) element.classList.add("is-level-up");
    window.setTimeout(function () {
      plus.remove();
      element.classList.remove("is-celebrating", "is-level-up");
    }, 2400);
  }

  function render(heroes) {
    const activeIds = new Set(heroes.map(function (hero) { return hero.id; }));
    state.heroes.forEach(function (element, id) {
      if (!activeIds.has(id)) {
        element.remove();
        state.heroes.delete(id);
        state.positions.delete(id);
        state.scores.delete(id);
      }
    });

    heroes.forEach(function (hero) {
      const oldScore = state.scores.get(hero.id);
      const element = state.heroes.get(hero.id) || createHeroElement(hero);
      updateHeroElement(element, hero);
      if (!state.firstLoad && Number.isFinite(oldScore) && hero.score > oldScore) {
        celebrate(element, hero.score - oldScore, levelIndex(hero.score) > levelIndex(oldScore));
      }
      state.scores.set(hero.id, hero.score);
    });

    placeHeroes(heroes, false);
    state.firstLoad = false;
  }

  async function refresh() {
    try {
      const response = await chrome.runtime.sendMessage({ type: "fetch-heroes" });
      if (!response || !response.ok) throw new Error(response && response.error ? response.error : "Нет данных");
      render(response.heroes || []);
      setStatus(response.heroes && response.heroes.length ? "" : "Пока нет героев с 2+ баллами.", !response.heroes || !response.heroes.length);
    } catch (error) {
      const message = String(error && error.message ? error.message : "");
      setStatus(message || "Не удалось обновить героев.", true);
    }
  }

  function startMoving() {
    if (state.moveTimer) return;
    state.moveTimer = window.setInterval(function () {
      const heroes = Array.from(state.heroes.keys()).map(function (id) { return { id: id }; });
      placeHeroes(heroes, true);
    }, 4700);
  }

  async function show() {
    await mount();
    state.root.hidden = false;
    await refresh();
    if (!state.started) {
      state.started = true;
      state.pollTimer = window.setInterval(refresh, 2000);
      startMoving();
    }
  }

  function hide() {
    if (state.root) state.root.hidden = true;
  }

  chrome.runtime.onMessage.addListener(function (message) {
    if (message.type === "show-overlay") show();
    if (message.type === "hide-overlay") hide();
  });

  window.__classWorldOverlay = { show: show, hide: hide };
  show();
})();

