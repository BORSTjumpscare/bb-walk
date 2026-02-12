// DEBUG: Immediately show the PNG and GIF to check they load
(function testAssets() {
  const testPeek = document.createElement("img");
  testPeek.src = chrome.runtime.getURL("balloon-boy-standing.png");
  testPeek.style.position = "fixed";
  testPeek.style.top = "10px";
  testPeek.style.left = "10px";
  testPeek.style.width = "150px";
  testPeek.style.zIndex = "999999";
  document.body.appendChild(testPeek);

  const testWalk = document.createElement("img");
  testWalk.src = chrome.runtime.getURL("balloon-boy.gif");
  testWalk.style.position = "fixed";
  testWalk.style.top = "10px";
  testWalk.style.left = "200px";
  testWalk.style.width = "150px";
  testWalk.style.zIndex = "999999";
  document.body.appendChild(testWalk);

  console.log("Debug: Test images added to page");
})();

const SPAWN_INTERVAL = 10000; // 10 seconds
const SPAWN_CHANCE = 0.03;    // 3%
let balloonActive = false;     // Only one Balloon Boy at a time

// Secret code
const SECRET_CODE = ["f", "n", "a", "f"];
let keyBuffer = [];
let lastKeyTime = 0;
const SECRET_TIME_LIMIT = 3000; // 3 seconds

// Try random spawn
function trySpawnBalloonBoy() {
  if (!balloonActive && Math.random() < SPAWN_CHANCE) {
    peekBalloonBoy();
  }
}

// Peek function
function peekBalloonBoy() {
  balloonActive = true;

  const peekImg = document.createElement("img");
  peekImg.src = chrome.runtime.getURL("balloon-boy-standing.png");
  peekImg.style.position = "fixed";
  peekImg.style.width = "150px";
  peekImg.style.zIndex = "999999";
  peekImg.style.pointerEvents = "none";
  peekImg.style.transition = "transform 0.3s ease, left 0.3s ease, right 0.3s ease, top 0.3s ease, bottom 0.3s ease";

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const minHeight = screenHeight * 0.2;
  const maxHeight = screenHeight * 0.6;
  const minWidth = screenWidth * 0.2;
  const maxWidth = screenWidth * 0.6;

  let randomHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
  let randomWidth = Math.floor(Math.random() * (maxWidth - minWidth) + minWidth);

  const side = Math.floor(Math.random() * 4); // 0=left,1=right,2=top,3=bottom
  let fromLeft = false;

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

  // Slide-in peek
  requestAnimationFrame(() => {
    switch (side) {
      case 0: peekImg.style.left = "0px"; break;
      case 1: peekImg.style.right = "0px"; break;
      case 2: peekImg.style.top = "20px"; break;
      case 3: peekImg.style.bottom = "20px"; break;
    }
  });

  // Peek 1s + wait 1s → then walk
  setTimeout(() => {
    peekImg.remove();
    setTimeout(() => {
      spawnBalloonBoy(fromLeft);
    }, 1000);
  }, 1000);
}

// Walking Balloon Boy
function spawnBalloonBoy(fromLeft = null) {
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("balloon-boy.gif");
  img.style.position = "fixed";
  img.style.width = "150px";
  img.style.zIndex = "999999";
  img.style.pointerEvents = "none";
  img.style.transition = "transform 8s linear";

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

  void img.offsetWidth; // force reflow

  img.style.transform = fromLeft
    ? `scaleX(-1) translateX(-${screenWidth}px)`
    : `translateX(-${screenWidth}px)`;

  setTimeout(() => {
    img.remove();
    balloonActive = false;
  }, 8000);
}

// Secret code listener
window.addEventListener("keydown", (e) => {
  const now = Date.now();
  if (now - lastKeyTime > SECRET_TIME_LIMIT) keyBuffer = [];
  lastKeyTime = now;
  keyBuffer.push(e.key.toLowerCase());
  if (keyBuffer.length > SECRET_CODE.length) keyBuffer.shift();

  if (keyBuffer.length === SECRET_CODE.length && keyBuffer.every((k, i) => k === SECRET_CODE[i])) {
    if (!balloonActive) peekBalloonBoy();
    keyBuffer = [];
  }
});

// Random spawn every 10s
setInterval(trySpawnBalloonBoy, SPAWN_INTERVAL);
