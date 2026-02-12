const SPAWN_INTERVAL = 10000; // 10 seconds
const SPAWN_CHANCE = 0.03;    // 3%
let balloonActive = false;     // Prevent multiple spawns

// For secret code detection
const SECRET_CODE = ["f", "n", "a", "f"];
let keyBuffer = [];
let lastKeyTime = 0;
const SECRET_TIME_LIMIT = 3000; // 3 seconds

function trySpawnBalloonBoy() {
  if (!balloonActive && Math.random() < SPAWN_CHANCE) {
    spawnBalloonBoy();
  }
}

function spawnBalloonBoy() {
  balloonActive = true;

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("balloon-boy.gif");

  img.style.position = "fixed";
  img.style.bottom = "0px";
  img.style.width = "150px";
  img.style.zIndex = "999999";
  img.style.pointerEvents = "none";
  img.style.transition = "transform 8s linear";

  // Random vertical position (20% to 60% of screen height)
  const minHeight = window.innerHeight * 0.2;
  const maxHeight = window.innerHeight * 0.6;
  const randomHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
  img.style.bottom = `${randomHeight}px`;

  // Randomly choose side
  const fromLeft = Math.random() < 0.5;
  const screenWidth = window.innerWidth + 400;

  if (fromLeft) {
    img.style.left = "-200px";   // start off-screen left
    img.style.transform = `scaleX(-1) translateX(${screenWidth}px)`; // mirrored
  } else {
    img.style.right = "-200px";  // start off-screen right
    img.style.transform = `translateX(-${screenWidth}px)`;           // normal
  }

  document.body.appendChild(img);

  // Force reflow so transition works
  void img.offsetWidth;

  // Animate across screen
  img.style.transform = fromLeft
    ? `scaleX(-1) translateX(-${screenWidth}px)`
    : `translateX(-${screenWidth}px)`;

  // Remove after animation completes
  setTimeout(() => {
    img.remove();
    balloonActive = false;
  }, 8000);
}

// Secret code listener
window.addEventListener("keydown", (e) => {
  const now = Date.now();

  if (now - lastKeyTime > SECRET_TIME_LIMIT) {
    keyBuffer = [];
  }

  lastKeyTime = now;
  keyBuffer.push(e.key.toLowerCase());

  if (keyBuffer.length > SECRET_CODE.length) {
    keyBuffer.shift();
  }

  if (
    keyBuffer.length === SECRET_CODE.length &&
    keyBuffer.every((k, i) => k === SECRET_CODE[i])
  ) {
    if (!balloonActive) {
      spawnBalloonBoy();
    }
    keyBuffer = [];
  }
});

// Run every 10 seconds
setInterval(trySpawnBalloonBoy, SPAWN_INTERVAL);
