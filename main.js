const phrases = [
  "Приветствую, я PRIVATYZ.",
  "Это всего лишь маленькая часть данного сайта, но мне хотелось все таки её реализовать.",
  "Также интересуюсь написанием кодов на lua и python.",
  "Может здесь что-то и будет, но я так не думаю, а может и будет."
];

const typingSpeed = 40;
const pauseBetweenPhrases = 900;

const el = document.getElementById("typewriter-text");

let phraseIndex = 0;
let charIndex = 0;

function typeNextChar() {
  if (!el) return;

  const currentPhrase = phrases[phraseIndex];

  if (charIndex <= currentPhrase.length) {
    el.textContent = currentPhrase.slice(0, charIndex);
    charIndex += 1;
    window.requestAnimationFrame(() => {
      setTimeout(typeNextChar, typingSpeed);
    });
    return;
  }
  setTimeout(() => {
    phraseIndex = (phraseIndex + 1) % phrases.length;
    charIndex = 0;
    typeNextChar();
  }, pauseBetweenPhrases);
}

function clampName(raw) {
  const name = String(raw ?? "").trim().slice(0, 16);
  return name || "Player";
}

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
  } catch {
    return "";
  }
}

function initSecretSnakeReveal() {
  const secretSection = document.querySelector('[data-secret="snake"]');
  if (!(secretSection instanceof HTMLElement)) return;

  const UNLOCK_KEY = "snake.secret.unlocked.v1";

  const reveal = () => {
    secretSection.hidden = false;
    try {
      localStorage.setItem(UNLOCK_KEY, "1");
    } catch {
      // ignore
    }
  };

  try {
    if (localStorage.getItem(UNLOCK_KEY) === "1") {
      reveal();
      return;
    }
  } catch {
    // ignore
  }

  // Unlock method 1: type "snake" anywhere
  const target = "snake";
  let buffer = "";
  let lastAt = 0;

  const onKey = (e) => {
    const active = document.activeElement;
    const inInput =
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      (active instanceof HTMLElement && active.isContentEditable);
    if (inInput) return;

    const now = Date.now();
    if (now - lastAt > 1500) buffer = "";
    lastAt = now;

    const ch = String(e.key || "").toLowerCase();
    if (ch.length !== 1 || ch < "a" || ch > "z") return;

    buffer = (buffer + ch).slice(-target.length);
    if (buffer === target) {
      window.removeEventListener("keydown", onKey);
      if (avatar) avatar.removeEventListener("click", onAvatarClick);
      reveal();
    }
  };

  // Unlock method 2: 7 clicks on avatar (within 2.2s)
  const avatar = document.querySelector(".avatar");
  let clicks = 0;
  let firstClickAt = 0;

  const onAvatarClick = () => {
    const now = Date.now();
    if (!firstClickAt || now - firstClickAt > 2200) {
      firstClickAt = now;
      clicks = 0;
    }
    clicks += 1;
    if (clicks >= 7) {
      window.removeEventListener("keydown", onKey);
      avatar.removeEventListener("click", onAvatarClick);
      reveal();
    }
  };

  window.addEventListener("keydown", onKey);
  if (avatar instanceof HTMLElement) avatar.addEventListener("click", onAvatarClick);
}

function initSnakeGame() {
  const canvas = document.getElementById("snake-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const scoreEl = document.getElementById("snake-score");
  const bestEl = document.getElementById("snake-best");
  const statusEl = document.getElementById("snake-status");
  const nameInput = document.getElementById("snake-name");
  const startBtn = document.getElementById("snake-start");
  const pauseBtn = document.getElementById("snake-pause");
  const resetBtn = document.getElementById("snake-reset");
  const clearBtn = document.getElementById("snake-clear");
  const lbEl = document.getElementById("snake-leaderboard");

  if (
    !(scoreEl instanceof HTMLElement) ||
    !(bestEl instanceof HTMLElement) ||
    !(statusEl instanceof HTMLElement) ||
    !(startBtn instanceof HTMLButtonElement) ||
    !(pauseBtn instanceof HTMLButtonElement) ||
    !(resetBtn instanceof HTMLButtonElement) ||
    !(clearBtn instanceof HTMLButtonElement) ||
    !(lbEl instanceof HTMLOListElement)
  ) {
    return;
  }

  const STORAGE_KEY = "snake.leaderboard.v1";
  const NAME_KEY = "snake.playerName.v1";

  const gridSize = 20;
  const tile = Math.floor(Math.min(canvas.width, canvas.height) / gridSize);
  const fieldSize = gridSize * tile;
  canvas.width = fieldSize;
  canvas.height = fieldSize;

  const colors = {
    bg: "rgba(2, 6, 23, 0.95)",
    grid: "rgba(148, 163, 184, 0.10)",
    snake: "#a78bfa",
    snakeHead: "#22d3ee",
    food: "#fb7185",
    text: "rgba(247, 247, 255, 0.92)"
  };

  function loadLeaderboard() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((x) => x && typeof x.score === "number" && typeof x.name === "string")
        .slice(0, 50);
    } catch {
      return [];
    }
  }

  function saveLeaderboard(entries) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 50)));
    } catch {
      // ignore
    }
  }

  function renderLeaderboard() {
    const entries = loadLeaderboard()
      .slice()
      .sort((a, b) => (b.score - a.score) || (b.ts - a.ts))
      .slice(0, 10);

    lbEl.innerHTML = "";

    if (!entries.length) {
      const li = document.createElement("li");
      li.className = "game__lb-item game__lb-item--empty";
      li.textContent = "Пока пусто. Стань первым!";
      lbEl.appendChild(li);
      bestEl.textContent = "0";
      return;
    }

    bestEl.textContent = String(entries[0].score);

    for (const e of entries) {
      const li = document.createElement("li");
      li.className = "game__lb-item";

      const left = document.createElement("span");
      left.className = "game__lb-name";
      left.textContent = clampName(e.name);

      const right = document.createElement("span");
      right.className = "game__lb-meta";
      right.textContent = `${e.score} · ${formatDate(e.ts)}`;

      li.append(left, right);
      lbEl.appendChild(li);
    }
  }

  const savedName = (() => {
    try {
      return localStorage.getItem(NAME_KEY) || "";
    } catch {
      return "";
    }
  })();
  if (nameInput instanceof HTMLInputElement) {
    nameInput.value = clampName(savedName || "Player");
    nameInput.addEventListener("change", () => {
      const n = clampName(nameInput.value);
      nameInput.value = n;
      try {
        localStorage.setItem(NAME_KEY, n);
      } catch {
        // ignore
      }
    });
  }

  function randCell() {
    return { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
  }

  function eq(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = { x: 10, y: 10 };
  let running = false;
  let paused = false;
  let gameOver = false;
  let score = 0;

  let baseStepMs = 120;
  let stepMs = baseStepMs;
  let accMs = 0;
  let lastT = 0;

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function setScore(v) {
    score = v;
    scoreEl.textContent = String(score);
  }

  function placeFood() {
    let tries = 0;
    let c = randCell();
    while (snake.some((s) => eq(s, c)) && tries < 500) {
      c = randCell();
      tries += 1;
    }
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
    setScore(0);
    baseStepMs = 120;
    stepMs = baseStepMs;
    accMs = 0;
    lastT = 0;
    paused = false;
    gameOver = false;
    running = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = "Пауза";
    startBtn.textContent = "Старт";
    setStatus("Нажми «Старт»");
    draw();
  }

  function addToLeaderboard(finalScore) {
    const name = nameInput instanceof HTMLInputElement ? clampName(nameInput.value) : "Player";
    const entry = { name, score: finalScore, ts: Date.now() };

    const merged = loadLeaderboard().concat(entry);
    merged.sort((a, b) => (b.score - a.score) || (b.ts - a.ts));
    saveLeaderboard(merged.slice(0, 50));
    renderLeaderboard();
  }

  function togglePause(force) {
    if (!running || gameOver) return;
    paused = typeof force === "boolean" ? force : !paused;
    pauseBtn.textContent = paused ? "Продолжить" : "Пауза";
    setStatus(paused ? "Пауза" : "Играем");
  }

  function start() {
    if (gameOver) resetGame();
    if (!running) {
      running = true;
      paused = false;
      pauseBtn.disabled = false;
      pauseBtn.textContent = "Пауза";
      startBtn.textContent = "Рестарт";
      setStatus("Играем");
      requestAnimationFrame(loop);
    } else {
      resetGame();
      start();
    }
  }

  function step() {
    dir = nextDir;
    const head = snake[0];
    const newHead = { x: head.x + dir.x, y: head.y + dir.y };

    if (newHead.x < 0 || newHead.y < 0 || newHead.x >= gridSize || newHead.y >= gridSize) {
      endGame();
      return;
    }

    if (snake.some((s) => eq(s, newHead))) {
      endGame();
      return;
    }

    snake.unshift(newHead);

    if (eq(newHead, food)) {
      const newScore = score + 10;
      setScore(newScore);

      const eaten = newScore / 10;
      if (eaten % 5 === 0) {
        stepMs = Math.max(55, stepMs - 10);
      }

      placeFood();
    } else {
      snake.pop();
    }
  }

  function endGame() {
    running = false;
    gameOver = true;
    paused = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = "Пауза";
    setStatus(`Game Over · ${score}`);
    addToLeaderboard(score);
    startBtn.textContent = "Снова";
    draw();
  }

  function drawCell(x, y, fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(x * tile, y * tile, tile, tile);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (let i = 1; i < gridSize; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * tile + 0.5, 0);
      ctx.lineTo(i * tile + 0.5, fieldSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * tile + 0.5);
      ctx.lineTo(fieldSize, i * tile + 0.5);
      ctx.stroke();
    }

    drawCell(food.x, food.y, colors.food);

    snake.forEach((s, idx) => {
      drawCell(s.x, s.y, idx === 0 ? colors.snakeHead : colors.snake);
    });

    if (!running && !gameOver) {
      ctx.fillStyle = colors.text;
      ctx.font = "600 14px Space Grotesk, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Нажми «Старт»", fieldSize / 2, fieldSize / 2);
      ctx.textAlign = "start";
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
        if (!running) break;
      }
    }

    draw();
    requestAnimationFrame(loop);
  }

  function setDir(x, y) {
    if (paused || gameOver) return;
    if (x === -dir.x && y === -dir.y) return;
    nextDir = { x, y };
  }

  function onKeyDown(e) {
    const k = e.key;
    if (k === " " || k === "Spacebar") {
      e.preventDefault();
      togglePause();
      return;
    }

    if (!running) return;

    if (k === "ArrowUp" || k === "w" || k === "W" || k === "ц" || k === "Ц") setDir(0, -1);
    else if (k === "ArrowDown" || k === "s" || k === "S" || k === "ы" || k === "Ы") setDir(0, 1);
    else if (k === "ArrowLeft" || k === "a" || k === "A" || k === "ф" || k === "Ф") setDir(-1, 0);
    else if (k === "ArrowRight" || k === "d" || k === "D" || k === "в" || k === "В") setDir(1, 0);
  }

  startBtn.addEventListener("click", start);
  pauseBtn.addEventListener("click", () => togglePause());
  resetBtn.addEventListener("click", () => {
    try {
      const name = nameInput instanceof HTMLInputElement ? clampName(nameInput.value) : "Player";
      localStorage.setItem(NAME_KEY, name);
    } catch {
      // ignore
    }
    resetGame();
    renderLeaderboard();
  });
  clearBtn.addEventListener("click", () => {
    saveLeaderboard([]);
    renderLeaderboard();
  });

  window.addEventListener("keydown", onKeyDown, { passive: false });
  renderLeaderboard();
  resetGame();
}

window.addEventListener("DOMContentLoaded", () => {
  typeNextChar();
  initSecretSnakeReveal();
  initSnakeGame();

  const root = document.documentElement;

  window.addEventListener("pointermove", (event) => {
    const { innerWidth, innerHeight } = window;
    if (!innerWidth || !innerHeight) return;

    const x = (event.clientX / innerWidth) * 100;
    const y = (event.clientY / innerHeight) * 100;

    root.style.setProperty("--mx", `${x}%`);
    root.style.setProperty("--my", `${y}%`);
  });
});