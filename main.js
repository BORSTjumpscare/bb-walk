const SPAWN_INTERVAL = 10000; // 10 seconds
const SPAWN_CHANCE = 0.03;    // 3%
let balloonActive = false;

// Secret code detection
const SECRET_CODE = ["f","n","a","f"];
let keyBuffer = [];
let lastKeyTime = 0;
const SECRET_TIME_LIMIT = 3000; // 3 seconds

// Random peek chance every 10s
function trySpawnBalloonBoy() {
  if (!balloonActive && Math.random() < SPAWN_CHANCE) {
    peekBalloonBoy();
  }
}

// Peek function (left/right only)
function peekBalloonBoy() {
  balloonActive = true;

  const peekImg = document.createElement("img");
  peekImg.src = chrome.runtime.getURL("balloon-boy-standing.png");
  peekImg.style.position = "fixed";
  peekImg.style.width = "150px";
  peekImg.style.zIndex = "999999";
  peekImg.style.pointerEvents = "none";
  peekImg.style.transition = "all 0.5s ease";

  const screenHeight = window.innerHeight;

  // Random height on screen
  const minHeight = screenHeight * 0.2;
  const maxHeight = screenHeight * 0.6;
  const peekHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
  peekImg.style.bottom = `${peekHeight}px`;

  // Random side: 0 = left, 1 = right
  const fromLeft = Math.random() < 0.5;

  // Rotate PNG so top points to opposite side
  if(fromLeft){
    peekImg.style.left = "-150px";
    peekImg.style.transform = "rotate(0deg)"; // top points right
  } else {
    peekImg.style.right = "-150px";
    peekImg.style.transform = "rotate(180deg)"; // top points left
  }

  document.body.appendChild(peekImg);

  // Glide in
  requestAnimationFrame(() => {
    if(fromLeft) peekImg.style.left = "0px";
    else peekImg.style.right = "0px";
  });

  // Peek 1s, then glide out
  setTimeout(() => {
    if(fromLeft) peekImg.style.left = "-150px";
    else peekImg.style.right = "-150px";

    setTimeout(() => {
      peekImg.remove();
      // Walk always follows, same side, same height
      setTimeout(() => spawnBalloonBoy(fromLeft, peekHeight), 500); // 0.5s wait
    }, 500); // glide-out duration
  }, 1000); // peek duration
}

// Walking Balloon Boy
// fromLeft: side peek came from
// walkHeight: same as peek
function spawnBalloonBoy(fromLeft, walkHeight){
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("balloon-boy.gif");
  img.style.position="fixed";
  img.style.width="150px";
  img.style.zIndex="999999";
  img.style.pointerEvents="none";
  img.style.transition="transform 8s linear";
  img.style.bottom = `${walkHeight}px`;

  const screenWidth = window.innerWidth + 400;

  if(fromLeft){
    img.style.left="-200px";
    img.style.transform = `scaleX(-1) translateX(${screenWidth}px)`; // mirrored
  } else {
    img.style.right="-200px";
    img.style.transform = `translateX(-${screenWidth}px)`;           // normal
  }

  document.body.appendChild(img);
  void img.offsetWidth; // force reflow

  // Animate walk across screen (mirrored if from left)
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
  if(now - lastKeyTime > SECRET_TIME_LIMIT) keyBuffer = [];
  lastKeyTime = now;

  keyBuffer.push(e.key.toLowerCase());
  if(keyBuffer.length > SECRET_CODE.length) keyBuffer.shift();

  if(keyBuffer.length === SECRET_CODE.length &&
     keyBuffer.every((k,i) => k === SECRET_CODE[i])) {
       if(!balloonActive) peekBalloonBoy();
       keyBuffer = [];
  }
});

// Random peek every 10s (3% chance)
setInterval(trySpawnBalloonBoy, SPAWN_INTERVAL);
