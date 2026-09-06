import { crowdService } from "../services/crowdService.js";
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

