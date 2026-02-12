const SPAWN_INTERVAL = 10000; // 10 sec
const SPAWN_CHANCE = 0.03;    // 3%
let balloonActive = false;

// Secret code
const SECRET_CODE = ["f","n","a","f"];
let keyBuffer = [];
let lastKeyTime = 0;
const SECRET_TIME_LIMIT = 3000;


// Random spawn check
function trySpawnBalloonBoy() {
  if (!balloonActive && Math.random() < SPAWN_CHANCE) {
    startSequence();
  }
}


function startSequence() {
  balloonActive = true;

  const fromLeft = Math.random() < 0.5;
  const screenHeight = window.innerHeight;

  const minHeight = screenHeight * 0.2;
  const maxHeight = screenHeight * 0.6;
  const height = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);

  peek(fromLeft, height);
}


// --------------------
// PEEK
// --------------------
function peek(fromLeft, height) {

  const peekImg = document.createElement("img");
  peekImg.src = chrome.runtime.getURL("balloon-boy-standing.png");

  peekImg.style.position = "fixed";
  peekImg.style.width = "150px";
  peekImg.style.zIndex = "999999";
  peekImg.style.pointerEvents = "none";
  peekImg.style.bottom = `${height}px`;
  peekImg.style.transition = "all 0.6s ease";

  if (fromLeft) {
    peekImg.style.left = "-150px";
  } else {
    peekImg.style.right = "-150px";
  }

  document.body.appendChild(peekImg);

  requestAnimationFrame(() => {
    if (fromLeft) peekImg.style.left = "0px";
    else peekImg.style.right = "0px";
  });

  setTimeout(() => {

    if (fromLeft) peekImg.style.left = "-150px";
    else peekImg.style.right = "-150px";

    setTimeout(() => {
      peekImg.remove();

      setTimeout(() => {
        walk(fromLeft, height);
      }, 150); // short wait between peek & walk

    }, 600);

  }, 1000);
}


// --------------------
// WALK (WITH MIRROR FIX)
// --------------------
function walk(fromLeft, height) {

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("balloon-boy.gif");

  img.style.position = "fixed";
  img.style.width = "150px";
  img.style.zIndex = "999999";
  img.style.pointerEvents = "none";
  img.style.bottom = `${height}px`;
  img.style.transition = "all 7s linear";

  const screenWidth = window.innerWidth + 300;

  if (fromLeft) {
    // Start left → walk right
    img.style.left = "-200px";

    // 🔥 Mirror ONLY when from left
    img.style.transform = "scaleX(-1)";

    document.body.appendChild(img);

    requestAnimationFrame(() => {
      img.style.left = `${screenWidth}px`;
    });

  } else {
    // Start right → walk left
    img.style.right = "-200px";

    // Normal orientation
    img.style.transform = "scaleX(1)";

    document.body.appendChild(img);

    requestAnimationFrame(() => {
      img.style.right = `${screenWidth}px`;
    });
  }

  setTimeout(() => {
    img.remove();
    balloonActive = false;
  }, 7000);
}


// --------------------
// SECRET CODE
// --------------------
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
      startSequence();
    }
    keyBuffer = [];
  }
});


setInterval(trySpawnBalloonBoy, SPAWN_INTERVAL);
