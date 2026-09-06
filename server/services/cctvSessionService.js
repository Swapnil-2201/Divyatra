import crypto from "crypto";

/**
 * In-memory registry of short-lived CCTV phone sessions.
 * Maps sessionToken -> sessionObject
 */
const sessionsByToken = new Map();
const sessionsById = new Map();

const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Creates a new temporary CCTV phone pairing session bound to a specific camera.
 */
export function createCctvSession({ cameraId = "cam-01", cameraName = "Gate 01 Main Entry", templeId = "somnath", adminSocketId = null }) {
  // Terminate any previous session bound to this same camera to ensure 1 active source per node
  for (const session of sessionsByToken.values()) {
    if (session.cameraId === cameraId && session.status !== "TERMINATED") {
      session.status = "TERMINATED";
    }
  }

  const sessionId = crypto.randomUUID();
  const token = crypto.randomBytes(32).toString("hex");
  const now = Date.now();

  const session = {
    sessionId,
    token,
    cameraId,
    cameraName,
    templeId,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
    status: "WAITING", // WAITING, CONNECTED, TERMINATED, EXPIRED
    adminSocketId,
    phoneSocketId: null,
  };

  sessionsByToken.set(token, session);
  sessionsById.set(sessionId, session);

  console.log(`📹 [CCTV Session] Created temporary camera session ${sessionId} for camera '${cameraName}' (${cameraId}), expires in 10m`);
  return session;
}

/**
 * Validates a session token. Checks existence, status, and expiration.
 */
export function validateSessionToken(token) {
  if (!token) return { valid: false, error: "NO_TOKEN" };

  const session = sessionsByToken.get(token);
  if (!session) return { valid: false, error: "INVALID_TOKEN" };

  if (Date.now() > session.expiresAt) {
    session.status = "EXPIRED";
    return { valid: false, error: "SESSION_EXPIRED", session };
  }

  if (session.status === "TERMINATED") {
    return { valid: false, error: "SESSION_TERMINATED", session };
  }

  return { valid: true, session };
}

/**
 * Mark a session as connected when the phone successfully joins.
 */
export function markSessionConnected(token, phoneSocketId) {
  const result = validateSessionToken(token);
  if (!result.valid) return result;

  const session = result.session;
  session.status = "CONNECTED";
  session.phoneSocketId = phoneSocketId;
  console.log(`📱 [CCTV Session] Phone connected to camera session ${session.sessionId} (${session.cameraName})`);
  return { valid: true, session };
}

/**
 * Terminate an active session (by token or sessionId).
 */
export function terminateCctvSession(identifier) {
  const session = sessionsByToken.get(identifier) || sessionsById.get(identifier);
  if (!session) return null;

  session.status = "TERMINATED";
  console.log(`🛑 [CCTV Session] Terminated camera session ${session.sessionId} (${session.cameraName})`);
  return session;
}

/**
 * Look up session by token.
 */
export function getSessionByToken(token) {
  return sessionsByToken.get(token) || null;
}

/**
 * Routine cleanup of expired sessions.
 */
export function cleanExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of sessionsByToken.entries()) {
    if (now > session.expiresAt && session.status !== "TERMINATED") {
      session.status = "EXPIRED";
    }
    // Remove really old sessions after 1 hour
    if (now > session.expiresAt + 3600000) {
      sessionsByToken.delete(token);
      sessionsById.delete(session.sessionId);
    }
  }
}

// Periodic cleanup every minute
setInterval(cleanExpiredSessions, 60000);
