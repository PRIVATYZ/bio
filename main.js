/**
 * КОНФИГУРАЦИЯ БАЗЫ ДАННЫХ (SUPABASE)
 * Оставь пустыми, если используешь локальный режим,
 * или вставь URL и anonKey из Supabase -> Settings -> API:
 */
const DB_CONFIG = {
  url: "",
  anonKey: ""
};

/* ---------------- 1. TYPEWRITER ---------------- */
const phrases = [
  "Приветствую, я PRIVATYZ.",
  "Создаю минималистичные интерфейсы, скрипты на Lua и утилиты на Python.",
  "Люблю аккуратный код, плавные анимации и скрытые пасхалки.",
  "Попробуй найти то, что спрятано на этой странице..."
];

const el = document.getElementById("typewriter-text");
let phraseIndex = 0;
let charIndex = 0;

function typeNextChar() {
  if (!el) return;
  const current = phrases[phraseIndex];

  if (charIndex <= current.length) {
    el.textContent = current.slice(0, charIndex);
    charIndex += 1;
    setTimeout(typeNextChar, 38);
  } else {
    setTimeout(() => {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      charIndex = 0;
      typeNextChar();
    }, 1400);
  }
}

/* ---------------- 2. КАСТОМИЗАЦИЯ ТЕМ И SPOTLIGHT ---------------- */
function initCustomization() {
  const THEME_KEY = "privatyz.theme.v2";
  const root = document.documentElement;
  const buttons = document.querySelectorAll("[data-set-theme]");

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    buttons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-set-theme") === theme);
    });
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  };

  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) applyTheme(saved);
  } catch {}

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = btn.getAttribute("data-set-theme");
      if (t) applyTheme(t);
    });
  });

  document.querySelectorAll(".bento-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--card-mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--card-my", `${e.clientY - rect.top}px`);
    });
  });
}

/* ---------------- 3. МНОГОУРОВНЕВАЯ СЕКРЕТНАЯ РАЗБЛОКИРОВКА ---------------- */
function initSecretReveal() {
  const secretSection = document.querySelector('[data-secret="snake"]');
  const hideBtn = document.getElementById("snake-hide");
  if (!(secretSection instanceof HTMLElement)) return;

  const reveal = () => {
    secretSection.hidden = false;
    secretSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  if (hideBtn) {
    hideBtn.addEventListener("click", () => {
      secretSection.hidden = true;
    });
  }

  console.log(
    "%c[PRIVATYZ SYSTEM]%c Обнаружен зашифрованный модуль. Введи %cunlock()%c для запуска.",
    "color: #8b5cf6; font-weight: bold;",
    "color: #94a3b8;",
    "color: #38bdf8; font-weight: bold;",
    "color: #94a3b8;"
  );
  window.unlock = () => {
    reveal();
    return "Access granted. Module Snake.exe loaded.";
  };

  const konami = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a"
  ];
  let konamiPos = 0;
  let wordBuffer = "";

  window.addEventListener("keydown", (e) => {
    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "SELECT")) return;

    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

    if (key === konami[konamiPos]) {
      konamiPos++;
      if (konamiPos === konami.length) {
        konamiPos = 0;
        reveal();
      }
    } else {
      konamiPos = key === konami[0] ? 1 : 0;
    }

    if (e.key.length === 1) {
      wordBuffer = (wordBuffer + e.key.toLowerCase()).slice(-8);
      if (wordBuffer.endsWith("sudo") || wordBuffer.endsWith("matrix")) {
        wordBuffer = "";
        reveal();
      }
    }
  });

  const pill = document.getElementById("secret-trigger-pill");
  let clicks = 0;
  let timer = null;
  if (pill) {
    pill.addEventListener("click", () => {
      clicks++;
      clearTimeout(timer);
      timer = setTimeout(() => (clicks = 0), 1500);
      if (clicks >= 5) {
        clicks = 0;
        reveal();
      }
    });
  }
}

/* ---------------- 4. ОБЛАЧНЫЙ ЛИДЕРБОРД (SUPABASE + FALLBACK) ---------------- */
class LeaderboardService {
  constructor(config = {}) {
    this.url = config.url?.replace(/\/$/, "");
    this.key = config.anonKey;
    this.isCloud = Boolean(this.url && this.key);
    this.localKey = "snake.lb.fallback.v2";
  }

  async getTop(limit = 10) {
    if (!this.isCloud) {
      return this.getLocal().slice(0, limit);
    }
    try {
      const res = await fetch(
        `${this.url}/rest/v1/leaderboard?select=name,score,created_at&order=score.desc,created_at.asc&limit=${limit}`,
        {
          headers: {
            apikey: this.key,
            Authorization: `Bearer ${this.key}`
          }
        }
      );
      if (!res.ok) throw new Error("Fetch failed");
      return await res.json();
    } catch {
      return this.getLocal().slice(0, limit);
    }
  }

  async submitScore(name, score) {
    if (score <= 0) return;
    this.saveLocal(name, score);

    if (!this.isCloud) return;
    try {
      await fetch(`${this.url}/rest/v1/leaderboard`, {
        method: "POST",
        headers: {
          apikey: this.key,
          Authorization: `Bearer ${this.key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({ name, score })
      });
    } catch (err) {
      console.warn("Cloud save error:", err);
    }
  }

  getLocal() {
    try {
      const data = JSON.parse(localStorage.getItem(this.localKey) || "[]");
      return Array.isArray(data) ? data.sort((a, b) => b.score - a.score) : [];
    } catch {
      return [];
    }
  }

  saveLocal(name, score) {
    try {
      const list = this.getLocal();
      list.push({ name, score, created_at: new Date().toISOString() });
      list.sort((a, b) => b.score - a.score);
      localStorage.setItem(this.localKey, JSON.stringify(list.slice(0, 30)));
    } catch {}
  }
}

/* ---------------- 5. ИГРА ЗМЕЙКА ---------------- */
function initSnakeGame() {
  const canvas = document.getElementById("snake-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext("2d");

  const scoreEl = document.getElementById("snake-score");
  const bestEl = document.getElementById("snake-best");
  const statusEl = document.getElementById("snake-status");
  const nameInput = document.getElementById("snake-name");
  const skinSelect = document.getElementById("snake-skin");
  const startBtn = document.getElementById("snake-start");
  const pauseBtn = document.getElementById("snake-pause");
  const resetBtn = document.getElementById("snake-reset");
  const refreshBtn = document.getElementById("snake-refresh");
  const lbEl = document.getElementById("snake-leaderboard");
  const dbStatusEl = document.getElementById("db-status");

  const db = new LeaderboardService(DB_CONFIG);
  if (dbStatusEl) {
    dbStatusEl.textContent = db.isCloud ? "DB: Supabase Cloud" : "DB: Local Storage";
  }

  const SKINS = {
    theme: () => {
      const styles = getComputedStyle(document.documentElement);
      return {
        head: styles.getPropertyValue("--accent-2").trim() || "#38bdf8",
        body: styles.getPropertyValue("--accent").trim() || "#8b5cf6",
        food: "#fb7185"
      };
    },
    matrix: () => ({ head: "#86efac", body: "#22c55e", food: "#f43f5e" }),
    gold: () => ({ head: "#fef08a", body: "#eab308", food: "#38bdf8" }),
    ghost: () => ({ head: "#ffffff", body: "rgba(255,255,255,0.35)", food: "#a855f7" })
  };

  const gridSize = 20;
  const tile = Math.floor(canvas.width / gridSize);
  canvas.width = gridSize * tile;
  canvas.height = gridSize * tile;

  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = { x: 12, y: 10 };
  let running = false;
  let paused = false;
  let gameOver = false;
  let score = 0;
  let stepMs = 115;
  let accMs = 0;
  let lastT = 0;

  const cleanName = (v) => String(v || "").trim().slice(0, 16) || "Player";

  try {
    nameInput.value = cleanName(localStorage.getItem("snake.nick") || "Player");
  } catch {}

  nameInput.addEventListener("change", () => {
    nameInput.value = cleanName(nameInput.value);
    try {
      localStorage.setItem("snake.nick", nameInput.value);
    } catch {}
  });

  async function renderLeaderboard() {
    lbEl.innerHTML = `<li class="lb-item"><span class="lb-name">Загрузка...</span></li>`;
    const list = await db.getTop(10);
    lbEl.innerHTML = "";

    if (!list.length) {
      lbEl.innerHTML = `<li class="lb-item"><span class="lb-name">Рекордов пока нет</span></li>`;
      bestEl.textContent = "0";
      return;
    }

    bestEl.textContent = String(list[0].score);
    list.forEach((row, idx) => {
      const li = document.createElement("li");
      li.className = "lb-item";
      li.innerHTML = `
        <span class="lb-item__left">
          <span class="lb-rank">#${idx + 1}</span>
          <span class="lb-name"></span>
        </span>
        <span class="lb-score">${row.score} pts</span>
      `;
      li.querySelector(".lb-name").textContent = cleanName(row.name);
      lbEl.appendChild(li);
    });
  }

  function placeFood() {
    let c;
    do {
      c = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      };
    } while (snake.some((s) => s.x === c.x && s.y === c.y));
    food = c;
  }

  function resetGame() {
    snake = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 }
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    placeFood();
    score = 0;
    scoreEl.textContent = "0";
    stepMs = 115;
    accMs = 0;
    lastT = 0;
    running = false;
    paused = false;
    gameOver = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = "Пауза";
    startBtn.textContent = "Старт";
    statusEl.style.display = "block";
    statusEl.textContent = "Нажми «Старт» (WASD / Стрелки)";
    draw();
  }

  function draw() {
    const palette = (SKINS[skinSelect.value] || SKINS.theme)();

    ctx.fillStyle = "#04060c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let i = 1; i < gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * tile, 0);
      ctx.lineTo(i * tile, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * tile);
      ctx.lineTo(canvas.width, i * tile);
      ctx.stroke();
    }

    ctx.shadowBlur = 12;
    ctx.shadowColor = palette.food;
    ctx.fillStyle = palette.food;
    ctx.beginPath();
    ctx.roundRect(food.x * tile + 3, food.y * tile + 3, tile - 6, tile - 6, 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    snake.forEach((seg, idx) => {
      ctx.fillStyle = idx === 0 ? palette.head : palette.body;
      ctx.beginPath();
      ctx.roundRect(seg.x * tile + 1.5, seg.y * tile + 1.5, tile - 3, tile - 3, idx === 0 ? 6 : 4);
      ctx.fill();
    });
  }

  async function endGame() {
    running = false;
    gameOver = true;
    pauseBtn.disabled = true;
    startBtn.textContent = "Снова";
    statusEl.style.display = "block";
    statusEl.textContent = `Game Over · Счёт: ${score}`;
    draw();

    if (score > 0) {
      await db.submitScore(cleanName(nameInput.value), score);
      await renderLeaderboard();
    }
  }

  function step() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= gridSize ||
      head.y >= gridSize ||
      snake.some((s) => s.x === head.x && s.y === head.y)
    ) {
      endGame();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = String(score);
      if (score % 50 === 0) stepMs = Math.max(55, stepMs - 8);
      placeFood();
    } else {
      snake.pop();
    }
  }

  function loop(t) {
    if (!running) return;
    if (!lastT) lastT = t;
    const dt = t - lastT;
    lastT = t;

    if (!paused) {
      accMs += dt;
      while (accMs >= stepMs) {
        accMs -= stepMs;
        step();
        if (!running) return;
      }
    }
    draw();
    requestAnimationFrame(loop);
  }

  startBtn.addEventListener("click", () => {
    if (gameOver || running) resetGame();
    running = true;
    pauseBtn.disabled = false;
    startBtn.textContent = "Рестарт";
    statusEl.style.display = "none";
    requestAnimationFrame(loop);
  });

  pauseBtn.addEventListener("click", () => {
    if (!running || gameOver) return;
    paused = !paused;
    pauseBtn.textContent = paused ? "Дальше" : "Пауза";
    statusEl.style.display = paused ? "block" : "none";
    statusEl.textContent = "Пауза";
  });

  resetBtn.addEventListener("click", resetGame);
  refreshBtn.addEventListener("click", renderLeaderboard);
  skinSelect.addEventListener("change", draw);

  window.addEventListener("keydown", (e) => {
    const secretOpen = !document.querySelector('[data-secret="snake"]')?.hidden;
    if (!secretOpen || !running) return;

    if (e.key === " ") {
      e.preventDefault();
      pauseBtn.click();
      return;
    }

    const map = {
      ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ц: [0, -1], Ц: [0, -1],
      ArrowDown: [0, 1], s: [0, 1], S: [0, 1], ы: [0, 1], Ы: [0, 1],
      ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ф: [-1, 0], Ф: [-1, 0],
      ArrowRight: [1, 0], d: [1, 0], D: [1, 0], в: [1, 0], В: [1, 0]
    };

    const next = map[e.key];
    if (next && (next[0] !== -dir.x || next[1] !== -dir.y)) {
      e.preventDefault();
      nextDir = { x: next[0], y: next[1] };
    }
  });

  resetGame();
  renderLeaderboard();
}

/* ---------------- 6. SPOTIFY LIVE ЧЕРЕЗ LANYARD ---------------- */
function initSpotifyLive() {
  const DISCORD_ID = "744792534605365328";

  const stateEl = document.getElementById("spotify-state");
  const linkEl = document.getElementById("spotify-link");
  const coverEl = document.getElementById("spotify-cover");
  const trackEl = document.getElementById("spotify-track");
  const artistEl = document.getElementById("spotify-artist");
  const progWrap = document.getElementById("spotify-progress-wrap");
  const progBar = document.getElementById("spotify-progress-bar");

  if (!stateEl || !linkEl) return;

  const fallbackCover = coverEl.src;
  let timestamps = null;

  const setOffline = (reason = "Spotify в оффлайне") => {
    timestamps = null;
    stateEl.textContent = "OFFLINE";
    stateEl.classList.remove("is-live");
    linkEl.classList.add("is-offline");
    linkEl.href = "https://open.spotify.com";
    coverEl.src = fallbackCover;
    trackEl.textContent = "Ничего не играет";
    artistEl.textContent = reason;
    if (progWrap) progWrap.hidden = true;
  };

  const extractTrack = (data) => {
    if (!data) return null;

    if (data.spotify && data.spotify.song) {
      return data.spotify;
    }

    if (Array.isArray(data.activities)) {
      const act = data.activities.find((a) => a.type === 2 || a.id === "spotify:1");
      if (act && act.details) {
        const rawImg = act.assets?.large_image || "";
        const artUrl = rawImg.startsWith("spotify:")
          ? `https://i.scdn.co/image/${rawImg.replace("spotify:", "")}`
          : fallbackCover;

        return {
          song: act.details,
          artist: act.state || "Unknown Artist",
          album_art_url: artUrl,
          track_id: act.sync_id || "",
          timestamps: act.timestamps || null
        };
      }
    }

    return null;
  };

  const updateSpotify = (data) => {
    const track = extractTrack(data);
    if (!track) {
      setOffline();
      return;
    }

    stateEl.textContent = "LISTENING NOW";
    stateEl.classList.add("is-live");
    linkEl.classList.remove("is-offline");
    linkEl.href = track.track_id
      ? `https://open.spotify.com/track/${track.track_id}`
      : "https://open.spotify.com";
    coverEl.src = track.album_art_url || fallbackCover;
    trackEl.textContent = track.song;
    artistEl.textContent = String(track.artist || "").replace(/;/g, ",");
    timestamps = track.timestamps || null;
    if (progWrap) progWrap.hidden = !timestamps;
    tickProgress();
  };

  const tickProgress = () => {
    if (!timestamps || !timestamps.start || !timestamps.end || !progBar) return;
    const total = timestamps.end - timestamps.start;
    const current = Date.now() - timestamps.start;
    const pct = Math.min(100, Math.max(0, (current / total) * 100));
    progBar.style.width = `${pct.toFixed(1)}%`;
  };

  setInterval(tickProgress, 1000);

  async function fetchLanyard() {
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}?v=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log("[SPOTIFY] Ответ Lanyard:", json);

      if (json?.success && json?.data) {
        updateSpotify(json.data);
      }
    } catch (err) {
      console.warn("[SPOTIFY] Ошибка доступа к API:", err);
      setOffline("Нет связи с API (проверь VPN)");
    }
  }

  fetchLanyard();
  setInterval(fetchLanyard, 5000);
}

/* ---------------- ИНИЦИАЛИЗАЦИЯ ---------------- */
window.addEventListener("DOMContentLoaded", () => {
  typeNextChar();
  initCustomization();
  initSecretReveal();
  initSnakeGame();
  initSpotifyLive();
});