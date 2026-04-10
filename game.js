const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const gameShell = document.querySelector(".game-shell");
const startPanel = document.getElementById("start-panel");
const startGameButton = document.getElementById("start-game");
const nicknameInput = document.getElementById("nickname-input");
const nicknameHelp = document.getElementById("nickname-help");
const gameOverOverlay = document.getElementById("game-over-overlay");
const finalScoreText = document.getElementById("final-score");
const saveFeedback = document.getElementById("save-feedback");
const restartGameButton = document.getElementById("restart-game");
const toggleRankingButton = document.getElementById("toggle-ranking");
const rankingPanel = document.getElementById("ranking-panel");
const closeRankingButton = document.getElementById("close-ranking");
const rankingList = document.getElementById("ranking");
const poopSprite = new Image();
const poopSpriteMarkup = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="poopBody" x1="0.18" x2="0.82" y1="0.08" y2="0.92">
        <stop offset="0" stop-color="#d39b5d"/>
        <stop offset="0.42" stop-color="#9a6036"/>
        <stop offset="1" stop-color="#6e3e20"/>
      </linearGradient>
      <radialGradient id="poopHighlight" cx="0.33" cy="0.2" r="0.7">
        <stop offset="0" stop-color="#f0c98e" stop-opacity="0.95"/>
        <stop offset="1" stop-color="#f0c98e" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <path fill="url(#poopBody)" d="M66 10c8 0 16 7 16 17 0 4-1 8-4 12 10 4 17 13 17 25 0 2 0 4-1 6 14 2 25 14 25 29 0 17-14 31-31 31H33C16 130 2 116 2 99c0-16 12-29 27-31a27 27 0 0 1-1-7c0-15 10-27 24-30-2-3-3-7-3-11 0-11 8-20 17-20z"/>
    <path fill="url(#poopHighlight)" d="M61 18c7 0 13 6 13 14 0 4-2 8-5 10 7 1 14 8 15 17-12-8-29-12-45-8 1-10 9-18 18-20-3-2-4-6-4-10 0-8 4-13 8-13z"/>
    <ellipse cx="43" cy="75" rx="18" ry="22" fill="#fffdf8"/>
    <ellipse cx="86" cy="75" rx="18" ry="22" fill="#fffdf8"/>
    <ellipse cx="46" cy="77" rx="10" ry="14" fill="#1d1715"/>
    <ellipse cx="83" cy="77" rx="10" ry="14" fill="#1d1715"/>
    <path fill="#fffdf8" d="M33 97c7 11 18 17 31 17s24-6 31-17c-8-3-18-4-31-4s-23 1-31 4z"/>
  </svg>
`;

const RANKING_KEY = "ranking";
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const POOP_SIZE = 42;
const POOP_MASK_SIZE = 128;
const POOP_ALPHA_THRESHOLD = 16;
const PLAYER_WIDTH = POOP_SIZE;
const PLAYER_HEIGHT = POOP_SIZE;
const PLAYER_Y = CANVAS_HEIGHT - PLAYER_HEIGHT - 38;
const PLAYER_SPEED = 560;
const PLAYER_SMOOTHING = 15;
const FALL_SPEED = 280;
const SPAWN_INTERVAL = 0.75;

const player = {
  x: 0,
  y: PLAYER_Y,
  w: PLAYER_WIDTH,
  h: PLAYER_HEIGHT,
  vx: 0
};

let poops = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
let spawnTimer = 0;
let lastFrameTime = 0;
let currentNickname = "";
let poopMaskAlpha = null;

const pressedKeys = {
  left: false,
  right: false
};

let poopSpriteReady = false;

poopSprite.addEventListener("load", () => {
  const poopMaskCanvas = document.createElement("canvas");
  const poopMaskContext = poopMaskCanvas.getContext("2d", { willReadFrequently: true });

  poopMaskCanvas.width = POOP_MASK_SIZE;
  poopMaskCanvas.height = POOP_MASK_SIZE;
  poopMaskContext.clearRect(0, 0, POOP_MASK_SIZE, POOP_MASK_SIZE);
  poopMaskContext.drawImage(poopSprite, 0, 0, POOP_MASK_SIZE, POOP_MASK_SIZE);
  poopMaskAlpha = poopMaskContext.getImageData(0, 0, POOP_MASK_SIZE, POOP_MASK_SIZE).data;
  poopSpriteReady = true;
});

poopSprite.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(poopSpriteMarkup)}`;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getBodyPadding(axisStart, axisEnd) {
  const styles = window.getComputedStyle(document.body);
  return (
    Number.parseFloat(styles.getPropertyValue(axisStart)) +
    Number.parseFloat(styles.getPropertyValue(axisEnd))
  );
}

function resizeGameLayout() {
  const verticalPadding = getBodyPadding("padding-top", "padding-bottom");
  const horizontalPadding = getBodyPadding("padding-left", "padding-right");
  const shellStyles = window.getComputedStyle(gameShell);
  const shellGap = Number.parseFloat(shellStyles.getPropertyValue("row-gap")) || 0;
  const title = gameShell.querySelector("h1");

  const calculateStageWidth = () => {
    const titleHeight = title.getBoundingClientRect().height;
    const maxWidthFromViewport = Math.max(220, Math.min(window.innerWidth - horizontalPadding, 800));
    const availableHeight = Math.max(
      220,
      window.innerHeight - verticalPadding - titleHeight - shellGap
    );
    const maxWidthFromHeight = (availableHeight * CANVAS_WIDTH) / CANVAS_HEIGHT;
    return Math.floor(Math.max(220, Math.min(maxWidthFromViewport, maxWidthFromHeight)));
  };

  gameShell.style.setProperty(
    "--shell-width",
    `${Math.max(220, Math.min(window.innerWidth - horizontalPadding, 800))}px`
  );
  let stageWidth = calculateStageWidth();

  gameShell.style.setProperty("--stage-width", `${stageWidth}px`);
  gameShell.style.setProperty("--shell-width", `${stageWidth}px`);

  stageWidth = calculateStageWidth();
  gameShell.style.setProperty("--stage-width", `${stageWidth}px`);
  gameShell.style.setProperty("--shell-width", `${stageWidth}px`);
}

function getInitialPlayerX() {
  return (CANVAS_WIDTH - player.w) / 2;
}

function resetPlayerPosition() {
  player.x = getInitialPlayerX();
  player.y = PLAYER_Y;
  player.vx = 0;
}

function setOverlayVisibility(element, isVisible) {
  element.classList.toggle("hidden", !isVisible);
}

function setRankingVisibility(isVisible) {
  rankingPanel.classList.toggle("hidden", !isVisible);
}

function setFeedback(message, tone = "") {
  saveFeedback.textContent = message;
  saveFeedback.className = "overlay-help";

  if (tone) {
    saveFeedback.classList.add(tone);
  }
}

function drawPlayer() {
  ctx.fillStyle = "#2d6df6";
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

function drawPoop(poop) {
  if (poopSpriteReady) {
    ctx.drawImage(poopSprite, poop.x, poop.y, poop.w, poop.h);
    return;
  }

  ctx.font = `${Math.round(poop.h)}px serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("💩", poop.x, poop.y);
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "28px sans-serif";
  ctx.fillText(`Score: ${score}`, 16, 36);
}

function drawIdleScreen() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(40, 50, CANVAS_WIDTH - 80, CANVAS_HEIGHT - 100);
  drawPlayer();
}

function spawnPoop() {
  poops.push({
    x: Math.random() * (CANVAS_WIDTH - POOP_SIZE),
    y: -POOP_SIZE,
    w: POOP_SIZE,
    h: POOP_SIZE
  });
}

function updatePlayer(deltaTime) {
  const moveDirection = Number(pressedKeys.right) - Number(pressedKeys.left);
  const targetVelocity = moveDirection * PLAYER_SPEED;
  const smoothing = Math.min(1, deltaTime * PLAYER_SMOOTHING);

  player.vx += (targetVelocity - player.vx) * smoothing;
  player.x += player.vx * deltaTime;

  const clampedX = clamp(player.x, 0, CANVAS_WIDTH - player.w);
  if (clampedX !== player.x) {
    player.x = clampedX;
    player.vx = 0;
    return;
  }

  player.x = clampedX;
}

function hasCollision(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function getPlayerHitbox() {
  return {
    x: player.x,
    y: player.y,
    w: player.w,
    h: player.h
  };
}

function hasPoopPixelCollision(playerHitbox, poop) {
  if (!poopSpriteReady || !poopMaskAlpha) {
    return hasCollision(playerHitbox, poop);
  }

  const overlapLeft = Math.max(playerHitbox.x, poop.x);
  const overlapTop = Math.max(playerHitbox.y, poop.y);
  const overlapRight = Math.min(playerHitbox.x + playerHitbox.w, poop.x + poop.w);
  const overlapBottom = Math.min(playerHitbox.y + playerHitbox.h, poop.y + poop.h);

  if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) {
    return false;
  }

  const startX = Math.floor(overlapLeft);
  const endX = Math.ceil(overlapRight);
  const startY = Math.floor(overlapTop);
  const endY = Math.ceil(overlapBottom);

  for (let y = startY; y < endY; y += 1) {
    const spriteY = Math.floor(((y + 0.5 - poop.y) / poop.h) * POOP_MASK_SIZE);

    if (spriteY < 0 || spriteY >= POOP_MASK_SIZE) {
      continue;
    }

    for (let x = startX; x < endX; x += 1) {
      const spriteX = Math.floor(((x + 0.5 - poop.x) / poop.w) * POOP_MASK_SIZE);

      if (spriteX < 0 || spriteX >= POOP_MASK_SIZE) {
        continue;
      }

      const alphaIndex = (spriteY * POOP_MASK_SIZE + spriteX) * 4 + 3;
      if (poopMaskAlpha[alphaIndex] > POOP_ALPHA_THRESHOLD) {
        return true;
      }
    }
  }

  return false;
}

function normalizeRanking(rawRanking) {
  const rankingMap = new Map();

  rawRanking.forEach(entry => {
    if (!entry) return;

    const name = String(entry.name || "").trim();
    const accountKey = String(entry.accountKey || name).trim().toLowerCase();
    const scoreValue = Number(entry.score);

    if (!name || !accountKey || !Number.isFinite(scoreValue)) return;

    const existing = rankingMap.get(accountKey);
    if (!existing || scoreValue > existing.score) {
      rankingMap.set(accountKey, {
        name,
        accountKey,
        score: scoreValue
      });
    }
  });

  return [...rankingMap.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function readStoredRanking() {
  try {
    const savedRanking = JSON.parse(localStorage.getItem(RANKING_KEY));
    return Array.isArray(savedRanking) ? savedRanking : [];
  } catch (error) {
    return [];
  }
}

function loadRanking() {
  return normalizeRanking(readStoredRanking());
}

function persistRanking(ranking) {
  localStorage.setItem(RANKING_KEY, JSON.stringify(normalizeRanking(ranking)));
}

function showRanking() {
  const ranking = loadRanking();
  rankingList.innerHTML = "";
  persistRanking(ranking);

  if (ranking.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-ranking";
    li.textContent = "아직 저장된 기록이 없어요.";
    rankingList.appendChild(li);
    return;
  }

  ranking.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.name} - ${entry.score}점`;
    rankingList.appendChild(li);
  });
}

function saveRankingIfEligible() {
  const name = currentNickname.trim();

  if (!name) {
    return "닉네임이 없어서 이번 기록은 랭킹에 저장되지 않았어요.";
  }

  const accountKey = name.toLowerCase();
  const ranking = loadRanking();
  const existingEntry = ranking.find(entry => entry.accountKey === accountKey);

  if (existingEntry) {
    if (score > existingEntry.score) {
      existingEntry.name = name;
      existingEntry.score = score;
      persistRanking(ranking);
      showRanking();
      return `최고기록이 갱신됐어요! ${name} - ${score}점`;
    }

    showRanking();
    return `${name}의 최고기록은 ${existingEntry.score}점이라 랭킹은 유지됐어요.`;
  }

  ranking.push({ name, accountKey, score });
  persistRanking(ranking);
  showRanking();
  return `랭킹에 등록됐어요! ${name} - ${score}점`;
}

function endGame() {
  if (gameOver) return;

  gameOver = true;
  pressedKeys.left = false;
  pressedKeys.right = false;
  player.vx = 0;

  finalScoreText.textContent = `점수: ${score}점`;
  setFeedback(saveRankingIfEligible());
  setOverlayVisibility(gameOverOverlay, true);
}

function updatePoops(deltaTime) {
  const playerHitbox = getPlayerHitbox();

  poops.forEach(poop => {
    poop.y += FALL_SPEED * deltaTime;
    drawPoop(poop);

    if (hasPoopPixelCollision(playerHitbox, poop)) {
      endGame();
    }

    if (poop.y > CANVAS_HEIGHT) {
      score += 1;
      poop.y = -poop.h;
      poop.x = Math.random() * (CANVAS_WIDTH - poop.w);
    }
  });
}

function update(timestamp) {
  if (!gameStarted || gameOver) {
    return;
  }

  if (!lastFrameTime) {
    lastFrameTime = timestamp;
  }

  const deltaTime = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
  lastFrameTime = timestamp;

  spawnTimer += deltaTime;
  while (spawnTimer >= SPAWN_INTERVAL) {
    spawnPoop();
    spawnTimer -= SPAWN_INTERVAL;
  }

  updatePlayer(deltaTime);

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawPlayer();
  updatePoops(deltaTime);
  drawScore();

  if (gameOver) {
    return;
  }

  requestAnimationFrame(update);
}

function beginGame() {
  currentNickname = nicknameInput.value.trim();

  if (currentNickname) {
    nicknameHelp.textContent = `${currentNickname} 닉네임으로 최고기록이 저장됩니다.`;
  } else {
    nicknameHelp.textContent = "닉네임 없이 시작하면 랭킹에는 올라가지 않아요.";
  }

  score = 0;
  poops = [];
  gameOver = false;
  gameStarted = true;
  spawnTimer = 0;
  lastFrameTime = 0;
  pressedKeys.left = false;
  pressedKeys.right = false;
  resetPlayerPosition();
  setRankingVisibility(false);
  setOverlayVisibility(startPanel, false);
  setOverlayVisibility(gameOverOverlay, false);
  setFeedback("");
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawPlayer();
  drawScore();
  requestAnimationFrame(update);
}

function restartGame() {
  beginGame();
}

function toggleRanking() {
  const shouldShow = rankingPanel.classList.contains("hidden");
  showRanking();
  setRankingVisibility(shouldShow);
}

function handleKeyChange(event, isPressed) {
  if (!gameStarted || gameOver) return;

  if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
    pressedKeys.left = isPressed;
    event.preventDefault();
  }

  if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
    pressedKeys.right = isPressed;
    event.preventDefault();
  }
}

document.addEventListener("keydown", event => {
  handleKeyChange(event, true);

  if (event.key === "Enter" && !gameStarted) {
    beginGame();
  }
});
document.addEventListener("keyup", event => handleKeyChange(event, false));
startGameButton.addEventListener("click", beginGame);
restartGameButton.addEventListener("click", restartGame);
toggleRankingButton.addEventListener("click", toggleRanking);
closeRankingButton.addEventListener("click", () => setRankingVisibility(false));
window.addEventListener("resize", resizeGameLayout);

resizeGameLayout();
showRanking();
setRankingVisibility(false);
setOverlayVisibility(gameOverOverlay, false);
drawIdleScreen();
