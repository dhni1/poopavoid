import crypto from "node:crypto";

const INTERNAL_AUTH_NAMESPACE = "poopavoid.local";
const LOGIN_ID_LIMIT = 20;

function sanitizeLoginId(value = "") {
  return String(value)
    .trim()
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}._-]/gu, "")
    .slice(0, LOGIN_ID_LIMIT);
}

function isLegacyCompatibleLoginId(loginId) {
  return /^[a-z0-9._-]+$/.test(loginId);
}

function buildInternalCredential(loginId) {
  if (isLegacyCompatibleLoginId(loginId)) {
    return `${loginId}@${INTERNAL_AUTH_NAMESPACE}`;
  }

  const digestHex = crypto
    .createHash("sha256")
    .update(String(loginId).normalize("NFKC"), "utf8")
    .digest("hex")
    .slice(0, 40);

  return `u_${digestHex}@${INTERNAL_AUTH_NAMESPACE}`;
}

function sendJson(response, statusCode, payload) {
  response.status(statusCode).setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}

function parseBody(body) {
  if (!body) {
    return {};
  }

  if (typeof body === "object") {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    return {};
  }
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authHeader = request.headers.authorization || "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const { newLoginId: rawLoginId } = parseBody(request.body);
  const newLoginId = sanitizeLoginId(rawLoginId);

  if (!supabaseUrl || !serviceRoleKey) {
    sendJson(response, 500, { error: "Server auth configuration is missing." });
    return;
  }

  if (!accessToken) {
    sendJson(response, 401, { error: "Missing access token." });
    return;
  }

  if (!newLoginId || newLoginId.length < 3) {
    sendJson(response, 400, { error: "아이디는 3자 이상 입력해주세요." });
    return;
  }

  const currentUserResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!currentUserResponse.ok) {
    sendJson(response, 401, { error: "로그인 세션이 유효하지 않아요." });
    return;
  }

  const currentUser = await currentUserResponse.json();
  const currentLoginId = sanitizeLoginId(currentUser.user_metadata?.login_id || "");

  if (newLoginId === currentLoginId) {
    sendJson(response, 400, { error: "현재 아이디와 같아요." });
    return;
  }

  const updateUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${currentUser.id}`, {
    method: "PUT",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: buildInternalCredential(newLoginId),
      user_metadata: {
        ...(currentUser.user_metadata || {}),
        login_id: newLoginId
      },
      email_confirm: true
    })
  });

  if (!updateUserResponse.ok) {
    const errorPayload = await updateUserResponse.json().catch(() => ({}));
    const message = errorPayload.msg || errorPayload.error || errorPayload.message || "";

    if (message.toLowerCase().includes("already")) {
      sendJson(response, 409, { error: "login id is already in use" });
      return;
    }

    sendJson(response, 400, { error: message || "아이디 변경에 실패했어요." });
    return;
  }

  await fetch(
    `${supabaseUrl}/rest/v1/rankings?user_id=eq.${encodeURIComponent(currentUser.id)}`,
    {
      method: "PATCH",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({ nickname: newLoginId })
    }
  );

  sendJson(response, 200, { loginId: newLoginId });
}
