const SPAWN_INTERVAL = 10000; // 10 seconds
const SPAWN_CHANCE = 0.03;    // 3%
let balloonActive = false;

// Secret code detection
const SECRET_CODE = ["f","n","a","f"];
let keyBuffer = [];
let lastKeyTime = 0;
const SECRET_TIME_LIMIT = 3000; // 3 seconds

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
  peekImg.style.transition = "all 0.6s ease"; // SLOWER glide

  const screenHeight = window.innerHeight;

  // Random visible height
  const minHeight = screenHeight * 0.2;
  const maxHeight = screenHeight * 0.6;
  const peekHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
  peekImg.style.bottom = `${peekHeight}px`;

  const fromLeft = Math.random() < 0.5;

  if (fromLeft) {
    peekImg.style.left = "-150px";
    peekImg.style.transform = "rotate(0deg)"; // top points right
  } else {
    peekImg.style.right = "-150px";
    peekImg.style.transform = "rotate(180deg)"; // top points left
  }

  document.body.appendChild(peekImg);

  // Glide in
  requestAnimationFrame(() => {
    if (fromLeft) peekImg.style.left = "0px";
    else peekImg.style.right = "0px";
  });

  // Visible for 1 second
  setTimeout(() => {

    // Glide out
    if (fromLeft) peekImg.style.left = "-150px";
    else peekImg.style.right = "-150px";

    setTimeout(() => {
      peekImg.remove();

      // SHORT WAIT before walk (this is what you wanted faster)
      setTimeout(() => {
        spawnBalloonBoy(fromLeft, peekHeight);
      }, 150); // 🔥 very short 0.15s delay

    }, 600); // matches glide-out duration

  }, 1000);
}

// Walking
function spawnBalloonBoy(fromLeft, walkHeight) {

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("balloon-boy.gif");
  img.style.position = "fixed";
  img.style.width = "150px";
  img.style.zIndex = "999999";
  img.style.pointerEvents = "none";
  img.style.bottom = `${walkHeight}px`;
  img.style.transition = "transform 7s linear"; // SLOWER walk

  const screenWidth = window.innerWidth + 400;

  if (fromLeft) {
    img.style.left = "-200px";
    img.style.transform = `scaleX(-1) translateX(${screenWidth}px)`;
  } else {
    img.style.right = "-200px";
    img.style.transform = `translateX(-${screenWidth}px)`;
  }

  document.body.appendChild(img);
  void img.offsetWidth;

  img.style.transform = fromLeft
    ? `scaleX(-1) translateX(-${screenWidth}px)`
    : `translateX(-${screenWidth}px)`;

  setTimeout(() => {
    img.remove();
    balloonActive = false;
  }, 7000);
}

// Secret code
window.addEventListener("keydown", (e) => {
  const now = Date.now();
  if (now - lastKeyTime > SECRET_TIME_LIMIT) keyBuffer = [];
  lastKeyTime = now;

  keyBuffer.push(e.key.toLowerCase());
  if (keyBuffer.length > SECRET_CODE.length) keyBuffer.shift();

  if (
    keyBuffer.length === SECRET_CODE.length &&
    keyBuffer.every((k, i) => k === SECRET_CODE[i])
  ) {
    if (!balloonActive) peekBalloonBoy();
    keyBuffer = [];
  }
});

setInterval(trySpawnBalloonBoy, SPAWN_INTERVAL);
