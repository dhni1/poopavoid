const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const gameShell = document.querySelector(".game-shell");
const startPanel = document.getElementById("start-panel");
const startGameButton = document.getElementById("start-game");
const authDock = document.getElementById("auth-dock");
const authToggleButton = document.getElementById("auth-toggle");
const authPanel = document.getElementById("auth-panel");
const displayNameInput = document.getElementById("display-name-input");
const loginIdInput = document.getElementById("login-id-input");
const passwordInput = document.getElementById("password-input");
const authSubmitButton = document.getElementById("auth-submit");
const authSwitchButton = document.getElementById("auth-switch");
const showLoginIdEditorButton = document.getElementById("show-login-id-editor");
const loginIdEditor = document.getElementById("login-id-editor");
const newLoginIdInput = document.getElementById("new-login-id-input");
const changeLoginIdButton = document.getElementById("change-login-id");
const authCloseButton = document.getElementById("auth-close");
const signOutButton = document.getElementById("sign-out");
const authStatus = document.getElementById("auth-status");
const authFeedback = document.getElementById("auth-feedback");
const gameOverOverlay = document.getElementById("game-over-overlay");
const finalScoreText = document.getElementById("final-score");
const saveFeedback = document.getElementById("save-feedback");
const restartGameButton = document.getElementById("restart-game");
const toggleRankingButton = document.getElementById("toggle-ranking");
const rankingPanel = document.getElementById("ranking-panel");
const closeRankingButton = document.getElementById("close-ranking");
const rankingList = document.getElementById("ranking");
const gameNotification = document.getElementById("game-notification");
const poopSprite = new Image();
const shieldSprite = new Image();
const slowSprite = new Image();
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
const shieldSpriteMarkup = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <path fill="#d7d7db" d="M64 2 7 18v39c0 38 22 58 57 69 35-11 57-31 57-69V18L64 2z"/>
    <path fill="#1f9ae0" d="M64 18 15 32v23c0 32 18 49 49 61 31-12 49-29 49-61V32L64 18z"/>
  </svg>
`;
const slowSpriteMarkup = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <rect x="18" y="8" width="92" height="14" rx="3" fill="#3c8fe8"/>
    <rect x="24" y="24" width="80" height="4" rx="2" fill="#4d9cff"/>
    <path fill="#d5dcec" d="M35 34h58v20c0 15-10 24-18 32 8 8 18 17 18 32v2H35v-2c0-15 10-24 18-32-8-8-18-17-18-32V34z"/>
    <path fill="#f9c85d" d="M50 62h28l-8 10H58l-8-10zm-6 42h40v12H44v-12z"/>
    <path d="M35 34h58v20c0 15-10 24-18 32 8 8 18 17 18 32v2H35v-2c0-15 10-24 18-32-8-8-18-17-18-32V34z" fill="none" stroke="#111" stroke-width="4" stroke-linejoin="round"/>
    <path d="M50 62h28l-8 10H58l-8-10zm-6 42h40v12H44v-12z" fill="#f9c85d"/>
    <rect x="18" y="114" width="92" height="4" rx="2" fill="#3c8fe8"/>
    <rect x="18" y="118" width="92" height="10" rx="3" fill="#3c8fe8"/>
  </svg>
`;

const RANKING_TABLE = "rankings";
const RANKING_LIMIT = 10;
const LEGACY_RANKING_STORAGE_KEYS = ["ranking"];
const SUPABASE_URL = "https://cdnebizkdrhfkoipbwli.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_umMMRMpLRDRcuhTV1TVF_g_rWbCvRBL";
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const POOP_SIZE = 42;
const ITEM_SIZE = 42;
const PLAYER_WIDTH = POOP_SIZE;
const PLAYER_HEIGHT = POOP_SIZE;
const PLAYER_Y = CANVAS_HEIGHT - PLAYER_HEIGHT - 38;
const PLAYER_SPEED = 560;
const PLAYER_SMOOTHING = 15;
const FALL_SPEED = 280;
const SPAWN_INTERVAL = 0.75;
const SHIELD_DURATION = 3;
const SLOW_DURATION = 3;
const SHIELD_SPAWN_SCORE_STEP = 100;
const SLOW_SPAWN_SCORE_STEP = 150;
const SLOW_MULTIPLIER = 0.5;
const NOTIFICATION_DURATION = 1.6;
const ITEM_TYPE_SHIELD = "shield";
const ITEM_TYPE_SLOW = "slow";
const INTERNAL_AUTH_NAMESPACE = "poopavoid.local";
const CHANGE_LOGIN_ID_ENDPOINT = "/api/change-login-id";

const supabaseClient = window.supabase?.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const player = {
  x: 0,
  y: PLAYER_Y,
  w: PLAYER_WIDTH,
  h: PLAYER_HEIGHT,
  vx: 0
};

let poops = [];
let items = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
let spawnTimer = 0;
let lastFrameTime = 0;
let shieldTimer = 0;
let slowTimer = 0;
let notificationTimer = 0;
let nextShieldSpawnScore = SHIELD_SPAWN_SCORE_STEP;
let nextSlowSpawnScore = SLOW_SPAWN_SCORE_STEP;
let currentUser = null;
let authMode = "sign-in";
let isAuthPanelOpen = false;
let isLoginIdEditorOpen = false;

const pressedKeys = {
  left: false,
  right: false
};
const pointerControl = {
  active: false,
  pointerId: null,
  targetX: getInitialPlayerX(),
  startCanvasX: 0,
  startPlayerX: getInitialPlayerX()
};

let poopSpriteReady = false;
let shieldSpriteReady = false;
let slowSpriteReady = false;

poopSprite.addEventListener("load", () => {
  poopSpriteReady = true;
});
shieldSprite.addEventListener("load", () => {
  shieldSpriteReady = true;
});
slowSprite.addEventListener("load", () => {
  slowSpriteReady = true;
});

poopSprite.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(poopSpriteMarkup)}`;
shieldSprite.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(shieldSpriteMarkup)}`;
slowSprite.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(slowSpriteMarkup)}`;

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

function setAuthFeedback(message, tone = "") {
  authFeedback.textContent = message;
  authFeedback.className = "overlay-help";

  if (tone) {
    authFeedback.classList.add(tone);
  }
}

function setNotification(message = "") {
  gameNotification.textContent = message;
  gameNotification.classList.toggle("hidden", !message);
}

function showNotification(message) {
  notificationTimer = NOTIFICATION_DURATION;
  setNotification(message);
}

function getSignedInNickname() {
  const metadataName = sanitizeNickname(currentUser?.user_metadata?.display_name || "");
  if (metadataName) {
    return metadataName;
  }

  const loginId = sanitizeLoginId(currentUser?.user_metadata?.login_id || "");
  if (loginId) {
    return loginId;
  }
  return "";
}

function sanitizeNickname(value = "") {
  return String(value).trim().slice(0, 20);
}

function sanitizeLoginId(value = "") {
  return String(value)
    .trim()
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}._-]/gu, "")
    .slice(0, 20);
}

function isLegacyCompatibleLoginId(loginId) {
  return /^[a-z0-9._-]+$/.test(loginId);
}

async function buildInternalCredential(loginId) {
  if (isLegacyCompatibleLoginId(loginId)) {
    return `${loginId}@${INTERNAL_AUTH_NAMESPACE}`;
  }

  const normalizedLoginId = String(loginId).normalize("NFKC");
  const encodedBytes = new TextEncoder().encode(normalizedLoginId);
  const digest = await window.crypto.subtle.digest("SHA-256", encodedBytes);
  const digestHex = [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 40);

  return `u_${digestHex}@${INTERNAL_AUTH_NAMESPACE}`;
}

function clearLegacyRankingStorage() {
  try {
    LEGACY_RANKING_STORAGE_KEYS.forEach(storageKey => {
      window.localStorage.removeItem(storageKey);
    });
  } catch (error) {
    console.warn("Failed to clear legacy ranking storage.", error);
  }
}

function setLoginIdEditorOpen(shouldOpen) {
  isLoginIdEditorOpen = shouldOpen;
  loginIdEditor.classList.toggle("hidden", !shouldOpen);

  if (!shouldOpen) {
    newLoginIdInput.value = "";
  }
}

function updateAuthUi() {
  const isLoggedIn = Boolean(currentUser);
  const signedInName = getSignedInNickname();
  const currentLoginId = sanitizeLoginId(currentUser?.user_metadata?.login_id || "");
  const isSignUpMode = authMode === "sign-up";
  const accountLabel = currentLoginId
    ? `${signedInName || "플레이어"}(${currentLoginId})`
    : (signedInName || "플레이어");

  authStatus.textContent = isLoggedIn
    ? `${accountLabel} 계정으로 로그인되어 있어요.`
    : isSignUpMode
      ? "이름, 아이디, 비밀번호를 입력해 회원가입하세요."
      : "아이디와 비밀번호로 로그인하세요.";

  authToggleButton.textContent = isLoggedIn
    ? `${signedInName || currentLoginId || "내 계정"}`
    : "로그인";

  authSubmitButton.textContent = isLoggedIn
    ? "로그인됨"
    : isSignUpMode
      ? "회원가입 완료"
      : "로그인";

  authSwitchButton.textContent = isLoggedIn
    ? ""
    : isSignUpMode
      ? "로그인으로 돌아가기"
      : "회원가입";

  displayNameInput.classList.toggle("hidden", !isSignUpMode || isLoggedIn);
  loginIdInput.classList.toggle("hidden", isLoggedIn);
  passwordInput.classList.toggle("hidden", isLoggedIn);
  authSubmitButton.classList.toggle("hidden", isLoggedIn);
  authSwitchButton.classList.toggle("hidden", isLoggedIn);
  showLoginIdEditorButton.classList.toggle("hidden", !isLoggedIn);
  authCloseButton.classList.toggle("hidden", false);
  signOutButton.classList.toggle("hidden", !isLoggedIn);
  loginIdEditor.classList.toggle("hidden", !isLoggedIn || !isLoginIdEditorOpen);

  displayNameInput.disabled = isLoggedIn || !isSignUpMode;
  loginIdInput.disabled = isLoggedIn;
  passwordInput.disabled = isLoggedIn;
  authSubmitButton.disabled = isLoggedIn;
  showLoginIdEditorButton.disabled = !isLoggedIn;
  newLoginIdInput.disabled = !isLoggedIn;
  changeLoginIdButton.disabled = !isLoggedIn;
  signOutButton.disabled = !isLoggedIn;
}

function getReadableAuthError(message = "") {
  if (message.includes("Invalid login credentials")) {
    return "아이디 또는 비밀번호가 맞지 않아요.";
  }

  if (message.includes("User already registered")) {
    return "이미 사용 중인 아이디예요. 다른 아이디로 가입하거나 로그인해보세요.";
  }

  if (message.includes("login id is already in use")) {
    return "이미 사용 중인 아이디예요. 다른 아이디를 입력해주세요.";
  }

  return message || "로그인 처리 중 문제가 발생했어요.";
}

function getReadableRankingError(message = "") {
  if (message.includes('relation "public.rankings" does not exist')) {
    return "Supabase에 rankings 테이블이 아직 없어요. SQL Editor에서 랭킹 테이블을 먼저 만들어주세요.";
  }

  if (message.includes("row-level security")) {
    return "랭킹 저장 권한이 없어요. Supabase RLS 정책을 확인해주세요.";
  }

  return "온라인 랭킹 처리 중 문제가 발생했어요.";
}

function setAuthPanelOpen(shouldOpen) {
  isAuthPanelOpen = shouldOpen;
  authDock.classList.toggle("is-open", shouldOpen);
  authDock.classList.toggle("is-collapsed", !shouldOpen);
  authPanel.classList.toggle("hidden", !shouldOpen);
}

function setAuthMode(nextMode) {
  authMode = nextMode;
  setAuthFeedback("");
  updateAuthUi();
}

async function refreshCurrentUser() {
  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  currentUser = user ?? null;
  updateAuthUi();
}

async function signUpWithCredentials() {
  if (!supabaseClient) {
    setAuthFeedback("Supabase 연결이 준비되지 않았어요.", "warning");
    return;
  }

  const displayName = sanitizeNickname(displayNameInput.value);
  const loginId = sanitizeLoginId(loginIdInput.value);
  const password = passwordInput.value;

  if (!displayName || !loginId || !password) {
    setAuthFeedback("이름, 아이디, 비밀번호를 모두 입력해주세요.", "warning");
    return;
  }

  if (password.length < 6) {
    setAuthFeedback("비밀번호는 6자 이상이어야 해요.", "warning");
    return;
  }

  if (loginId.length < 3) {
    setAuthFeedback("아이디는 3자 이상 입력해주세요.", "warning");
    return;
  }

  authSubmitButton.disabled = true;
  authSwitchButton.disabled = true;
  setAuthFeedback("회원가입을 처리하고 있어요.");
  const internalCredential = await buildInternalCredential(loginId);

  const { data, error } = await supabaseClient.auth.signUp({
    email: internalCredential,
    password,
    options: {
      data: {
        display_name: displayName,
        login_id: loginId
      }
    }
  });

  authSubmitButton.disabled = false;
  authSwitchButton.disabled = false;

  if (error) {
    setAuthFeedback(getReadableAuthError(error.message), "warning");
    updateAuthUi();
    return;
  }

  currentUser = data.session?.user ?? null;
  displayNameInput.value = "";
  loginIdInput.value = "";
  passwordInput.value = "";
  setAuthFeedback(
    currentUser
      ? "회원가입이 완료됐어요. 바로 로그인된 상태예요."
      : "회원가입은 완료됐지만 아직 로그인 세션이 없어요. 인증 설정을 다시 확인해주세요.",
    currentUser ? "success" : "warning"
  );
  if (currentUser) {
    setLoginIdEditorOpen(false);
    setAuthPanelOpen(false);
  }
  updateAuthUi();
}

async function signInWithCredentials() {
  if (!supabaseClient) {
    setAuthFeedback("Supabase 연결이 준비되지 않았어요.", "warning");
    return;
  }

  const loginId = sanitizeLoginId(loginIdInput.value);
  const password = passwordInput.value;

  if (!loginId || !password) {
    setAuthFeedback("아이디와 비밀번호를 모두 입력해주세요.", "warning");
    return;
  }

  authSubmitButton.disabled = true;
  authSwitchButton.disabled = true;
  setAuthFeedback("로그인 중이에요.");
  const internalCredential = await buildInternalCredential(loginId);

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: internalCredential,
    password
  });

  authSubmitButton.disabled = false;
  authSwitchButton.disabled = false;

  if (error) {
    setAuthFeedback(getReadableAuthError(error.message), "warning");
    updateAuthUi();
    return;
  }

  currentUser = data.user ?? null;
  loginIdInput.value = "";
  passwordInput.value = "";
  setAuthFeedback("로그인됐어요. 이제 바로 게임을 시작할 수 있어요.", "success");
  setLoginIdEditorOpen(false);
  setAuthPanelOpen(false);
  updateAuthUi();
}

async function changeLoginId() {
  if (!currentUser || !supabaseClient) {
    setAuthFeedback("먼저 로그인해주세요.", "warning");
    return;
  }

  const newLoginId = sanitizeLoginId(newLoginIdInput.value);
  const currentLoginId = sanitizeLoginId(currentUser?.user_metadata?.login_id || "");

  if (!newLoginId) {
    setAuthFeedback("새 아이디를 입력해주세요.", "warning");
    return;
  }

  if (newLoginId.length < 3) {
    setAuthFeedback("아이디는 3자 이상 입력해주세요.", "warning");
    return;
  }

  if (newLoginId === currentLoginId) {
    setAuthFeedback("현재 아이디와 같아요. 다른 아이디를 입력해주세요.", "warning");
    return;
  }

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session?.access_token) {
    setAuthFeedback("로그인 세션을 다시 확인해주세요.", "warning");
    return;
  }

  showLoginIdEditorButton.disabled = true;
  changeLoginIdButton.disabled = true;
  setAuthFeedback("아이디를 변경하고 있어요.");

  try {
    const response = await fetch(CHANGE_LOGIN_ID_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ newLoginId })
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || "아이디 변경에 실패했어요.");
    }

    await refreshCurrentUser();
    await showRanking();
    setLoginIdEditorOpen(false);
    setAuthFeedback(`${payload.loginId || newLoginId} 아이디로 변경됐어요.`, "success");
  } catch (error) {
    setAuthFeedback(getReadableAuthError(error.message), "warning");
  } finally {
    showLoginIdEditorButton.disabled = false;
    changeLoginIdButton.disabled = false;
    updateAuthUi();
  }
}

async function signOutSession() {
  if (!supabaseClient) {
    return;
  }

  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    setAuthFeedback(getReadableAuthError(error.message), "warning");
    return;
  }

  currentUser = null;
  setAuthMode("sign-in");
  setLoginIdEditorOpen(false);
  setAuthPanelOpen(false);
  setAuthFeedback("로그아웃됐어요.", "success");
  updateAuthUi();
}

async function initializeAuth() {
  if (!supabaseClient) {
    authStatus.textContent = "Supabase 스크립트를 불러오지 못했어요.";
    authSubmitButton.disabled = true;
    startGameButton.disabled = true;
    return;
  }

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  currentUser = session?.user ?? null;
  setAuthMode("sign-in");
  updateAuthUi();

  supabaseClient.auth.onAuthStateChange((_event, sessionState) => {
    currentUser = sessionState?.user ?? null;
    updateAuthUi();
  });
}

function getRandomSpawnX(size) {
  return Math.random() * (CANVAS_WIDTH - size);
}

function getCanvasXFromClientX(clientX) {
  const canvasRect = canvas.getBoundingClientRect();
  const relativeX = (clientX - canvasRect.left) / canvasRect.width;
  return clamp(relativeX * CANVAS_WIDTH, 0, CANVAS_WIDTH);
}

function updatePointerTarget(clientX) {
  const currentCanvasX = getCanvasXFromClientX(clientX);
  const deltaX = currentCanvasX - pointerControl.startCanvasX;
  pointerControl.targetX = pointerControl.startPlayerX + deltaX;
}

function startPointerControl(event) {
  if (!gameStarted || gameOver) return;

  pointerControl.active = true;
  pointerControl.pointerId = event.pointerId;
  pointerControl.startCanvasX = getCanvasXFromClientX(event.clientX);
  pointerControl.startPlayerX = player.x;
  pointerControl.targetX = player.x;
  if (canvas.setPointerCapture) {
    canvas.setPointerCapture(event.pointerId);
  }
  event.preventDefault();
}

function movePointerControl(event) {
  if (!pointerControl.active || pointerControl.pointerId !== event.pointerId) return;

  updatePointerTarget(event.clientX);
  event.preventDefault();
}

function endPointerControl(event) {
  if (pointerControl.pointerId !== event.pointerId) return;

  if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
  pointerControl.active = false;
  pointerControl.pointerId = null;
  pointerControl.startCanvasX = 0;
  pointerControl.startPlayerX = player.x;
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

  if (shieldTimer > 0) {
    ctx.fillStyle = "#80f0ff";
    ctx.font = "22px sans-serif";
    ctx.fillText(`Shield ${shieldTimer.toFixed(1)}s`, 16, 68);
  }

  if (slowTimer > 0) {
    ctx.fillStyle = "#d2c5ff";
    ctx.font = "22px sans-serif";
    ctx.fillText(`Slow ${slowTimer.toFixed(1)}s`, 16, shieldTimer > 0 ? 98 : 68);
  }
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
    x: getRandomSpawnX(POOP_SIZE),
    y: -POOP_SIZE,
    w: POOP_SIZE,
    h: POOP_SIZE
  });
}

function spawnItem(type) {
  items.push({
    type,
    x: getRandomSpawnX(ITEM_SIZE),
    y: -ITEM_SIZE,
    w: ITEM_SIZE,
    h: ITEM_SIZE
  });
}

function drawShieldItem(item) {
  if (shieldSpriteReady) {
    ctx.drawImage(shieldSprite, item.x, item.y, item.w, item.h);
    return;
  }

  const centerX = item.x + item.w / 2;
  const centerY = item.y + item.h / 2;

  ctx.fillStyle = "#54daf2";
  ctx.beginPath();
  ctx.arc(centerX, centerY, item.w * 0.48, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ecffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX, item.y + item.h * 0.18);
  ctx.lineTo(item.x + item.w * 0.74, item.y + item.h * 0.28);
  ctx.lineTo(item.x + item.w * 0.68, item.y + item.h * 0.64);
  ctx.lineTo(centerX, item.y + item.h * 0.84);
  ctx.lineTo(item.x + item.w * 0.32, item.y + item.h * 0.64);
  ctx.lineTo(item.x + item.w * 0.26, item.y + item.h * 0.28);
  ctx.closePath();
  ctx.stroke();
}

function drawSlowItem(item) {
  if (slowSpriteReady) {
    ctx.drawImage(slowSprite, item.x, item.y, item.w, item.h);
    return;
  }

  const centerX = item.x + item.w / 2;
  const centerY = item.y + item.h / 2;

  ctx.fillStyle = "#8f82ff";
  ctx.beginPath();
  ctx.arc(centerX, centerY, item.w * 0.48, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#f7f3ff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX, item.y + item.h * 0.18);
  ctx.lineTo(centerX, item.y + item.h * 0.82);
  ctx.moveTo(item.x + item.w * 0.18, centerY);
  ctx.lineTo(item.x + item.w * 0.82, centerY);
  ctx.moveTo(item.x + item.w * 0.28, item.y + item.h * 0.28);
  ctx.lineTo(item.x + item.w * 0.72, item.y + item.h * 0.72);
  ctx.moveTo(item.x + item.w * 0.72, item.y + item.h * 0.28);
  ctx.lineTo(item.x + item.w * 0.28, item.y + item.h * 0.72);
  ctx.stroke();
}

function drawItem(item) {
  if (item.type === ITEM_TYPE_SHIELD) {
    drawShieldItem(item);
    return;
  }

  drawSlowItem(item);
}

function updatePlayer(deltaTime) {
  if (pointerControl.active) {
    player.x = clamp(pointerControl.targetX, 0, CANVAS_WIDTH - player.w);
    player.vx = 0;
    return;
  }

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

function updateEffectTimers(deltaTime) {
  shieldTimer = Math.max(0, shieldTimer - deltaTime);
  slowTimer = Math.max(0, slowTimer - deltaTime);

  if (notificationTimer > 0) {
    notificationTimer = Math.max(0, notificationTimer - deltaTime);
    if (notificationTimer === 0) {
      setNotification("");
    }
  }
}

function queueScoreBasedItems() {
  while (score >= nextShieldSpawnScore) {
    spawnItem(ITEM_TYPE_SHIELD);
    nextShieldSpawnScore += SHIELD_SPAWN_SCORE_STEP;
  }

  while (score >= nextSlowSpawnScore) {
    spawnItem(ITEM_TYPE_SLOW);
    nextSlowSpawnScore += SLOW_SPAWN_SCORE_STEP;
  }
}

function activateItem(itemType) {
  if (itemType === ITEM_TYPE_SHIELD) {
    shieldTimer = SHIELD_DURATION;
    showNotification("보호막이 생겼어요! 3초 동안 똥 충돌을 무시합니다.");
    return;
  }

  slowTimer = SLOW_DURATION;
  showNotification("시간 지연! 3초 동안 똥 속도가 0.5배가 됩니다.");
}

function normalizeRanking(rawRanking) {
  const rankingMap = new Map();

  rawRanking.forEach(entry => {
    if (!entry) return;

    const name = sanitizeNickname(entry.nickname || entry.name || "");
    const accountKey = String(entry.user_id || entry.accountKey || name).trim().toLowerCase();
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
    .slice(0, RANKING_LIMIT);
}

async function loadRanking() {
  if (!supabaseClient) {
    throw new Error("Supabase client is not available.");
  }

  const { data, error } = await supabaseClient
    .from(RANKING_TABLE)
    .select("user_id, nickname, score, updated_at")
    .order("score", { ascending: false })
    .order("updated_at", { ascending: true })
    .limit(RANKING_LIMIT);

  if (error) {
    throw error;
  }

  return normalizeRanking(data || []);
}

function renderRanking(ranking) {
  rankingList.innerHTML = "";

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

function renderRankingMessage(message) {
  rankingList.innerHTML = "";
  const li = document.createElement("li");
  li.className = "empty-ranking";
  li.textContent = message;
  rankingList.appendChild(li);
}

async function showRanking() {
  renderRankingMessage("온라인 랭킹을 불러오는 중이에요...");

  try {
    const ranking = await loadRanking();
    renderRanking(ranking);
  } catch (error) {
    console.error(error);
    renderRankingMessage(getReadableRankingError(error.message));
  }
}

async function saveRankingIfEligible() {
  const loginId = sanitizeLoginId(currentUser?.user_metadata?.login_id || "");
  const name = loginId;

  if (!name) {
    return {
      message: "아이디 정보가 없어서 이번 기록은 랭킹에 저장되지 않았어요.",
      tone: "warning"
    };
  }

  if (!currentUser?.id) {
    return {
      message: "로그인 정보가 없어서 랭킹을 저장할 수 없어요.",
      tone: "warning"
    };
  }

  try {
    const { data: existingEntry, error: loadError } = await supabaseClient
      .from(RANKING_TABLE)
      .select("user_id, nickname, score")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (loadError) {
      throw loadError;
    }

    if (existingEntry && Number(existingEntry.score) >= score) {
      await showRanking();
      return {
        message: `${name}의 최고기록은 ${existingEntry.score}점이라 랭킹은 유지됐어요.`,
        tone: "warning"
      };
    }

    const { error: upsertError } = await supabaseClient
      .from(RANKING_TABLE)
      .upsert(
        {
          user_id: currentUser.id,
          nickname: name,
          score,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      throw upsertError;
    }

    await showRanking();
    return {
      message: existingEntry
        ? `최고기록이 갱신됐어요! ${name} - ${score}점`
        : `온라인 랭킹에 등록됐어요! ${name} - ${score}점`,
      tone: "success"
    };
  } catch (error) {
    console.error(error);
    return {
      message: getReadableRankingError(error.message),
      tone: "warning"
    };
  }
}

function endGame() {
  if (gameOver) return;

  gameOver = true;
  pressedKeys.left = false;
  pressedKeys.right = false;
  player.vx = 0;
  notificationTimer = 0;
  setNotification("");

  finalScoreText.textContent = `점수: ${score}점`;
  setFeedback("온라인 랭킹에 점수를 저장하고 있어요...");
  setOverlayVisibility(gameOverOverlay, true);
  void finalizeRankingSave();
}

async function finalizeRankingSave() {
  const result = await saveRankingIfEligible();
  setFeedback(result.message, result.tone);
}

function updatePoops(deltaTime) {
  const playerHitbox = getPlayerHitbox();
  const poopFallSpeed = FALL_SPEED * (slowTimer > 0 ? SLOW_MULTIPLIER : 1);

  poops.forEach(poop => {
    poop.y += poopFallSpeed * deltaTime;
    drawPoop(poop);

    if (hasCollision(playerHitbox, poop) && shieldTimer <= 0) {
      endGame();
    }

    if (poop.y > CANVAS_HEIGHT) {
      score += 1;
      poop.y = -poop.h;
      poop.x = getRandomSpawnX(poop.w);
      queueScoreBasedItems();
    }
  });
}

function updateItems(deltaTime) {
  const playerHitbox = getPlayerHitbox();

  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index];
    item.y += FALL_SPEED * deltaTime;
    drawItem(item);

    if (hasCollision(playerHitbox, item)) {
      activateItem(item.type);
      items.splice(index, 1);
      continue;
    }

    if (item.y > CANVAS_HEIGHT) {
      items.splice(index, 1);
    }
  }
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

  updateEffectTimers(deltaTime);

  spawnTimer += deltaTime;
  while (spawnTimer >= SPAWN_INTERVAL) {
    spawnPoop();
    spawnTimer -= SPAWN_INTERVAL;
  }

  updatePlayer(deltaTime);

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawPlayer();
  updatePoops(deltaTime);
  updateItems(deltaTime);
  drawScore();

  if (gameOver) {
    return;
  }

  requestAnimationFrame(update);
}

function beginGame() {
  if (!currentUser) {
    setAuthFeedback("먼저 회원가입하거나 로그인해주세요.", "warning");
    return;
  }

  score = 0;
  poops = [];
  items = [];
  gameOver = false;
  gameStarted = true;
  spawnTimer = 0;
  lastFrameTime = 0;
  shieldTimer = 0;
  slowTimer = 0;
  notificationTimer = 0;
  nextShieldSpawnScore = SHIELD_SPAWN_SCORE_STEP;
  nextSlowSpawnScore = SLOW_SPAWN_SCORE_STEP;
  pointerControl.active = false;
  pointerControl.pointerId = null;
  pointerControl.targetX = getInitialPlayerX();
  pointerControl.startCanvasX = 0;
  pointerControl.startPlayerX = getInitialPlayerX();
  pressedKeys.left = false;
  pressedKeys.right = false;
  resetPlayerPosition();
  setRankingVisibility(false);
  setOverlayVisibility(startPanel, false);
  setOverlayVisibility(gameOverOverlay, false);
  setFeedback("");
  setNotification("");
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
  void showRanking();
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

  const isTypingField =
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement;

  if (event.key === "Enter" && !gameStarted && !isTypingField) {
    beginGame();
  }
});
document.addEventListener("keyup", event => handleKeyChange(event, false));
startGameButton.addEventListener("click", beginGame);
restartGameButton.addEventListener("click", restartGame);
toggleRankingButton.addEventListener("click", toggleRanking);
closeRankingButton.addEventListener("click", () => setRankingVisibility(false));
authToggleButton.addEventListener("click", () => {
  setAuthPanelOpen(!isAuthPanelOpen);
  updateAuthUi();
});
authSubmitButton.addEventListener("click", () => {
  if (authMode === "sign-up") {
    void signUpWithCredentials();
    return;
  }

  void signInWithCredentials();
});
authSwitchButton.addEventListener("click", () => {
  setAuthMode(authMode === "sign-up" ? "sign-in" : "sign-up");
});
showLoginIdEditorButton.addEventListener("click", () => {
  setAuthFeedback("");
  setLoginIdEditorOpen(!isLoginIdEditorOpen);
  updateAuthUi();
});
changeLoginIdButton.addEventListener("click", () => {
  void changeLoginId();
});
authCloseButton.addEventListener("click", () => {
  setLoginIdEditorOpen(false);
  setAuthPanelOpen(false);
});
signOutButton.addEventListener("click", signOutSession);
displayNameInput.addEventListener("keydown", event => {
  if (event.key === "Enter" && authMode === "sign-up") {
    void signUpWithCredentials();
  }
});
loginIdInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    if (authMode === "sign-up") {
      void signUpWithCredentials();
      return;
    }

    void signInWithCredentials();
  }
});
passwordInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    if (authMode === "sign-up") {
      void signUpWithCredentials();
      return;
    }

    void signInWithCredentials();
  }
});
newLoginIdInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    void changeLoginId();
  }
});
canvas.addEventListener("pointerdown", startPointerControl);
canvas.addEventListener("pointermove", movePointerControl);
canvas.addEventListener("pointerup", endPointerControl);
canvas.addEventListener("pointercancel", endPointerControl);
canvas.addEventListener("pointerleave", endPointerControl);
window.addEventListener("resize", resizeGameLayout);

resizeGameLayout();
clearLegacyRankingStorage();
initializeAuth();
void showRanking();
setRankingVisibility(false);
setOverlayVisibility(gameOverOverlay, false);
setLoginIdEditorOpen(false);
setAuthPanelOpen(false);
drawIdleScreen();
