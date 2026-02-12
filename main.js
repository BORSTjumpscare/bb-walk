const SPAWN_INTERVAL = 10000; // 10 seconds
const SPAWN_CHANCE = 0.03;    // 3%
let balloonActive = false;     // Prevent multiple spawns

// Secret code detection
const SECRET_CODE = ["f", "n", "a", "f"];
let keyBuffer = [];
let lastKeyTime = 0;
const SECRET_TIME_LIMIT = 3000; // 3 seconds

function trySpawnBalloonBoy() {
  if (!balloonActive && Math.random() < SPAWN_CHANCE) {
    peekBalloonBoy();
  }
}

// Peek from a random side with slide-in, then walk
function peekBalloonBoy() {
  balloonActive = true;

  const peekImg = document.createElement("img");
peekImg.src = chrome.runtime.getURL("balloon-boy-standing.png");
img.src = chrome.runtime.getURL("balloon-boy.gif");
  peekImg.style.position = "fixed";
  peekImg.style.width = "150px";
  peekImg.style.zIndex = "999999";
  peekImg.style.pointerEvents = "none";
  peekImg.style.transition = "transform 0.3s ease, left 0.3s ease, right 0.3s ease, top 0.3s ease, bottom 0.3s ease";

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Random vertical or horizontal position
  const minHeight = screenHeight * 0.2;
  const maxHeight = screenHeight * 0.6;
  const minWidth = screenWidth * 0.2;
  const maxWidth = screenWidth * 0.6;

  let randomHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
  let randomWidth = Math.floor(Math.random() * (maxWidth - minWidth) + minWidth);

  // Random side: 0=left,1=right,2=top,3=bottom
  const side = Math.floor(Math.random() * 4);
  let fromLeft = false;

  // Initial off-screen position
  switch (side) {
    case 0: // left
      peekImg.style.left = "-120px";
      peekImg.style.bottom = `${randomHeight}px`;
      peekImg.style.transform = "rotate(15deg)";
      fromLeft = true;
      break;
    case 1: // right
      peekImg.style.right = "-120px";
      peekImg.style.bottom = `${randomHeight}px`;
      peekImg.style.transform = "rotate(-15deg)";
      fromLeft = false;
      break;
    case 2: // top
      peekImg.style.top = "-120px";
      peekImg.style.left = `${randomWidth}px`;
      peekImg.style.transform = "rotate(0deg)";
      fromLeft = Math.random() < 0.5;
      break;
    case 3: // bottom
      peekImg.style.bottom = "-120px";
      peekImg.style.left = `${randomWidth}px`;
      peekImg.style.transform = "rotate(0deg)";
      fromLeft = Math.random() < 0.5;
      break;
  }

  document.body.appendChild(peekImg);

  // Slide-in animation (peek)
  setTimeout(() => {
    switch (side) {
      case 0: peekImg.style.left = "0px"; break;
      case 1: peekImg.style.right = "0px"; break;
      case 2: peekImg.style.top = "20px"; break;
      case 3: peekImg.style.bottom = "20px"; break;
    }
  }, 50);

  // After 1 sec peek + 1 sec wait, remove peek and spawn walking
  setTimeout(() => {
    peekImg.remove();
    setTimeout(() => {
      spawnBalloonBoy(fromLeft);
    }, 1000);
  }, 1000);
}

// Spawn walking Balloon Boy (from left or right)
function spawnBalloonBoy(fromLeft = null) {
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("balloon-boy.gif");

  img.style.position = "fixed";
  img.style.width = "150px";
  img.style.zIndex = "999999";
  img.style.pointerEvents = "none";
  img.style.transition = "transform 8s linear";

  // Random vertical position
  const minHeight = window.innerHeight * 0.2;
  const maxHeight = window.innerHeight * 0.6;
  const randomHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
  img.style.bottom = `${randomHeight}px`;

  if (fromLeft === null) fromLeft = Math.random() < 0.5;

  const screenWidth = window.innerWidth + 400;

  if (fromLeft) {
    img.style.left = "-200px";
    img.style.transform = `scaleX(-1) translateX(${screenWidth}px)`; // mirrored
  } else {
    img.style.right = "-200px";
    img.style.transform = `translateX(-${screenWidth}px)`;           // normal
  }

  document.body.appendChild(img);

  // Force reflow
  void img.offsetWidth;

  // Animate across screen
  img.style.transform = fromLeft
    ? `scaleX(-1) translateX(-${screenWidth}px)`
    : `translateX(-${screenWidth}px)`;

  // Remove after animation
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
      peekBalloonBoy(); // secret code triggers peek first
    }
    keyBuffer = [];
  }
});

// Run every 10 seconds
setInterval(trySpawnBalloonBoy, SPAWN_INTERVAL);
