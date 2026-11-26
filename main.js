const DB_CONFIG = {
  url: "https://vcfqzebfihxdcunsowwu.supabase.co",
  anonKey: "sb_publishable_ifZXCl1lXauq3OPcvdKI_w_zZp7clC_"
};

/* ---------------- 1. TYPEWRITER (BACKSPACE + CTRL+A) ---------------- */
const phrases = [
  "Приветствую, я PRIVATYZ.",
  "Создаю минималистичные интерфейсы, скрипты на Lua и веб-приложения.",
  "Люблю аккуратный код, плавные анимации и скрытые пасхалки.",
  "Попробуй найти то, что спрятано на этой странице..."
];

const el = document.getElementById("typewriter-text");
let phraseIndex = 0;
let charIndex = 0;
let mode = "typing"; // "typing" | "backspace" | "selectAll"

function typeNextChar() {
  if (!el) return;
  const current = phrases[phraseIndex];

  if (mode === "typing") {
    el.classList.remove("is-selected");
    if (charIndex < current.length) {
      charIndex += 1;
      el.textContent = current.slice(0, charIndex);
      const humanDelay = 30 + Math.random() * 25;
      setTimeout(typeNextChar, humanDelay);
    } else {
      setTimeout(() => {
        mode = Math.random() < 0.25 ? "selectAll" : "backspace";
        typeNextChar();
      }, 1500);
    }
  } else if (mode === "backspace") {
    if (charIndex > 0) {
      charIndex -= 1;
      el.textContent = current.slice(0, charIndex);
      setTimeout(typeNextChar, 22);
    } else {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      mode = "typing";
      setTimeout(typeNextChar, 320);
    }
  } else if (mode === "selectAll") {
    el.classList.add("is-selected");
    setTimeout(() => {
      el.classList.remove("is-selected");
      charIndex = 0;
      el.textContent = "";
      phraseIndex = (phraseIndex + 1) % phrases.length;
      mode = "typing";
      setTimeout(typeNextChar, 350);
    }, 340);
  }
}

/* ---------------- 2. ЖИВОЕ ВРЕМЯ В ГОРНО-АЛТАЙСКЕ (UTC+7) ---------------- */
function initLocalClock() {
  const clockEl = document.getElementById("local-clock");
  if (!clockEl) return;

  const formatter = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Asia/Barnaul",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const tick = () => {
    clockEl.textContent = formatter.format(new Date());
  };

  tick();
  setInterval(tick, 1000);
}

/* ---------------- 3. КАСТОМИЗАЦИЯ ТЕМ И SPOTLIGHT ---------------- */
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

/* ---------------- 4. МНОГОУРОВНЕВАЯ СЕКРЕТНАЯ РАЗБЛОКИРОВКА ---------------- */
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

/* ---------------- 5. ГЛОБАЛЬНЫЙ ЛИДЕРБОРД (SUPABASE + FALLBACK) ---------------- */
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

/* ---------------- 6. ИГРА ЗМЕЙКА ---------------- */
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
    dbStatusEl.textContent = db.isCloud ? "DB: Supabase Global" : "DB: Local Storage";
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

/* Вспомогательная функция: извлечение насыщенного RGB из картинки */
function extractDominantRgb(img, fallback = "139, 92, 246") {
  try {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    c.width = 24;
    c.height = 24;
    ctx.drawImage(img, 0, 0, 24, 24);
    const { data } = ctx.getImageData(0, 0, 24, 24);

    let bestR = null, bestG = 0, bestB = 0;
    let bestScore = -1;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const lum = (max + min) / 2;

      if (lum < 38 || lum > 225) continue;
      const sat = max - min;
      const score = sat * 1.6 + lum * 0.4;

      if (score > bestScore) {
        bestScore = score;
        bestR = r;
        bestG = g;
        bestB = b;
      }
    }

    return bestR !== null ? `${bestR}, ${bestG}, ${bestB}` : fallback;
  } catch {
    return fallback;
  }
}

/* ---------------- 7. SPOTIFY LIVE + DISCORD + АДАПТИВНАЯ ПОДСВЕТКА ---------------- */
function initSpotifyLive() {
  const DISCORD_ID = "744792534605365328";

  const cardEl = document.getElementById("spotify-card");
  const stateEl = document.getElementById("spotify-state");
  const linkEl = document.getElementById("spotify-link");
  const coverEl = document.getElementById("spotify-cover");
  const trackEl = document.getElementById("spotify-track");
  const artistEl = document.getElementById("spotify-artist");
  const progWrap = document.getElementById("spotify-progress-wrap");
  const progBar = document.getElementById("spotify-progress-bar");
  const dotEl = document.getElementById("discord-dot");
  const statusTextEl = document.getElementById("discord-status-text");

  if (!stateEl || !linkEl) return;

  const fallbackCover = coverEl.src;
  let timestamps = null;
  let lastArtUrl = "";

  coverEl.addEventListener("load", () => {
    if (!cardEl) return;
    if (coverEl.src && coverEl.src !== fallbackCover) {
      cardEl.style.setProperty("--sp-rgb", extractDominantRgb(coverEl, "29, 185, 84"));
    } else {
      cardEl.style.setProperty("--sp-rgb", "29, 185, 84");
    }
  });

  const setOffline = (reason = "Spotify в оффлайне") => {
    timestamps = null;
    lastArtUrl = "";
    stateEl.textContent = "OFFLINE";
    stateEl.classList.remove("is-live");
    linkEl.classList.add("is-offline");
    linkEl.href = "https://open.spotify.com";
    coverEl.src = fallbackCover;
    if (cardEl) cardEl.style.setProperty("--sp-rgb", "29, 185, 84");
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

    const nextArt = track.album_art_url || fallbackCover;
    if (nextArt !== lastArtUrl) {
      lastArtUrl = nextArt;
      coverEl.src = nextArt;
    }

    trackEl.textContent = track.song;
    artistEl.textContent = String(track.artist || "").replace(/;/g, ",");
    timestamps = track.timestamps || null;
    if (progWrap) progWrap.hidden = !timestamps;
    tickProgress();
  };

  const updateDiscordStatus = (data) => {
    if (!dotEl || !statusTextEl || !data) return;

    const status = data.discord_status || "offline";
    dotEl.setAttribute("data-status", status);

    const appActivity = Array.isArray(data.activities)
      ? data.activities.find((a) => a.type === 0 && a.name)
      : null;

    if (status === "offline") {
      statusTextEl.textContent = "offline // away";
    } else if (appActivity) {
      statusTextEl.textContent = `in ${appActivity.name}`;
    } else {
      statusTextEl.textContent = `${status} // dev`;
    }
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
    const PROXY_URL = "https://vcfqzebfihxdcunsowwu.supabase.co/functions/v1/spotify-proxy";
    const DIRECT_URL = `https://api.lanyard.rest/v1/users/${DISCORD_ID}?v=${Date.now()}`;

    const endpoints = [
      `${PROXY_URL}?v=${Date.now()}`,
      DIRECT_URL
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const json = await res.json();

        if (json?.success && json?.data) {
          updateSpotify(json.data);
          updateDiscordStatus(json.data);
          return;
        }
      } catch {
      }
    }

    setOffline("Нет связи с API");
  }

  fetchLanyard();
  setInterval(fetchLanyard, 5000);
}

/* ---------------- 8. РЕЛИЗЫ АРТИСТА (SUPABASE + TG BOT) ---------------- */
function initReleasesShowcase() {
  const cardEl = document.getElementById("releases-card");
  if (!cardEl) return;

  const badgeEl = document.getElementById("release-status-badge");
  const navEl = document.getElementById("releases-nav");
  const dotsEl = document.getElementById("releases-dots");
  const prevBtn = document.getElementById("release-prev");
  const nextBtn = document.getElementById("release-next");
  const coverEl = document.getElementById("release-cover");
  const playBtn = document.getElementById("release-play-btn");
  const titleEl = document.getElementById("release-title");
  const metaEl = document.getElementById("release-meta");
  const countdownEl = document.getElementById("release-countdown");
  const previewBar = document.getElementById("release-preview-bar");
  const previewFill = document.getElementById("release-preview-fill");
  const linksEl = document.getElementById("release-links");

  const fallbackCover = coverEl.src;
  const audio = new Audio();
  audio.preload = "metadata";

  let releases = [];
  let activeIdx = 0;

  const stopAudio = () => {
    audio.pause();
    audio.currentTime = 0;
    if (playBtn) playBtn.textContent = "▶";
    if (previewBar) previewBar.hidden = true;
    if (previewFill) previewFill.style.width = "0%";
  };

  coverEl.addEventListener("load", () => {
    if (coverEl.src && coverEl.src !== fallbackCover) {
      cardEl.style.setProperty("--rel-rgb", extractDominantRgb(coverEl, "139, 92, 246"));
    } else {
      cardEl.style.setProperty("--rel-rgb", "139, 92, 246");
    }
  });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration || !previewFill) return;
    previewFill.style.width = `${Math.min(100, (audio.currentTime / audio.duration) * 100)}%`;
  });

  audio.addEventListener("ended", () => {
    if (playBtn) playBtn.textContent = "▶";
    if (previewFill) previewFill.style.width = "0%";
  });

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      const current = releases[activeIdx];
      if (!current?.preview_url) return;

      if (!audio.paused && audio.src === current.preview_url) {
        audio.pause();
        playBtn.textContent = "▶";
        return;
      }

      if (audio.src !== current.preview_url) {
        audio.src = current.preview_url;
      }
      if (previewBar) previewBar.hidden = false;
      audio.play().catch(() => {});
      playBtn.textContent = "❚❚";
    });
  }

  const updateCountdown = () => {
    const item = releases[activeIdx];
    if (!item || !countdownEl || !badgeEl) return;

    // Если дата не указана (прочерк "-" в боте) -> трек в статусе "Скоро / Coming Soon"
    if (!item.release_date) {
      badgeEl.textContent = "COMING SOON";
      badgeEl.classList.remove("is-out");
      countdownEl.hidden = false;
      countdownEl.textContent = "Скоро";
      return;
    }

    const diff = new Date(item.release_date).getTime() - Date.now();
    if (diff <= 0) {
      countdownEl.hidden = true;
      badgeEl.textContent = "OUT NOW";
      badgeEl.classList.add("is-out");
      return;
    }

    badgeEl.textContent = "UPCOMING";
    badgeEl.classList.remove("is-out");
    countdownEl.hidden = false;

    const totalSec = Math.floor(diff / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    countdownEl.textContent = `${String(days).padStart(2, "0")}d : ${String(hours).padStart(2, "0")}h : ${String(mins).padStart(2, "0")}m : ${String(secs).padStart(2, "0")}s`;
  };

  setInterval(updateCountdown, 1000);

  const renderDots = () => {
    if (!dotsEl) return;
    dotsEl.innerHTML = "";
    releases.forEach((_, idx) => {
      const dot = document.createElement("span");
      dot.className = `releases-dot${idx === activeIdx ? " is-active" : ""}`;
      dotsEl.appendChild(dot);
    });
  };

  const renderRelease = () => {
    const item = releases[activeIdx];
    if (!item) {
      titleEl.textContent = "Скоро новые релизы";
      metaEl.textContent = "PRIVATYZ";
      if (playBtn) playBtn.hidden = true;
      if (linksEl) linksEl.innerHTML = "";
      return;
    }

    titleEl.textContent = item.title || "Untitled";
    metaEl.textContent = `${item.artist || "PRIVATYZ"} · ${item.genre || "Ambient"}`;
    coverEl.src = item.cover_url || fallbackCover;

    if (playBtn) {
      playBtn.hidden = !item.preview_url;
    }

    if (linksEl) {
      linksEl.innerHTML = "";
      const platforms = [
        { label: "Яндекс Музыка", url: item.yandex_url },
        { label: "VK Музыка", url: item.vk_url },
        { label: "Spotify", url: item.spotify_url }
      ];

      platforms.forEach((p) => {
        if (!p.url) return;
        const a = document.createElement("a");
        a.className = "stream-pill";
        a.href = p.url;
        a.target = "_blank";
        a.rel = "noreferrer";
        a.textContent = `${p.label} ↗`;
        linksEl.appendChild(a);
      });
    }

    renderDots();
    updateCountdown();
  };

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (!releases.length) return;
      stopAudio();
      activeIdx = (activeIdx - 1 + releases.length) % releases.length;
      renderRelease();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (!releases.length) return;
      stopAudio();
      activeIdx = (activeIdx + 1) % releases.length;
      renderRelease();
    });
  }

  async function loadReleases() {
    if (!DB_CONFIG.url || !DB_CONFIG.anonKey) {
      renderRelease();
      return;
    }

    try {
      const res = await fetch(
        `${DB_CONFIG.url.replace(/\/$/, "")}/rest/v1/releases?select=*&order=id.desc`,
        {
          headers: {
            apikey: DB_CONFIG.anonKey,
            Authorization: `Bearer ${DB_CONFIG.anonKey}`
          }
        }
      );
      if (!res.ok) throw new Error("Failed to fetch releases");
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length) {
        releases = rows;
        activeIdx = 0;
        if (navEl) navEl.hidden = releases.length <= 1;
      }
    } catch {
      // Оставляем заглушку, если таблица ещё не создана
    }
    renderRelease();
  }

  loadReleases();
}

/* ---------------- ИНИЦИАЛИЗАЦИЯ ---------------- */
window.addEventListener("DOMContentLoaded", () => {
  typeNextChar();
  initLocalClock();
  initCustomization();
  initSecretReveal();
  initSnakeGame();
  initSpotifyLive();
  initReleasesShowcase();
});