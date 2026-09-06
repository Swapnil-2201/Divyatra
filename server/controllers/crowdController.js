import { crowdService } from "../services/crowdService.js";
import {
  createCctvSession,
  validateSessionToken,
  terminateCctvSession
} from "../services/cctvSessionService.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const getLiveCrowd = async (req, res, next) => {
  try {
    const crowd = await crowdService.getLiveCrowd();
    return sendSuccess(res, crowd);
  } catch (error) {
    next(error);
  }
};

export const getCrowdByTempleId = async (req, res, next) => {
  try {
    const { templeId } = req.params;
    const templeCrowd = await crowdService.getCrowdByTempleId(templeId);
    if (!templeCrowd) {
      return sendError(res, `Crowd status for temple '${templeId}' not found`, 404);
    }
    return sendSuccess(res, templeCrowd);
  } catch (error) {
    next(error);
  }
};

export const simulateCrowd = async (req, res, next) => {
  try {
    const updated = await crowdService.triggerSimulationPulse();
    return sendSuccess(res, updated, "Simulation pulse applied successfully");
  } catch (error) {
    next(error);
  }
};

export const getCctvTelemetry = async (req, res, next) => {
  try {
    const telemetry = await crowdService.getEdgeTelemetry();
    return sendSuccess(res, telemetry || {
      mode: "DEMO_SIMULATION",
      status: "OFFLINE_FALLBACK",
      headcount: 42,
      fps: 30,
      latencyMs: 42,
      camera: "Gate 1 Main Entry",
      detectedBoxes: [],
      zones: [],
      alerts: []
    });
  } catch (error) {
    next(error);
  }
};

export const ingestCctvTelemetry = async (req, res, next) => {
  try {
    const result = await crowdService.ingestEdgeTelemetry(req.body);
    return sendSuccess(res, result, "Edge CCTV telemetry ingested successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new temporary CCTV phone session (Admin only)
 */
export const createCctvSessionHandler = async (req, res, next) => {
  try {
    const { cameraId, cameraName, templeId } = req.body;
    const session = createCctvSession({
      cameraId: cameraId || "cam-01",
      cameraName: cameraName || "Gate 01 Main Entry",
      templeId: templeId || "somnath"
    });
    return sendSuccess(res, {
      sessionId: session.sessionId,
      token: session.token,
      expiresAt: session.expiresAt,
      cameraId: session.cameraId,
      cameraName: session.cameraName,
      templeId: session.templeId,
      status: session.status
    }, "Temporary camera session created");
  } catch (error) {
    next(error);
  }
};

/**
 * Validates a single-purpose CCTV session token (Used by phone publisher)
 */
export const validateCctvSessionHandler = async (req, res, next) => {
  try {
    const token = req.query.token || req.headers["x-cctv-token"];
    const validation = validateSessionToken(token);
    if (!validation.valid) {
      return sendError(res, validation.error, 403);
    }
    const { sessionId, cameraId, cameraName, templeId, expiresAt, status } = validation.session;
    return sendSuccess(res, {
      valid: true,
      sessionId,
      cameraId,
      cameraName,
      templeId,
      expiresAt,
      status
    }, "Session token valid");
  } catch (error) {
    next(error);
  }
};

/**
 * Terminates an active CCTV session
 */
export const terminateCctvSessionHandler = async (req, res, next) => {
  try {
    const { token, sessionId } = req.body;
    const session = terminateCctvSession(token || sessionId);
    return sendSuccess(res, { terminated: true, sessionId: session?.sessionId }, "Camera session terminated");
  } catch (error) {
    next(error);
  }
};

