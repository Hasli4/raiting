const AVATARS = [
  { id: "fox", label: "Лиса" },
  { id: "owl", label: "Сова" },
  { id: "capybara", label: "Капибара" },
  { id: "cat", label: "Кот" },
  { id: "panda", label: "Панда" }
];

const COLORS = [
  { id: "amber", label: "Янтарный", primary: "#ed9a55", accent: "#fff0c7", dark: "#8c4e2c" },
  { id: "mint", label: "Мятный", primary: "#78bb9a", accent: "#dbf2cf", dark: "#2f6e57" },
  { id: "sky", label: "Небесный", primary: "#75aed6", accent: "#d5f0f2", dark: "#32698f" },
  { id: "lilac", label: "Сиреневый", primary: "#aa91cf", accent: "#eee2f6", dark: "#684d92" },
  { id: "coral", label: "Коралловый", primary: "#e97c70", accent: "#ffe0cb", dark: "#a64443" }
];

const LEVELS = [
  { min: 0, max: 4, title: "Путешественник", mood: "curious", soft: "#e6f2dc" },
  { min: 5, max: 14, title: "Исследователь", mood: "happy", soft: "#dceef0" },
  { min: 15, max: 29, title: "Знаток", mood: "proud", soft: "#f8ebc8" },
  { min: 30, max: 49, title: "Мастер", mood: "cool", soft: "#efe1f3" },
  { min: 50, max: Infinity, title: "Легенда", mood: "legend", soft: "#f9d9c6" }
];

const DEMO_STUDENTS = [
  { id: "demo-1", display_name: "Аня К.", avatar_id: "fox", color: "coral", score: 38, updated_at: "2026-11-18T08:00:00Z" },
  { id: "demo-2", display_name: "Миша Р.", avatar_id: "owl", color: "sky", score: 17, updated_at: "2026-11-17T08:00:00Z" },
  { id: "demo-3", display_name: "Соня Л.", avatar_id: "capybara", color: "amber", score: 8, updated_at: "2026-11-16T08:00:00Z" },
  { id: "demo-4", display_name: "Тимур С.", avatar_id: "cat", color: "mint", score: 51, updated_at: "2026-11-15T08:00:00Z" },
  { id: "demo-5", display_name: "Вика М.", avatar_id: "panda", color: "lilac", score: 3, updated_at: "2026-11-14T08:00:00Z" }
];

const config = window.CLASS_WORLD_CONFIG || {};
const elements = {
  animals: document.querySelector("#animals"),
  worldEmpty: document.querySelector("#worldEmpty"),
  worldHint: document.querySelector("#worldHint"),
  heroesCount: document.querySelector("#heroesCount"),
  pointsCount: document.querySelector("#pointsCount"),
  levels: document.querySelector("#levels"),
  classTitle: document.querySelector("#classTitle"),
  connectionStatus: document.querySelector("#connectionStatus"),
  aboutDialog: document.querySelector("#aboutDialog"),
  adminDialog: document.querySelector("#adminDialog"),
  heroDialog: document.querySelector("#heroDialog"),
  heroDialogContent: document.querySelector("#heroDialogContent"),
  loginView: document.querySelector("#loginView"),
  adminView: document.querySelector("#adminView"),
  loginForm: document.querySelector("#loginForm"),
  loginEmail: document.querySelector("#loginEmail"),
  loginPassword: document.querySelector("#loginPassword"),
  loginMessage: document.querySelector("#loginMessage"),
  studentForm: document.querySelector("#studentForm"),
  studentName: document.querySelector("#studentName"),
  studentAvatar: document.querySelector("#studentAvatar"),
  studentColor: document.querySelector("#studentColor"),
  studentMessage: document.querySelector("#studentMessage"),
  adminRoster: document.querySelector("#adminRoster"),
  adminCount: document.querySelector("#adminCount")
};

const state = {
  client: null,
  backendReady: false,
  students: [],
  selectedId: null,
  isAdmin: false,
  hinted: false
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function lookupAvatar(id) {
  return AVATARS.find(function (avatar) { return avatar.id === id; }) || AVATARS[0];
}

function lookupColor(id) {
  return COLORS.find(function (color) { return color.id === id; }) || COLORS[0];
}

function getLevel(score) {
  return LEVELS.find(function (level) { return score >= level.min && score <= level.max; }) || LEVELS[0];
}

function scoreWord(score) {
  const mod10 = score % 10;
  const mod100 = score % 100;
  if (mod10 === 1 && mod100 !== 11) return "балл";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "балла";
  return "баллов";
}

function emotionSvg(mood) {
  if (mood === "legend") {
    return '<path d="M34 53 Q45 64 56 53" stroke="#17332b" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M28 39 l5 -5 l5 5 M52 39 l5 -5 l5 5" stroke="#17332b" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  }
  if (mood === "cool") {
    return '<path d="M25 39 h17 v8 H25z M48 39 h17 v8 H48z M42 43 h6" stroke="#17332b" stroke-width="2.6" fill="#fff7d0" stroke-linejoin="round"/><path d="M37 56 Q45 61 53 56" stroke="#17332b" stroke-width="3" fill="none" stroke-linecap="round"/>';
  }
  if (mood === "proud") {
    return '<circle cx="34" cy="42" r="3" fill="#17332b"/><circle cx="56" cy="42" r="3" fill="#17332b"/><path d="M37 53 Q45 61 54 52" stroke="#17332b" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
  }
  if (mood === "happy") {
    return '<path d="M29 42 q5 5 10 0 M51 42 q5 5 10 0" stroke="#17332b" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M37 52 Q45 64 54 52" stroke="#17332b" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
  }
  return '<circle cx="34" cy="42" r="3" fill="#17332b"/><circle cx="56" cy="42" r="3" fill="#17332b"/><path d="M39 54 Q45 57 51 54" stroke="#17332b" stroke-width="3" fill="none" stroke-linecap="round"/>';
}

function crownSvg(mood) {
  if (mood === "legend") return '<path d="M28 24 l7 7 10-13 10 13 7-7 3 17H25z" fill="#ffd15b" stroke="#a66a23" stroke-width="2"/>';
  if (mood === "cool") return '<path d="M31 24 Q45 13 59 24" fill="none" stroke="#ffe16c" stroke-width="4" stroke-linecap="round"/>';
  if (mood === "proud") return '<path d="M31 25 Q45 14 59 25" fill="none" stroke="#fff2a7" stroke-width="4" stroke-linecap="round"/>';
  return "";
}

function animalSvg(student, compact) {
  const color = lookupColor(student.color);
  const level = getLevel(Number(student.score));
  const face = emotionSvg(level.mood);
  const crown = crownSvg(level.mood);
  const commonOpen = '<svg viewBox="0 0 90 100" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">';
  const commonClose = '</svg>';
  const body = color.primary;
  const accent = color.accent;
  const dark = color.dark;

  if (student.avatar_id === "owl") {
    return commonOpen +
      '<ellipse cx="45" cy="61" rx="29" ry="33" fill="' + body + '"/>' +
      '<path d="M21 37 l8-22 13 14 3-14 14-1 9 23" fill="' + dark + '"/>' +
      '<circle cx="34" cy="43" r="13" fill="' + accent + '"/><circle cx="56" cy="43" r="13" fill="' + accent + '"/>' +
      '<circle cx="34" cy="43" r="4.5" fill="#17332b"/><circle cx="56" cy="43" r="4.5" fill="#17332b"/>' +
      '<path d="M40 50 l5 8 5-8z" fill="#f4b554"/>' +
      '<path d="M22 62 Q10 76 24 80 M68 62 Q80 76 66 80" stroke="' + dark + '" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M35 76 Q45 82 55 76" stroke="' + dark + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      crown + commonClose;
  }

  if (student.avatar_id === "capybara") {
    return commonOpen +
      '<ellipse cx="45" cy="65" rx="33" ry="25" fill="' + body + '"/>' +
      '<circle cx="31" cy="43" r="7" fill="' + dark + '"/><circle cx="59" cy="43" r="7" fill="' + dark + '"/>' +
      '<ellipse cx="45" cy="48" rx="25" ry="23" fill="' + body + '"/>' +
      '<ellipse cx="45" cy="54" rx="13" ry="9" fill="' + accent + '"/>' +
      '<circle cx="34" cy="45" r="3" fill="#17332b"/><circle cx="56" cy="45" r="3" fill="#17332b"/>' +
      '<path d="M40 53 q5 3 10 0" stroke="' + dark + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M24 80 v7 M65 80 v7" stroke="' + dark + '" stroke-width="7" stroke-linecap="round"/>' +
      crown + commonClose;
  }

  if (student.avatar_id === "cat") {
    return commonOpen +
      '<path d="M19 46 l2-31 19 14 11-14 18 28v36H20z" fill="' + body + '"/>' +
      '<path d="M24 23 l3 15 9-8 M62 23 l-3 15-9-8" fill="' + accent + '"/>' +
      '<ellipse cx="45" cy="55" rx="24" ry="20" fill="' + body + '"/>' +
      face +
      '<path d="M22 54 h14 M54 54 h14 M21 60 h14 M55 60 h14" stroke="' + dark + '" stroke-width="2.3" stroke-linecap="round"/>' +
      '<path d="M28 75 Q17 86 8 80" stroke="' + body + '" stroke-width="10" fill="none" stroke-linecap="round"/>' +
      crown + commonClose;
  }

  if (student.avatar_id === "panda") {
    return commonOpen +
      '<circle cx="26" cy="31" r="12" fill="#273d39"/><circle cx="64" cy="31" r="12" fill="#273d39"/>' +
      '<ellipse cx="45" cy="61" rx="31" ry="32" fill="' + body + '"/>' +
      '<ellipse cx="45" cy="48" rx="25" ry="24" fill="#fffdf2"/>' +
      '<ellipse cx="32" cy="42" rx="9" ry="11" fill="#273d39"/><ellipse cx="58" cy="42" rx="9" ry="11" fill="#273d39"/>' +
      '<circle cx="34" cy="43" r="2.5" fill="#fff"/><circle cx="56" cy="43" r="2.5" fill="#fff"/>' +
      '<ellipse cx="45" cy="52" rx="5" ry="3" fill="#273d39"/>' +
      '<path d="M38 58 Q45 64 52 58" stroke="#273d39" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M18 65 Q8 72 17 82 M72 65 Q82 72 73 82" stroke="#273d39" stroke-width="10" fill="none" stroke-linecap="round"/>' +
      crown + commonClose;
  }

  return commonOpen +
    '<path d="M24 46 l5-31 16 16 16-16 5 31v33H24z" fill="' + body + '"/>' +
    '<path d="M31 25 l3 14 8-8 M59 25 l-3 14-8-8" fill="' + accent + '"/>' +
    '<ellipse cx="45" cy="57" rx="24" ry="22" fill="' + body + '"/>' +
    face +
    '<ellipse cx="45" cy="51" rx="4" ry="3" fill="' + dark + '"/>' +
    '<path d="M25 64 Q8 70 10 88 Q22 91 28 78" fill="' + accent + '" stroke="' + dark + '" stroke-width="3"/>' +
    '<path d="M29 79 v8 M61 79 v8" stroke="' + dark + '" stroke-width="7" stroke-linecap="round"/>' +
    crown + commonClose;
}

function renderLevels() {
  elements.levels.innerHTML = LEVELS.map(function (level, index) {
    const range = level.max === Infinity ? level.min + "+ баллов" : level.min + "–" + level.max + " баллов";
    return '<article class="level" style="--level-soft:' + level.soft + '">' +
      '<span class="level__number">0' + (index + 1) + '</span>' +
      '<span><strong>' + level.title + '</strong><small>Новая эмоция и образ героя</small></span>' +
      '<span class="level__range">' + range + '</span>' +
      '</article>';
  }).join("");
}

function buildSlots(count) {
  const desktop = [
    [15, 59], [30, 42], [47, 65], [65, 42], [80, 62], [21, 76],
    [39, 83], [58, 76], [74, 84], [12, 35], [51, 30], [88, 36],
    [32, 59], [68, 62], [45, 50], [23, 54], [83, 50], [56, 57]
  ];
  const slots = [];
  for (let index = 0; index < count; index += 1) {
    if (desktop[index]) {
      slots.push(desktop[index]);
    } else {
      const column = index % 5;
      const row = Math.floor(index / 5) % 4;
      slots.push([11 + column * 19 + (row % 2) * 4, 32 + row * 15]);
    }
  }
  return slots;
}

function renderWorld() {
  const students = state.students.slice().sort(function (a, b) {
    return Number(b.score) - Number(a.score) || a.display_name.localeCompare(b.display_name, "ru");
  });
  const slots = buildSlots(students.length);

  elements.worldEmpty.hidden = students.length > 0;
  elements.heroesCount.textContent = String(students.length);
  elements.pointsCount.textContent = String(students.reduce(function (sum, student) {
    return sum + Number(student.score || 0);
  }, 0));

  elements.animals.innerHTML = students.map(function (student, index) {
    const level = getLevel(Number(student.score));
    const slot = slots[index];
    const size = 1 + LEVELS.indexOf(level) * 0.075;
    const selected = student.id === state.selectedId ? " is-selected" : "";
    const driftX = (index % 2 === 0 ? 1 : -1) * (7 + (index % 3) * 4);
    const driftY = index % 3 === 0 ? -4 : 3;
    const label = escapeHtml(student.display_name);
    const description = label + ", " + level.title + ", " + student.score + " " + scoreWord(Number(student.score));
    return '<button class="creature' + selected + '" type="button" data-student-id="' + student.id + '" ' +
      'aria-label="' + description + '" style="left:' + slot[0] + '%;top:' + slot[1] + '%;--scale:' + size +
      ';--delay:-' + (index * 1.17) + 's;--duration:' + (4.3 + (index % 4) * .6) + 's;--drift-x:' + driftX + 'px;--drift-y:' + driftY + 'px">' +
      '<span class="creature__motion"><span class="creature__body">' + animalSvg(student) + '</span></span>' +
      '<span class="creature__label">' + label + '</span></button>';
  }).join("");
}

function renderAdminRoster() {
  if (!state.isAdmin) return;
  const sorted = state.students.slice().sort(function (a, b) {
    return Number(b.score) - Number(a.score) || a.display_name.localeCompare(b.display_name, "ru");
  });
  elements.adminCount.textContent = sorted.length + " " + scoreWord(sorted.length);
  elements.adminRoster.innerHTML = sorted.map(function (student) {
    return '<article class="admin-row">' +
      '<div class="admin-row__animal">' + animalSvg(student, true) + '</div>' +
      '<div><strong>' + escapeHtml(student.display_name) + '</strong><small>' + getLevel(Number(student.score)).title + " · " + student.score + " " + scoreWord(Number(student.score)) + '</small></div>' +
      '<div class="admin-row__actions">' +
      '<button class="score-button score-button--minus" data-score="-1" data-student-id="' + student.id + '" type="button" aria-label="Убрать один балл у ' + escapeHtml(student.display_name) + '">−</button>' +
      '<button class="score-button" data-score="1" data-student-id="' + student.id + '" type="button" aria-label="Добавить один балл ' + escapeHtml(student.display_name) + '">+</button>' +
      '</div></article>';
  }).join("") || '<p class="form-message">Пока никто не поселился в лесу.</p>';
}

function renderAll() {
  renderWorld();
  renderAdminRoster();
}

function setMessage(element, message, success) {
  element.textContent = message || "";
  element.classList.toggle("is-success", Boolean(success && message));
}

function showHero(studentId) {
  const student = state.students.find(function (item) { return item.id === studentId; });
  if (!student) return;
  state.selectedId = student.id;
  state.hinted = true;
  elements.worldHint.classList.add("is-hidden");
  renderWorld();

  const level = getLevel(Number(student.score));
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
  const start = level.min;
  const end = nextLevel ? nextLevel.min : level.min + 1;
  const progress = nextLevel ? Math.min(100, Math.round(((student.score - start) / (end - start)) * 100)) : 100;
  const remaining = nextLevel ? Math.max(0, nextLevel.min - student.score) : 0;
  const nextText = nextLevel ? "До уровня «" + nextLevel.title + "» — " + remaining + " " + scoreWord(remaining) : "Максимальный уровень открыт";
  const rank = state.students.slice().sort(function (a, b) { return b.score - a.score; }).findIndex(function (item) {
    return item.id === student.id;
  }) + 1;

  elements.heroDialogContent.innerHTML = '<section class="hero-profile">' +
    '<div class="hero-profile__animal">' + animalSvg(student) + '</div>' +
    '<p class="eyebrow">' + lookupAvatar(student.avatar_id).label + " · место " + rank + " из " + state.students.length + '</p>' +
    '<h2>' + escapeHtml(student.display_name) + '</h2>' +
    '<p class="hero-profile__level">' + level.title + '</p>' +
    '<div class="hero-profile__score"><strong>' + student.score + '</strong><small>' + scoreWord(Number(student.score)) + " опыта" + '</small></div>' +
    '<div class="hero-profile__progress"><p><span>' + nextText + '</span><span>' + progress + '%</span></p><div class="progress-bar"><span style="width:' + progress + '%"></span></div></div>' +
    '</section>';
  elements.heroDialog.showModal();
}

async function loadStudents() {
  if (!state.backendReady) {
    state.students = DEMO_STUDENTS.slice();
    renderAll();
    return;
  }
  const result = await state.client
    .from("students")
    .select("id, display_name, avatar_id, color, score, updated_at")
    .order("score", { ascending: false });
  if (result.error) {
    elements.connectionStatus.textContent = "Не удалось обновить мир";
    return;
  }
  state.students = result.data || [];
  renderAll();
}

function populateSelects() {
  elements.studentAvatar.innerHTML = AVATARS.map(function (avatar) {
    return '<option value="' + avatar.id + '">' + avatar.label + '</option>';
  }).join("");
  elements.studentColor.innerHTML = COLORS.map(function (color) {
    return '<option value="' + color.id + '">' + color.label + '</option>';
  }).join("");
}

function showLoginView(message) {
  state.isAdmin = false;
  elements.loginView.hidden = false;
  elements.adminView.hidden = true;
  setMessage(elements.loginMessage, message || "", false);
}

async function checkAdmin() {
  const sessionResult = await state.client.auth.getSession();
  if (!sessionResult.data.session) {
    showLoginView();
    return false;
  }
  const result = await state.client.rpc("admin_me");
  if (result.error || result.data !== true) {
    await state.client.auth.signOut();
    showLoginView("У этого аккаунта нет доступа к панели учителя.");
    return false;
  }
  state.isAdmin = true;
  elements.loginView.hidden = true;
  elements.adminView.hidden = false;
  renderAdminRoster();
  return true;
}

async function openAdmin() {
  elements.adminDialog.showModal();
  if (!state.backendReady) {
    showLoginView("Сначала подключите Supabase: инструкция есть в README.");
    return;
  }
  await checkAdmin();
}

async function connectBackend() {
  const url = String(config.supabaseUrl || "").trim();
  const key = String(config.supabasePublishableKey || config.supabaseAnonKey || "").trim();
  if (!url || !key) {
    elements.connectionStatus.textContent = "Демонстрационный мир";
    await loadStudents();
    return;
  }
  try {
    const module = await import("https://esm.sh/@supabase/supabase-js@2");
    state.client = module.createClient(url, key);
    state.backendReady = true;
    elements.connectionStatus.textContent = "Мир обновляется автоматически";
    await loadStudents();

    state.client
      .channel("class-world-students")
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, function () {
        loadStudents();
      })
      .subscribe();

    const refreshSeconds = Math.max(20, Number(config.refreshSeconds) || 45);
    window.setInterval(loadStudents, refreshSeconds * 1000);
  } catch (error) {
    console.error(error);
    elements.connectionStatus.textContent = "Демонстрационный мир";
    await loadStudents();
  }
}

async function signIn(event) {
  event.preventDefault();
  if (!state.backendReady) return;
  setMessage(elements.loginMessage, "");
  const email = elements.loginEmail.value.trim();
  const password = elements.loginPassword.value;
  const result = await state.client.auth.signInWithPassword({ email: email, password: password });
  if (result.error) {
    setMessage(elements.loginMessage, "Не удалось войти. Проверьте e-mail и пароль.");
    return;
  }
  const isAdmin = await checkAdmin();
  if (isAdmin) {
    elements.loginPassword.value = "";
    await loadStudents();
  }
}

async function createStudent(event) {
  event.preventDefault();
  if (!state.isAdmin) return;
  setMessage(elements.studentMessage, "");
  const result = await state.client.rpc("admin_create_student", {
    p_display_name: elements.studentName.value.trim(),
    p_avatar_id: elements.studentAvatar.value,
    p_color: elements.studentColor.value
  });
  if (result.error) {
    setMessage(elements.studentMessage, "Не удалось добавить героя: " + result.error.message);
    return;
  }
  elements.studentForm.reset();
  setMessage(elements.studentMessage, "Герой поселился в лесу.", true);
  await loadStudents();
}

async function changeScore(studentId, delta) {
  if (!state.isAdmin) return;
  const result = await state.client.rpc("admin_change_score", {
    p_student_id: studentId,
    p_delta: delta,
    p_note: ""
  });
  if (result.error) {
    window.alert("Не удалось изменить балл: " + result.error.message);
    return;
  }
  await loadStudents();
}

function wireEvents() {
  document.querySelector("#aboutOpen").addEventListener("click", function () {
    elements.aboutDialog.showModal();
  });
  document.querySelector("#adminOpen").addEventListener("click", openAdmin);
  document.querySelectorAll("[data-close]").forEach(function (button) {
    button.addEventListener("click", function () {
      const dialog = document.querySelector("#" + button.dataset.close);
      dialog.close();
    });
  });
  elements.animals.addEventListener("click", function (event) {
    const button = event.target.closest("[data-student-id]");
    if (button) showHero(button.dataset.studentId);
  });
  elements.loginForm.addEventListener("submit", signIn);
  elements.studentForm.addEventListener("submit", createStudent);
  document.querySelector("#signOut").addEventListener("click", async function () {
    await state.client.auth.signOut();
    showLoginView("Вы вышли из панели.");
  });
  elements.adminRoster.addEventListener("click", function (event) {
    const button = event.target.closest("[data-score][data-student-id]");
    if (button) changeScore(button.dataset.studentId, Number(button.dataset.score));
  });
}

async function start() {
  document.title = config.classTitle || "Лес открытий";
  elements.classTitle.textContent = config.classTitle || "Лес открытий";
  populateSelects();
  renderLevels();
  wireEvents();
  await connectBackend();
}

start();

