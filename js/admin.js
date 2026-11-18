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
  { min: 0, max: 4, title: "Путешественник", mood: "curious" },
  { min: 5, max: 14, title: "Исследователь", mood: "happy" },
  { min: 15, max: 29, title: "Знаток", mood: "proud" },
  { min: 30, max: 49, title: "Мастер", mood: "cool" },
  { min: 50, max: Infinity, title: "Легенда", mood: "legend" }
];

const config = window.CLASS_WORLD_CONFIG || {};
const elements = {
  classTitle: document.querySelector("#classTitle"),
  loginView: document.querySelector("#loginView"),
  adminView: document.querySelector("#adminView"),
  loginForm: document.querySelector("#loginForm"),
  loginEmail: document.querySelector("#loginEmail"),
  loginPassword: document.querySelector("#loginPassword"),
  loginMessage: document.querySelector("#loginMessage"),
  signOut: document.querySelector("#signOut"),
  studentForm: document.querySelector("#studentForm"),
  studentName: document.querySelector("#studentName"),
  studentAvatar: document.querySelector("#studentAvatar"),
  studentColor: document.querySelector("#studentColor"),
  studentMessage: document.querySelector("#studentMessage"),
  studentSearch: document.querySelector("#studentSearch"),
  adminRoster: document.querySelector("#adminRoster"),
  adminCount: document.querySelector("#adminCount")
};

const state = {
  client: null,
  backendReady: false,
  students: [],
  isAdmin: false,
  search: ""
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
  if (mood === "legend") return '<path d="M34 53 Q45 64 56 53" stroke="#17332b" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M28 39 l5 -5 l5 5 M52 39 l5 -5 l5 5" stroke="#17332b" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  if (mood === "cool") return '<path d="M25 39 h17 v8 H25z M48 39 h17 v8 H48z M42 43 h6" stroke="#17332b" stroke-width="2.6" fill="#fff7d0" stroke-linejoin="round"/><path d="M37 56 Q45 61 53 56" stroke="#17332b" stroke-width="3" fill="none" stroke-linecap="round"/>';
  if (mood === "proud") return '<circle cx="34" cy="42" r="3" fill="#17332b"/><circle cx="56" cy="42" r="3" fill="#17332b"/><path d="M37 53 Q45 61 54 52" stroke="#17332b" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
  if (mood === "happy") return '<path d="M29 42 q5 5 10 0 M51 42 q5 5 10 0" stroke="#17332b" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M37 52 Q45 64 54 52" stroke="#17332b" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
  return '<circle cx="34" cy="42" r="3" fill="#17332b"/><circle cx="56" cy="42" r="3" fill="#17332b"/><path d="M39 54 Q45 57 51 54" stroke="#17332b" stroke-width="3" fill="none" stroke-linecap="round"/>';
}

function crownSvg(mood) {
  if (mood === "legend") return '<path d="M28 24 l7 7 10-13 10 13 7-7 3 17H25z" fill="#ffd15b" stroke="#a66a23" stroke-width="2"/>';
  if (mood === "cool") return '<path d="M31 24 Q45 13 59 24" fill="none" stroke="#ffe16c" stroke-width="4" stroke-linecap="round"/>';
  if (mood === "proud") return '<path d="M31 25 Q45 14 59 25" fill="none" stroke="#fff2a7" stroke-width="4" stroke-linecap="round"/>';
  return "";
}

function animalSvg(student) {
  const color = COLORS.find(function (item) { return item.id === student.color; }) || COLORS[0];
  const level = getLevel(Number(student.score));
  const face = emotionSvg(level.mood);
  const crown = crownSvg(level.mood);
  const start = '<svg viewBox="0 0 90 100" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">';
  const end = "</svg>";
  const body = color.primary;
  const accent = color.accent;
  const dark = color.dark;

  if (student.avatar_id === "owl") {
    return start + '<ellipse cx="45" cy="61" rx="29" ry="33" fill="' + body + '"/><path d="M21 37 l8-22 13 14 3-14 14-1 9 23" fill="' + dark + '"/><circle cx="34" cy="43" r="13" fill="' + accent + '"/><circle cx="56" cy="43" r="13" fill="' + accent + '"/><circle cx="34" cy="43" r="4.5" fill="#17332b"/><circle cx="56" cy="43" r="4.5" fill="#17332b"/><path d="M40 50 l5 8 5-8z" fill="#f4b554"/><path d="M22 62 Q10 76 24 80 M68 62 Q80 76 66 80" stroke="' + dark + '" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M35 76 Q45 82 55 76" stroke="' + dark + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>' + crown + end;
  }
  if (student.avatar_id === "capybara") {
    return start + '<ellipse cx="45" cy="65" rx="33" ry="25" fill="' + body + '"/><circle cx="31" cy="43" r="7" fill="' + dark + '"/><circle cx="59" cy="43" r="7" fill="' + dark + '"/><ellipse cx="45" cy="48" rx="25" ry="23" fill="' + body + '"/><ellipse cx="45" cy="54" rx="13" ry="9" fill="' + accent + '"/><circle cx="34" cy="45" r="3" fill="#17332b"/><circle cx="56" cy="45" r="3" fill="#17332b"/><path d="M40 53 q5 3 10 0" stroke="' + dark + '" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M24 80 v7 M65 80 v7" stroke="' + dark + '" stroke-width="7" stroke-linecap="round"/>' + crown + end;
  }
  if (student.avatar_id === "cat") {
    return start + '<path d="M19 46 l2-31 19 14 11-14 18 28v36H20z" fill="' + body + '"/><path d="M24 23 l3 15 9-8 M62 23 l-3 15-9-8" fill="' + accent + '"/><ellipse cx="45" cy="55" rx="24" ry="20" fill="' + body + '"/>' + face + '<path d="M22 54 h14 M54 54 h14 M21 60 h14 M55 60 h14" stroke="' + dark + '" stroke-width="2.3" stroke-linecap="round"/><path d="M28 75 Q17 86 8 80" stroke="' + body + '" stroke-width="10" fill="none" stroke-linecap="round"/>' + crown + end;
  }
  if (student.avatar_id === "panda") {
    return start + '<circle cx="26" cy="31" r="12" fill="#273d39"/><circle cx="64" cy="31" r="12" fill="#273d39"/><ellipse cx="45" cy="61" rx="31" ry="32" fill="' + body + '"/><ellipse cx="45" cy="48" rx="25" ry="24" fill="#fffdf2"/><ellipse cx="32" cy="42" rx="9" ry="11" fill="#273d39"/><ellipse cx="58" cy="42" rx="9" ry="11" fill="#273d39"/><circle cx="34" cy="43" r="2.5" fill="#fff"/><circle cx="56" cy="43" r="2.5" fill="#fff"/><ellipse cx="45" cy="52" rx="5" ry="3" fill="#273d39"/><path d="M38 58 Q45 64 52 58" stroke="#273d39" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M18 65 Q8 72 17 82 M72 65 Q82 72 73 82" stroke="#273d39" stroke-width="10" fill="none" stroke-linecap="round"/>' + crown + end;
  }
  return start + '<path d="M24 46 l5-31 16 16 16-16 5 31v33H24z" fill="' + body + '"/><path d="M31 25 l3 14 8-8 M59 25 l-3 14-8-8" fill="' + accent + '"/><ellipse cx="45" cy="57" rx="24" ry="22" fill="' + body + '"/>' + face + '<ellipse cx="45" cy="51" rx="4" ry="3" fill="' + dark + '"/><path d="M25 64 Q8 70 10 88 Q22 91 28 78" fill="' + accent + '" stroke="' + dark + '" stroke-width="3"/><path d="M29 79 v8 M61 79 v8" stroke="' + dark + '" stroke-width="7" stroke-linecap="round"/>' + crown + end;
}

function selectOptions(items, selectedId) {
  return items.map(function (item) {
    return '<option value="' + item.id + '"' + (item.id === selectedId ? " selected" : "") + '>' + item.label + "</option>";
  }).join("");
}

function setMessage(element, message, success) {
  element.textContent = message || "";
  element.classList.toggle("is-success", Boolean(message && success));
}

function showLogin(message) {
  state.isAdmin = false;
  elements.loginView.hidden = false;
  elements.adminView.hidden = true;
  elements.signOut.hidden = true;
  setMessage(elements.loginMessage, message || "", false);
}

function renderRoster() {
  if (!state.isAdmin) return;
  const students = state.students.slice().sort(function (a, b) {
    return a.display_name.localeCompare(b.display_name, "ru");
  });
  const query = state.search.trim().toLocaleLowerCase("ru");
  const filtered = students.filter(function (student) {
    return !query || student.display_name.toLocaleLowerCase("ru").includes(query);
  });
  elements.adminCount.textContent = query ? filtered.length + " из " + students.length : students.length + " " + scoreWord(students.length);
  const head = '<div class="admin-list__head"><span>Герой</span><span>Имя</span><span>Животное</span><span>Цвет</span><span>Баллы</span><span>Действия</span></div>';
  const rows = filtered.map(function (student) {
    const label = escapeHtml(student.display_name);
    return '<article class="admin-person" data-student-id="' + student.id + '" data-current-score="' + Number(student.score) + '">' +
      '<div class="admin-person__animal">' + animalSvg(student) + '</div>' +
      '<input class="admin-person__name" data-name maxlength="28" value="' + label + '" aria-label="Имя героя ' + label + '" />' +
      '<select data-avatar aria-label="Животное героя ' + label + '">' + selectOptions(AVATARS, student.avatar_id) + '</select>' +
      '<select data-color aria-label="Цвет героя ' + label + '">' + selectOptions(COLORS, student.color) + '</select>' +
      '<input class="admin-person__score" data-score-value type="number" min="0" max="10000" value="' + Number(student.score) + '" inputmode="numeric" aria-label="Баллы героя ' + label + '" />' +
      '<div class="admin-person__actions">' +
      '<button class="admin-action admin-action--small admin-action--minus" data-change="-1" type="button" aria-label="Убрать балл">−</button>' +
      '<button class="admin-action admin-action--small" data-change="1" type="button" aria-label="Добавить балл">+</button>' +
      '<button class="admin-action" data-save type="button">Сохранить</button>' +
      '<button class="admin-action admin-action--small admin-action--delete" data-delete type="button" aria-label="Удалить героя">×</button>' +
      "</div></article>";
  }).join("");
  elements.adminRoster.innerHTML = head + (rows || '<p class="admin-list__empty">' + (query ? "Никого не найдено." : "Список пока пуст.") + "</p>");
}

async function loadStudents() {
  const result = await state.client
    .from("students")
    .select("id, display_name, avatar_id, color, score")
    .order("display_name", { ascending: true });
  if (result.error) {
    window.alert("Не удалось обновить список: " + result.error.message);
    return;
  }
  state.students = result.data || [];
  renderRoster();
}

async function checkAdmin() {
  const session = await state.client.auth.getSession();
  if (!session.data.session) {
    showLogin();
    return false;
  }
  const result = await state.client.rpc("admin_me");
  if (result.error || result.data !== true) {
    await state.client.auth.signOut();
    showLogin("У этого аккаунта нет доступа к панели учителя.");
    return false;
  }
  state.isAdmin = true;
  elements.loginView.hidden = true;
  elements.adminView.hidden = false;
  elements.signOut.hidden = false;
  await loadStudents();
  return true;
}

async function signIn(event) {
  event.preventDefault();
  setMessage(elements.loginMessage, "");
  const result = await state.client.auth.signInWithPassword({
    email: elements.loginEmail.value.trim(),
    password: elements.loginPassword.value
  });
  if (result.error) {
    setMessage(elements.loginMessage, "Не удалось войти. Проверьте e-mail и пароль.");
    return;
  }
  elements.loginPassword.value = "";
  await checkAdmin();
}

async function createStudent(event) {
  event.preventDefault();
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
  const result = await state.client.rpc("admin_change_score", {
    p_student_id: studentId,
    p_delta: delta,
    p_note: ""
  });
  if (result.error) window.alert("Не удалось изменить баллы: " + result.error.message);
  else await loadStudents();
}

async function saveStudent(row) {
  const studentId = row.dataset.studentId;
  const name = row.querySelector("[data-name]").value.trim();
  const avatarId = row.querySelector("[data-avatar]").value;
  const color = row.querySelector("[data-color]").value;
  const score = Number(row.querySelector("[data-score-value]").value);
  if (!Number.isInteger(score) || score < 0 || score > 10000) {
    window.alert("Баллы: целое число от 0 до 10 000.");
    return;
  }
  const update = await state.client.rpc("admin_update_student", {
    p_student_id: studentId,
    p_display_name: name,
    p_avatar_id: avatarId,
    p_color: color
  });
  if (update.error) {
    window.alert("Не удалось сохранить героя: " + update.error.message);
    return;
  }
  if (score !== Number(row.dataset.currentScore)) {
    const scoreResult = await state.client.rpc("admin_set_score", {
      p_student_id: studentId,
      p_score: score,
      p_note: ""
    });
    if (scoreResult.error) {
      window.alert("Внешний вид сохранён, но баллы не изменились: " + scoreResult.error.message);
      return;
    }
  }
  await loadStudents();
}

async function deleteStudent(row) {
  const name = row.querySelector("[data-name]").value.trim() || "этого героя";
  if (!window.confirm("Удалить «" + name + "»? История начислений этого героя тоже будет удалена.")) return;
  const result = await state.client.rpc("admin_remove_student", {
    p_student_id: row.dataset.studentId
  });
  if (result.error) window.alert("Не удалось удалить героя: " + result.error.message);
  else await loadStudents();
}

async function connect() {
  const url = String(config.supabaseUrl || "").trim();
  const key = String(config.supabasePublishableKey || config.supabaseAnonKey || "").trim();
  if (!url || !key) {
    showLogin("Сначала заполните app.config.js.");
    return;
  }
  try {
    const module = await import("https://esm.sh/@supabase/supabase-js@2");
    // Панель требует пароль при каждом новом открытии: сессия не сохраняется
    // в браузере после закрытия или перезагрузки этой страницы.
    state.client = module.createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: true }
    });
    state.backendReady = true;
    await checkAdmin();
    state.client
      .channel("class-world-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, function () {
        if (state.isAdmin) loadStudents();
      })
      .subscribe();
  } catch (error) {
    console.error(error);
    showLogin("Не удалось подключиться к базе. Проверьте настройки.");
  }
}

function wireEvents() {
  elements.loginForm.addEventListener("submit", signIn);
  elements.studentForm.addEventListener("submit", createStudent);
  elements.studentSearch.addEventListener("input", function () {
    state.search = elements.studentSearch.value;
    renderRoster();
  });
  elements.signOut.addEventListener("click", async function () {
    await state.client.auth.signOut();
    showLogin("Вы вышли из панели.");
  });
  elements.adminRoster.addEventListener("click", function (event) {
    const row = event.target.closest(".admin-person");
    if (!row) return;
    const change = event.target.closest("[data-change]");
    if (change) {
      changeScore(row.dataset.studentId, Number(change.dataset.change));
      return;
    }
    if (event.target.closest("[data-save]")) {
      saveStudent(row);
      return;
    }
    if (event.target.closest("[data-delete]")) deleteStudent(row);
  });
  elements.adminRoster.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && event.target.matches("[data-score-value]")) {
      event.preventDefault();
      saveStudent(event.target.closest(".admin-person"));
    }
  });
}

function start() {
  document.title = "Панель учителя · " + (config.classTitle || "Лес открытий");
  elements.classTitle.textContent = config.classTitle || "Лес открытий";
  elements.studentAvatar.innerHTML = selectOptions(AVATARS, AVATARS[0].id);
  elements.studentColor.innerHTML = selectOptions(COLORS, COLORS[0].id);
  wireEvents();
  connect();
}

start();

