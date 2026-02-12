// main.js

const SPAWN_INTERVAL = 10000; // 10 seconds
const SPAWN_CHANCE = 0.03;    // 3%

function trySpawnBalloonBoy() {
  if (Math.random() < SPAWN_CHANCE) {
    spawnBalloonBoy();
  }
}

function spawnBalloonBoy() {
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("balloon-boy.gif");

  img.style.position = "fixed";
  img.style.bottom = "0px";
  img.style.right = "-200px"; // start off-screen
  img.style.width = "150px";
  img.style.zIndex = "999999";
  img.style.pointerEvents = "none";
  img.style.transition = "transform 8s linear";

  document.body.appendChild(img);

  // Force reflow so transition works
  void img.offsetWidth;

  // Move across screen
  const screenWidth = window.innerWidth + 400;
  img.style.transform = `translateX(-${screenWidth}px)`;

  // Remove after animation completes
  setTimeout(() => {
    img.remove();
  }, 8000);
}

// Run every 10 seconds
setInterval(trySpawnBalloonBoy, SPAWN_INTERVAL);
