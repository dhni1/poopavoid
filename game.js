const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const saveScoreButton = document.getElementById("save-score");
const restartGameButton = document.getElementById("restart-game");
const RANKING_KEY = "ranking";
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const POOP_SIZE = 32;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;
const PLAYER_Y = CANVAS_HEIGHT - 50;
const PLAYER_SPEED = 420;
const PLAYER_SMOOTHING = 14;
const FALL_SPEED = 220;
const SPAWN_INTERVAL = 0.9;

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
let spawnTimer = 0;
let lastFrameTime = 0;

const pressedKeys = {
  left: false,
  right: false
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getInitialPlayerX() {
  return (CANVAS_WIDTH - player.w) / 2;
}

function resetPlayerPosition() {
  player.x = getInitialPlayerX();
  player.y = PLAYER_Y;
  player.vx = 0;
}

function setRestartButtonVisibility(isVisible) {
  restartGameButton.classList.toggle("hidden", !isVisible);
}

function drawPlayer() {
  ctx.fillStyle = "#2d6df6";
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";
  ctx.fillText(`Score: ${score}`, 10, 28);
}

function drawGameOverMessage() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = "#fff7dd";
  ctx.font = "bold 36px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("게임 오버", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 18);

  ctx.font = "22px sans-serif";
  ctx.fillText(`점수: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
  ctx.textAlign = "start";
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

function endGame() {
  if (gameOver) return;

  gameOver = true;
  pressedKeys.left = false;
  pressedKeys.right = false;
  player.vx = 0;
  setRestartButtonVisibility(true);
}

function updatePoops(deltaTime) {
  ctx.fillStyle = "brown";

  poops.forEach(poop => {
    poop.y += FALL_SPEED * deltaTime;
    ctx.fillRect(poop.x, poop.y, poop.w, poop.h);

    if (hasCollision(player, poop)) {
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
  if (!lastFrameTime) {
    lastFrameTime = timestamp;
  }

  const deltaTime = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
  lastFrameTime = timestamp;

  if (gameOver) {
    return;
  }

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
    drawGameOverMessage();
    return;
  }

  requestAnimationFrame(update);
}

function restartGame() {
  poops = [];
  score = 0;
  gameOver = false;
  spawnTimer = 0;
  lastFrameTime = 0;
  pressedKeys.left = false;
  pressedKeys.right = false;
  resetPlayerPosition();
  setRestartButtonVisibility(false);
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawPlayer();
  drawScore();
  requestAnimationFrame(update);
}

function normalizeRanking(rawRanking) {
  const rankingMap = new Map();

  rawRanking.forEach(entry => {
    if (!entry) return;

    const name = String(entry.name || "익명").trim() || "익명";
    const accountKey = String(entry.accountKey || name).trim().toLowerCase();
    const scoreValue = Number(entry.score);

    if (!Number.isFinite(scoreValue)) return;

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
  const list = document.getElementById("ranking");
  list.innerHTML = "";
  persistRanking(ranking);

  if (ranking.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-ranking";
    li.textContent = "아직 저장된 기록이 없어요.";
    list.appendChild(li);
    return;
  }

  ranking.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.name} - ${entry.score}점`;
    list.appendChild(li);
  });
}

function saveScore() {
  const nameInput = document.getElementById("name");
  const name = nameInput.value.trim() || "익명";
  const accountKey = name.toLowerCase();
  const ranking = loadRanking();
  const existingEntry = ranking.find(entry => entry.accountKey === accountKey);

  if (existingEntry) {
    if (score > existingEntry.score) {
      existingEntry.name = name;
      existingEntry.score = score;
      persistRanking(ranking);
      showRanking();
      alert(`최고기록이 갱신됐어요! ${name} - ${score}점`);
      return;
    }

    alert(`${name} 계정의 최고기록은 ${existingEntry.score}점이라 저장되지 않았어요.`);
    return;
  }

  ranking.push({ name, accountKey, score });
  persistRanking(ranking);
  showRanking();
  alert(`랭킹에 저장됐어요! ${name} - ${score}점`);
}

function handleKeyChange(event, isPressed) {
  if (gameOver) return;

  if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
    pressedKeys.left = isPressed;
    event.preventDefault();
  }

  if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
    pressedKeys.right = isPressed;
    event.preventDefault();
  }
}

document.addEventListener("keydown", event => handleKeyChange(event, true));
document.addEventListener("keyup", event => handleKeyChange(event, false));
saveScoreButton.addEventListener("click", saveScore);
restartGameButton.addEventListener("click", restartGame);

resetPlayerPosition();
setRestartButtonVisibility(false);
showRanking();
drawPlayer();
drawScore();
requestAnimationFrame(update);
