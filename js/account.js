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
  { min: 0, max: 4, title: "Путешественник" },
  { min: 5, max: 14, title: "Исследователь" },
  { min: 15, max: 29, title: "Знаток" },
  { min: 30, max: 49, title: "Мастер" },
  { min: 50, max: Infinity, title: "Легенда" }
];

const config = window.CLASS_WORLD_CONFIG || {};
const elements = {
  classTitle: document.querySelector("#classTitle"),
  authView: document.querySelector("#authView"),
  cabinetView: document.querySelector("#cabinetView"),
  loginForm: document.querySelector("#loginForm"),
  loginEmail: document.querySelector("#loginEmail"),
  loginPassword: document.querySelector("#loginPassword"),
  loginMessage: document.querySelector("#loginMessage"),
  passwordView: document.querySelector("#passwordView"),
  passwordForm: document.querySelector("#passwordForm"),
  newPassword: document.querySelector("#newPassword"),
  repeatPassword: document.querySelector("#repeatPassword"),
  passwordLead: document.querySelector("#passwordLead"),
  passwordMessage: document.querySelector("#passwordMessage"),
  changePassword: document.querySelector("#changePassword"),
  signOut: document.querySelector("#signOut"),
  studentName: document.querySelector("#studentName"),
  accountEmail: document.querySelector("#accountEmail"),
  characterPreview: document.querySelector("#characterPreview"),
  characterLevel: document.querySelector("#characterLevel"),
  avatarChoices: document.querySelector("#avatarChoices"),
  colorChoices: document.querySelector("#colorChoices"),
  characterForm: document.querySelector("#characterForm"),
  characterMessage: document.querySelector("#characterMessage"),
  studentScore: document.querySelector("#studentScore"),
  progressText: document.querySelector("#progressText"),
  progressPercent: document.querySelector("#progressPercent"),
  progressBar: document.querySelector("#progressBar"),
  nextLevelText: document.querySelector("#nextLevelText"),
  walletBalance: document.querySelector("#walletBalance"),
  shopList: document.querySelector("#shopList")
};

const state = {
  client: null,
  student: null,
  session: null,
  selectedAvatar: "fox",
  selectedColor: "amber",
  needsPasswordSetup: false
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function scoreWord(score) {
  const mod10 = score % 10;
  const mod100 = score % 100;
  if (mod10 === 1 && mod100 !== 11) return "балл";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "балла";
  return "баллов";
}

function getLevel(score) {
  return LEVELS.find(function (level) { return score >= level.min && score <= level.max; }) || LEVELS[0];
}

function animalSvg(student) {
  const color = COLORS.find(function (item) { return item.id === student.color; }) || COLORS[0];
  const level = getLevel(Number(student.score));
  const body = color.primary;
  const accent = color.accent;
  const dark = color.dark;
  const face = level.title === "Легенда"
    ? '<path d="M35 54 Q45 65 55 54" stroke="#17332b" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M28 39 l5 -5 l5 5 M52 39 l5 -5 l5 5" stroke="#17332b" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    : level.title === "Мастер"
      ? '<path d="M25 39 h17 v8 H25z M48 39 h17 v8 H48z M42 43 h6" stroke="#17332b" stroke-width="2.6" fill="#fff7d0" stroke-linejoin="round"/><path d="M37 56 Q45 61 53 56" stroke="#17332b" stroke-width="3" fill="none" stroke-linecap="round"/>'
      : '<circle cx="34" cy="42" r="3" fill="#17332b"/><circle cx="56" cy="42" r="3" fill="#17332b"/><path d="M38 54 Q45 61 52 54" stroke="#17332b" stroke-width="3" fill="none" stroke-linecap="round"/>';
  const crown = level.title === "Легенда"
    ? '<path d="M28 24 l7 7 10-13 10 13 7-7 3 17H25z" fill="#ffd15b" stroke="#a66a23" stroke-width="2"/>'
    : level.title === "Мастер"
      ? '<path d="M31 25 Q45 14 59 25" fill="none" stroke="#ffe16c" stroke-width="4" stroke-linecap="round"/>'
      : "";
  const open = '<svg viewBox="0 0 90 100" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">';

  if (student.avatar_id === "owl") {
    return open + '<ellipse cx="45" cy="61" rx="29" ry="33" fill="' + body + '"/><path d="M21 37 l8-22 13 14 3-14 14-1 9 23" fill="' + dark + '"/><circle cx="34" cy="43" r="13" fill="' + accent + '"/><circle cx="56" cy="43" r="13" fill="' + accent + '"/><circle cx="34" cy="43" r="4.5" fill="#17332b"/><circle cx="56" cy="43" r="4.5" fill="#17332b"/><path d="M40 50 l5 8 5-8z" fill="#f4b554"/><path d="M22 62 Q10 76 24 80 M68 62 Q80 76 66 80" stroke="' + dark + '" stroke-width="7" fill="none" stroke-linecap="round"/>' + crown + '</svg>';
  }
  if (student.avatar_id === "capybara") {
    return open + '<ellipse cx="45" cy="65" rx="33" ry="25" fill="' + body + '"/><circle cx="31" cy="43" r="7" fill="' + dark + '"/><circle cx="59" cy="43" r="7" fill="' + dark + '"/><ellipse cx="45" cy="48" rx="25" ry="23" fill="' + body + '"/><ellipse cx="45" cy="54" rx="13" ry="9" fill="' + accent + '"/>' + face + '<path d="M24 80 v7 M65 80 v7" stroke="' + dark + '" stroke-width="7" stroke-linecap="round"/>' + crown + '</svg>';
  }
  if (student.avatar_id === "cat") {
    return open + '<path d="M19 46 l2-31 19 14 11-14 18 28v36H20z" fill="' + body + '"/><path d="M24 23 l3 15 9-8 M62 23 l-3 15-9-8" fill="' + accent + '"/><ellipse cx="45" cy="55" rx="24" ry="20" fill="' + body + '"/>' + face + '<path d="M22 54 h14 M54 54 h14 M21 60 h14 M55 60 h14" stroke="' + dark + '" stroke-width="2.3" stroke-linecap="round"/><path d="M28 75 Q17 86 8 80" stroke="' + body + '" stroke-width="10" fill="none" stroke-linecap="round"/>' + crown + '</svg>';
  }
  if (student.avatar_id === "panda") {
    return open + '<circle cx="26" cy="31" r="12" fill="#273d39"/><circle cx="64" cy="31" r="12" fill="#273d39"/><ellipse cx="45" cy="61" rx="31" ry="32" fill="' + body + '"/><ellipse cx="45" cy="48" rx="25" ry="24" fill="#fffdf2"/><ellipse cx="32" cy="42" rx="9" ry="11" fill="#273d39"/><ellipse cx="58" cy="42" rx="9" ry="11" fill="#273d39"/><circle cx="34" cy="43" r="2.5" fill="#fff"/><circle cx="56" cy="43" r="2.5" fill="#fff"/><ellipse cx="45" cy="52" rx="5" ry="3" fill="#273d39"/><path d="M38 58 Q45 64 52 58" stroke="#273d39" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M18 65 Q8 72 17 82 M72 65 Q82 72 73 82" stroke="#273d39" stroke-width="10" fill="none" stroke-linecap="round"/>' + crown + '</svg>';
  }
  return open + '<path d="M24 46 l5-31 16 16 16-16 5 31v33H24z" fill="' + body + '"/><path d="M31 25 l3 15 9-8 M59 25 l-3 15-9-8" fill="' + accent + '"/><ellipse cx="45" cy="57" rx="24" ry="22" fill="' + body + '"/>' + face + '<ellipse cx="45" cy="51" rx="4" ry="3" fill="' + dark + '"/><path d="M25 64 Q8 70 10 88 Q22 91 28 78" fill="' + accent + '" stroke="' + dark + '" stroke-width="3"/><path d="M29 79 v8 M61 79 v8" stroke="' + dark + '" stroke-width="7" stroke-linecap="round"/>' + crown + '</svg>';
}

function setMessage(element, message, success) {
  element.textContent = message || "";
  element.classList.toggle("is-success", Boolean(message && success));
}

function showAuth(message) {
  state.student = null;
  elements.authView.hidden = false;
  elements.passwordView.hidden = true;
  elements.cabinetView.hidden = true;
  elements.changePassword.hidden = true;
  elements.signOut.hidden = true;
  setMessage(elements.loginMessage, message || "", false);
}

function showPasswordSetup(isInvitation) {
  elements.authView.hidden = true;
  elements.cabinetView.hidden = true;
  elements.passwordView.hidden = false;
  elements.signOut.hidden = false;
  elements.changePassword.hidden = true;
  elements.passwordLead.textContent = isInvitation
    ? "Приглашение подтверждено. Придумай пароль, чтобы потом входить в свой кабинет."
    : "Установи новый пароль для своего личного кабинета.";
  setMessage(elements.passwordMessage, "");
  elements.newPassword.focus();
}

function authLinkType() {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return search.get("type") || hash.get("type") || "";
}

function isAuthCallback() {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return Boolean(search.get("code") || hash.get("access_token") || hash.get("refresh_token"));
}

function renderChoices() {
  elements.avatarChoices.innerHTML = AVATARS.map(function (avatar) {
    const selected = avatar.id === state.selectedAvatar ? " is-selected" : "";
    return '<button class="choice' + selected + '" type="button" data-avatar="' + avatar.id + '" aria-pressed="' + (avatar.id === state.selectedAvatar) + '">' + avatar.label + '</button>';
  }).join("");
  elements.colorChoices.innerHTML = COLORS.map(function (color) {
    const selected = color.id === state.selectedColor ? " is-selected" : "";
    return '<button class="choice choice--color' + selected + '" type="button" data-color="' + color.id + '" style="--choice-color:' + color.primary + '" aria-label="' + color.label + '" title="' + color.label + '" aria-pressed="' + (color.id === state.selectedColor) + '"></button>';
  }).join("");
}

function renderStudent() {
  const student = state.student;
  if (!student) return;
  const score = Number(student.score || 0);
  const level = getLevel(score);
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
  const nextScore = nextLevel ? nextLevel.min : level.min + 1;
  const progress = nextLevel ? Math.min(100, Math.round(((score - level.min) / (nextScore - level.min)) * 100)) : 100;
  const remaining = nextLevel ? Math.max(0, nextScore - score) : 0;
  const preview = { avatar_id: state.selectedAvatar, color: state.selectedColor, score: score };

  elements.studentName.textContent = student.display_name;
  elements.characterLevel.textContent = level.title;
  elements.characterPreview.innerHTML = animalSvg(preview);
  elements.studentScore.textContent = String(score);
  elements.progressPercent.textContent = progress + "%";
  elements.progressBar.style.width = progress + "%";
  elements.progressText.textContent = nextLevel ? "До «" + nextLevel.title + "»" : "Максимальный уровень";
  elements.nextLevelText.textContent = nextLevel
    ? "До следующей ступени — " + remaining + " " + scoreWord(remaining) + " опыта."
    : "Максимальный уровень уже открыт — легенда леса!";
  elements.walletBalance.textContent = String(Number(student.wallet_balance || 0));
  renderChoices();
}

function renderShop(items) {
  if (!items.length) {
    elements.shopList.innerHTML = '<article class="shop-placeholder"><span>✦</span><div><strong>Лавка готовится к открытию</strong><p>Здесь появятся скины, одежда и дополнительные награды от преподавателя.</p></div></article>';
    return;
  }
  elements.shopList.innerHTML = items.map(function (item) {
    return '<article class="shop-item"><div><strong>' + escapeHtml(item.title) + '</strong><p>' + escapeHtml(item.description) + '</p></div><span class="shop-item__price">🍃 ' + Number(item.price) + '</span></article>';
  }).join("");
}

async function loadShop() {
  const result = await state.client.rpc("student_shop_catalog");
  if (!result.error) renderShop(result.data || []);
}

async function loadStudent() {
  const result = await state.client.rpc("student_me");
  if (result.error) throw result.error;
  const student = result.data && result.data[0];
  if (!student) throw new Error("К этому аккаунту пока не привязан герой. Обратитесь к преподавателю.");
  state.student = student;
  state.selectedAvatar = student.avatar_id;
  state.selectedColor = student.color;
  renderStudent();
}

async function routeSession() {
  const sessionResult = await state.client.auth.getSession();
  state.session = sessionResult.data.session;
  if (!state.session) {
    showAuth();
    return;
  }

  if (state.needsPasswordSetup) {
    showPasswordSetup(true);
    return;
  }

  const adminCheck = await state.client.rpc("admin_me");
  if (!adminCheck.error && adminCheck.data === true) {
    window.location.replace("admin.html");
    return;
  }

  try {
    await loadStudent();
    elements.accountEmail.textContent = state.session.user.email || "";
    elements.authView.hidden = true;
    elements.passwordView.hidden = true;
    elements.cabinetView.hidden = false;
    elements.changePassword.hidden = false;
    elements.signOut.hidden = false;
    await loadShop();
  } catch (error) {
    await state.client.auth.signOut({ scope: "local" });
    showAuth(error.message || "Не удалось открыть личный кабинет.");
  }
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
  await routeSession();
}

async function saveCharacter(event) {
  event.preventDefault();
  setMessage(elements.characterMessage, "");
  const result = await state.client.rpc("student_update_character", {
    p_avatar_id: state.selectedAvatar,
    p_color: state.selectedColor
  });
  if (result.error) {
    setMessage(elements.characterMessage, "Не удалось сохранить образ. Попробуйте ещё раз.");
    return;
  }
  state.student = result.data && result.data[0];
  if (!state.student) {
    setMessage(elements.characterMessage, "Образ сохранён, обновите страницу.", true);
    return;
  }
  renderStudent();
  setMessage(elements.characterMessage, "Образ героя сохранён.", true);
}

async function savePassword(event) {
  event.preventDefault();
  const password = elements.newPassword.value;
  const repeat = elements.repeatPassword.value;
  setMessage(elements.passwordMessage, "");
  if (password.length < 8) {
    setMessage(elements.passwordMessage, "Пароль должен содержать не менее 8 символов.");
    return;
  }
  if (password !== repeat) {
    setMessage(elements.passwordMessage, "Пароли не совпадают.");
    return;
  }
  const result = await state.client.auth.updateUser({ password: password });
  if (result.error) {
    setMessage(elements.passwordMessage, "Не удалось сохранить пароль. Попробуйте другой.");
    return;
  }
  elements.newPassword.value = "";
  elements.repeatPassword.value = "";
  state.needsPasswordSetup = false;
  window.history.replaceState({}, document.title, window.location.pathname);
  await routeSession();
}

async function connect() {
  const url = String(config.supabaseUrl || "").trim();
  const key = String(config.supabasePublishableKey || config.supabaseAnonKey || "").trim();
  if (!url || !key) {
    showAuth("Сайт ещё не подключён к базе.");
    return;
  }
  try {
    const module = await import("https://esm.sh/@supabase/supabase-js@2");
    state.client = module.createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "les-otkrytiy-teacher-session"
      }
    });
    const linkType = authLinkType();
    state.needsPasswordSetup = linkType === "invite" || linkType === "recovery" || isAuthCallback();
    state.client.auth.onAuthStateChange(function (event) {
      if (event === "PASSWORD_RECOVERY") {
        state.needsPasswordSetup = true;
        showPasswordSetup(false);
      }
    });
    await routeSession();
    state.client
      .channel("student-cabinet")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "students" }, function (payload) {
        if (state.student && payload.new.id === state.student.id) loadStudent();
      })
      .subscribe();
  } catch (error) {
    console.error(error);
    showAuth("Не удалось подключиться к личному кабинету.");
  }
}

function wireEvents() {
  elements.loginForm.addEventListener("submit", signIn);
  elements.characterForm.addEventListener("submit", saveCharacter);
  elements.passwordForm.addEventListener("submit", savePassword);
  elements.avatarChoices.addEventListener("click", function (event) {
    const button = event.target.closest("[data-avatar]");
    if (!button) return;
    state.selectedAvatar = button.dataset.avatar;
    renderStudent();
  });
  elements.colorChoices.addEventListener("click", function (event) {
    const button = event.target.closest("[data-color]");
    if (!button) return;
    state.selectedColor = button.dataset.color;
    renderStudent();
  });
  elements.signOut.addEventListener("click", async function () {
    await state.client.auth.signOut({ scope: "local" });
    showAuth("Вы вышли из личного кабинета.");
  });
  elements.changePassword.addEventListener("click", function () {
    showPasswordSetup(false);
  });
}

function start() {
  const title = config.classTitle || "Лес открытий";
  document.title = "Личный кабинет · " + title;
  elements.classTitle.textContent = title;
  wireEvents();
  connect();
}

start();
