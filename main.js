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

window.addEventListener("DOMContentLoaded", () => {
  typeNextChar();

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