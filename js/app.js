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

const BEHAVIORS = [
  { id: "sway", duration: 4.8, weight: 2 },
  { id: "stroll", duration: 5.8, weight: 4 },
  { id: "jump", duration: 2.1, weight: 2 },
  { id: "dash", duration: 2.3, weight: 2 },
  { id: "look", duration: 3.8, weight: 2 }
];

const EFFECTS = [
  { id: "normal", duration: 1, weight: 6, minScore: 2 },
  { id: "glow", duration: 2.7, weight: 3, minScore: 2 },
  { id: "sparkle", duration: 2.8, weight: 2, minScore: 2 },
  { id: "pulse", duration: 2.1, weight: 2, minScore: 3 },
  { id: "rainbow", duration: 3.4, weight: 1, minScore: 5 },
  { id: "spin", duration: 1.5, weight: 1, minScore: 5 }
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
  heroDialog: document.querySelector("#heroDialog"),
  heroDialogContent: document.querySelector("#heroDialogContent")
};

const state = {
  client: null,
  backendReady: false,
  students: [],
  selectedId: null,
  hinted: false,
  motions: {},
  pressStates: {}
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
  const featuredSlots = [
    [[50, 62]],
    [[29, 62], [71, 62]],
    [[17, 66], [50, 45], [83, 66]],
    [[17, 65], [39, 46], [61, 46], [83, 65]],
    [[12, 67], [30, 45], [50, 68], [70, 45], [88, 67]],
    [[11, 66], [27, 47], [44, 69], [57, 45], [74, 67], [89, 48]]
  ];
  if (count > 0 && count <= featuredSlots.length) {
    return featuredSlots[count - 1];
  }

  const columns = count <= 12 ? 4 : count <= 20 ? 5 : 6;
  const rows = Math.ceil(count / columns);
  const minX = 9;
  const maxX = 91;
  const minY = 32;
  const maxY = 83;
  const slots = [];

  for (let index = 0; index < count; index += 1) {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const rowSize = Math.min(columns, count - row * columns);
    const x = rowSize === 1
      ? 50
      : minX + (column * (maxX - minX)) / (rowSize - 1);
    const y = rows === 1
      ? 58
      : minY + (row * (maxY - minY)) / (rows - 1);
    const nudgeX = ((index * 13) % 5 - 2) * 1.1;
    const nudgeY = ((index * 7) % 5 - 2) * 1.2;
    slots.push([Math.max(7, Math.min(93, x + nudgeX)), Math.max(29, Math.min(86, y + nudgeY))]);
  }
  return slots;
}

function getCreatureScale(score) {
  // Рост заметен после каждого балла и постепенно замедляется, чтобы
  // даже герой со 100 баллами не перекрывал весь лес.
  return Math.min(1.92, 0.94 + Math.sqrt(Math.max(0, Number(score))) * 0.13);
}

function getCreatureSize(count) {
  // Если в лесу много активных героев, их базовый размер уменьшается,
  // но относительный рост за баллы остаётся видимым.
  return Math.max(62, 132 - count * 3);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function chooseWeighted(items, previousId, occupiedIds, preferUnique) {
  let candidates = items.filter(function (item) {
    return item.id !== previousId && (!preferUnique || !occupiedIds.has(item.id));
  });
  if (candidates.length === 0) {
    candidates = items.filter(function (item) { return item.id !== previousId; });
  }
  if (candidates.length === 0) candidates = items;
  const pool = candidates.flatMap(function (item) {
    return Array.from({ length: item.weight }, function () { return item; });
  });
  return pool[Math.floor(Math.random() * pool.length)] || items[0];
}

function chooseEffect(score, previousId, occupiedIds, preferUnique) {
  const allowed = EFFECTS.filter(function (effect) {
    return Number(score) >= effect.minScore;
  });
  return chooseWeighted(allowed, previousId, occupiedIds, preferUnique);
}

function getCreatureMotion(studentId, startPosition, score, occupiedBehaviors, occupiedEffects, preferUnique) {
  if (!state.motions[studentId]) {
    const behavior = chooseWeighted(BEHAVIORS, "", occupiedBehaviors, preferUnique);
    const effect = chooseEffect(score, "", occupiedEffects, preferUnique);
    state.motions[studentId] = {
      x: startPosition[0],
      y: startPosition[1],
      behavior: behavior,
      effect: effect,
      duration: 0,
      effectUntil: Date.now() + Math.max(behavior.duration, effect.duration) * 1000
    };
  }
  return state.motions[studentId];
}

function clearInactiveMotions(activeStudents) {
  const activeIds = new Set(activeStudents.map(function (student) { return student.id; }));
  Object.keys(state.motions).forEach(function (studentId) {
    if (!activeIds.has(studentId)) delete state.motions[studentId];
  });
}

function chooseDestination(motion, behavior) {
  const ranges = {
    sway: [2, 1],
    look: [3, 2],
    jump: [7, 5],
    stroll: [23, 16],
    dash: [47, 29]
  };
  const range = ranges[behavior.id] || ranges.sway;
  return {
    x: clamp(motion.x + randomBetween(-range[0], range[0]), 8, 92),
    y: clamp(motion.y + randomBetween(-range[1], range[1]), 29, 86)
  };
}

function applyMotionToElement(studentId) {
  const motion = state.motions[studentId];
  const creature = elements.animals.querySelector('[data-student-id="' + studentId + '"]');
  if (!motion || !creature) return;
  const motionElement = creature.querySelector(".creature__motion");
  creature.style.setProperty("--move-duration", motion.duration + "ms");
  creature.style.left = motion.x + "%";
  creature.style.top = motion.y + "%";
  motionElement.className = "creature__motion creature__motion--" + motion.behavior.id;
  motionElement.style.setProperty("--behavior-duration", motion.behavior.duration + "s");
  const bodyElement = creature.querySelector(".creature__body");
  bodyElement.className = "creature__body creature__effect--" + motion.effect.id;
  bodyElement.style.setProperty("--effect-duration", motion.effect.duration + "s");
}

function captureCurrentMotionPositions() {
  const areaRect = elements.animals.getBoundingClientRect();
  if (!areaRect.width || !areaRect.height) return;
  elements.animals.querySelectorAll(".creature[data-student-id]").forEach(function (creature) {
    const motion = state.motions[creature.dataset.studentId];
    if (!motion) return;
    const computed = window.getComputedStyle(creature);
    const left = Number.parseFloat(computed.left);
    const top = Number.parseFloat(computed.top);
    if (Number.isFinite(left) && Number.isFinite(top)) {
      motion.x = clamp((left / areaRect.width) * 100, 8, 92);
      motion.y = clamp((top / areaRect.height) * 100, 29, 86);
    }
  });
}

function runMotionCycle() {
  const activeStudents = state.students.filter(function (student) {
    return Number(student.score) > 1;
  });
  const preferUnique = activeStudents.length <= 6;
  const occupiedBehaviors = new Set(activeStudents
    .map(function (student) { return state.motions[student.id]; })
    .filter(Boolean)
    .map(function (motion) { return motion.behavior.id; }));
  const occupiedEffects = new Set(activeStudents
    .map(function (student) { return state.motions[student.id]; })
    .filter(Boolean)
    .map(function (motion) { return motion.effect.id; }));

  activeStudents.forEach(function (student) {
    const motion = state.motions[student.id];
    if (!motion || Date.now() < motion.effectUntil || Math.random() > 0.82) return;
    occupiedBehaviors.delete(motion.behavior.id);
    occupiedEffects.delete(motion.effect.id);
    const behavior = chooseWeighted(BEHAVIORS, motion.behavior.id, occupiedBehaviors, preferUnique);
    const effect = chooseEffect(student.score, motion.effect.id, occupiedEffects, preferUnique);
    const duration = Math.round(
      behavior.id === "dash"
        ? randomBetween(1300, 2200)
        : behavior.id === "stroll"
          ? randomBetween(4400, 7200)
          : randomBetween(2100, 4400)
    );
    const destination = chooseDestination(motion, behavior);
    motion.x = destination.x;
    motion.y = destination.y;
    motion.duration = duration;
    motion.behavior = behavior;
    motion.effect = effect;
    motion.effectUntil = Date.now() + Math.max(behavior.duration, effect.duration) * 1000;
    occupiedBehaviors.add(behavior.id);
    occupiedEffects.add(effect.id);
    applyMotionToElement(student.id);
  });

  window.setTimeout(runMotionCycle, Math.round(randomBetween(3800, 6300)));
}

function renderWorld() {
  captureCurrentMotionPositions();
  const activeStudents = state.students.filter(function (student) {
    return Number(student.score) > 1;
  }).sort(function (a, b) {
    return Number(b.score) - Number(a.score) || a.display_name.localeCompare(b.display_name, "ru");
  });
  const slots = buildSlots(activeStudents.length);
  const baseSize = getCreatureSize(activeStudents.length);
  clearInactiveMotions(activeStudents);
  const preferUnique = activeStudents.length <= 6;
  const occupiedBehaviors = new Set();
  const occupiedEffects = new Set();

  elements.worldEmpty.hidden = activeStudents.length > 0;
  if (activeStudents.length === 0) {
    elements.worldEmpty.innerHTML = state.students.length > 0
      ? "<span>✦</span><p>Лес ждёт новых открытий</p><small>Герой появится здесь после 2 баллов.</small>"
      : "<span>✦</span><p>Мир ждёт первых героев</p><small>Учитель добавит их в закрытой панели.</small>";
  }
  elements.heroesCount.textContent = String(activeStudents.length);
  elements.pointsCount.textContent = String(state.students.reduce(function (sum, student) {
    return sum + Number(student.score || 0);
  }, 0));

  elements.animals.innerHTML = activeStudents.map(function (student, index) {
    const slot = slots[index];
    const motion = getCreatureMotion(
      student.id,
      slot,
      student.score,
      occupiedBehaviors,
      occupiedEffects,
      preferUnique
    );
    occupiedBehaviors.add(motion.behavior.id);
    occupiedEffects.add(motion.effect.id);
    const size = getCreatureScale(student.score);
    const selected = student.id === state.selectedId ? " is-selected" : "";
    const label = escapeHtml(student.display_name);
    const level = getLevel(Number(student.score));
    const description = label + ", " + level.title + ", " + student.score + " " + scoreWord(Number(student.score));
    return '<button class="creature' + selected + '" type="button" data-student-id="' + student.id + '" ' +
      'aria-label="' + description + '" style="left:' + motion.x + '%;top:' + motion.y + '%;--scale:' + size +
      ';--size:' + baseSize + 'px;--move-duration:' + motion.duration + 'ms;--behavior-duration:' + motion.behavior.duration + 's;--effect-duration:' + motion.effect.duration + 's">' +
      '<span class="creature__motion creature__motion--' + motion.behavior.id + '"><span class="creature__body creature__effect--' + motion.effect.id + '">' + animalSvg(student) + '</span></span>' +
      '<span class="creature__label">' + label + '</span></button>';
  }).join("");
}

function renderAll() {
  renderWorld();
}

function randomPointFarFrom(motion) {
  let point = { x: motion.x, y: motion.y };
  for (let attempt = 0; attempt < 8; attempt += 1) {
    point = {
      x: randomBetween(9, 91),
      y: randomBetween(31, 85)
    };
    if (Math.hypot(point.x - motion.x, point.y - motion.y) > 25) break;
  }
  return point;
}

function playClickReaction(studentId) {
  const student = state.students.find(function (item) { return item.id === studentId; });
  const creature = elements.animals.querySelector('[data-student-id="' + studentId + '"]');
  const motion = state.motions[studentId];
  if (!student || !creature || !motion) return;

  captureCurrentMotionPositions();
  const svg = creature.querySelector(".creature__body svg");
  const reactions = Number(student.score) >= LEVELS[1].min
    ? ["hop", "wiggle", "spin", "rainbow", "dash"]
    : ["hop", "wiggle", "glow", "dash"];
  const reaction = reactions[Math.floor(Math.random() * reactions.length)];

  if (reaction === "dash") {
    const target = randomPointFarFrom(motion);
    motion.x = target.x;
    motion.y = target.y;
    motion.duration = Math.round(randomBetween(850, 1450));
    applyMotionToElement(studentId);
    svg.animate(
      [
        { transform: "scale(1) rotate(0deg)" },
        { transform: "scale(1.13) rotate(7deg)", offset: 0.45 },
        { transform: "scale(1) rotate(0deg)" }
      ],
      { duration: 540, easing: "ease-out", fill: "none" }
    );
    return;
  }

  if (reaction === "spin") {
    svg.animate(
      [
        { transform: "rotate(0deg) scale(1)", transformOrigin: "center" },
        { transform: "rotate(360deg) scale(1.12)", transformOrigin: "center", offset: 0.58 },
        { transform: "rotate(720deg) scale(1)", transformOrigin: "center" }
      ],
      { duration: 800, easing: "cubic-bezier(.22,.78,.28,1)", fill: "none" }
    );
    return;
  }

  if (reaction === "rainbow") {
    svg.animate(
      [
        { filter: "hue-rotate(0deg) saturate(1)" },
        { filter: "hue-rotate(210deg) saturate(1.7)", offset: 0.55 },
        { filter: "hue-rotate(360deg) saturate(1)" }
      ],
      { duration: 880, easing: "ease-in-out", fill: "none" }
    );
    return;
  }

  if (reaction === "glow") {
    svg.animate(
      [
        { filter: "drop-shadow(0 0 0 rgba(255,230,100,0))" },
        { filter: "drop-shadow(0 0 12px rgba(255,230,100,.95))", offset: 0.46 },
        { filter: "drop-shadow(0 0 0 rgba(255,230,100,0))" }
      ],
      { duration: 670, easing: "ease-out", fill: "none" }
    );
    return;
  }

  const wiggle = reaction === "wiggle";
  svg.animate(
    wiggle
      ? [
        { transform: "rotate(0deg)", transformOrigin: "center bottom" },
        { transform: "rotate(-13deg)", transformOrigin: "center bottom", offset: 0.26 },
        { transform: "rotate(12deg)", transformOrigin: "center bottom", offset: 0.58 },
        { transform: "rotate(0deg)", transformOrigin: "center bottom" }
      ]
      : [
        { transform: "translateY(0) scale(1)", transformOrigin: "center bottom" },
        { transform: "translateY(-22px) scale(1.08)", transformOrigin: "center bottom", offset: 0.48 },
        { transform: "translateY(0) scale(1)", transformOrigin: "center bottom" }
      ],
    { duration: wiggle ? 570 : 520, easing: "ease-out", fill: "none" }
  );
}

function startHeroPress(button, pointerId) {
  const studentId = button.dataset.studentId;
  const press = {
    held: false,
    pointerId: pointerId,
    timer: window.setTimeout(function () {
      press.held = true;
      button.classList.add("is-held");
      delete state.pressStates[studentId];
      showHero(studentId);
    }, 560)
  };
  state.pressStates[studentId] = press;
}

function endHeroPress(button, cancelled) {
  const studentId = button.dataset.studentId;
  const press = state.pressStates[studentId];
  if (!press) return;
  window.clearTimeout(press.timer);
  button.classList.remove("is-held");
  delete state.pressStates[studentId];
  if (!press.held && !cancelled) playClickReaction(studentId);
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

function wireEvents() {
  document.querySelector("#aboutOpen").addEventListener("click", function () {
    elements.aboutDialog.showModal();
  });
  document.querySelectorAll("[data-close]").forEach(function (button) {
    button.addEventListener("click", function () {
      const dialog = document.querySelector("#" + button.dataset.close);
      dialog.close();
    });
  });
  elements.animals.addEventListener("pointerdown", function (event) {
    const button = event.target.closest("[data-student-id]");
    if (!button || (event.pointerType === "mouse" && event.button !== 0)) return;
    button.setPointerCapture?.(event.pointerId);
    startHeroPress(button, event.pointerId);
  });
  elements.animals.addEventListener("pointerup", function (event) {
    const button = event.target.closest("[data-student-id]");
    if (button) endHeroPress(button, false);
  });
  elements.animals.addEventListener("pointercancel", function (event) {
    const button = event.target.closest("[data-student-id]");
    if (button) endHeroPress(button, true);
  });
  elements.animals.addEventListener("keydown", function (event) {
    const button = event.target.closest("[data-student-id]");
    if (button && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      showHero(button.dataset.studentId);
    }
  });
  elements.animals.addEventListener("contextmenu", function (event) {
    if (event.target.closest("[data-student-id]")) event.preventDefault();
  });
}

async function start() {
  document.title = config.classTitle || "Лес открытий";
  elements.classTitle.textContent = config.classTitle || "Лес открытий";
  renderLevels();
  wireEvents();
  await connectBackend();
  window.setTimeout(runMotionCycle, 1800);
}

start();

