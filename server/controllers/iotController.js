import { iotService } from "../services/iotService.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const getBandState = async (req, res, next) => {
  try {
    const { bandId } = req.params;
    const state = await iotService.getBandState(bandId || "DV-BAND-0001");

    if (!state) {
      return sendError(res, `Smart band '${bandId}' not found.`, 404);
    }

    return sendSuccess(res, state, "IoT Smart Band state retrieved successfully.");
  } catch (error) {
    next(error);
  }
};

export const registerBand = async (req, res, next) => {
  try {
    const band = await iotService.registerBand(req.body);
    return sendSuccess(res, band, "IoT Smart Band registered successfully.", 201);
  } catch (error) {
    next(error);
  }
};

export const acknowledgePass = async (req, res, next) => {
  try {
    const { bandId } = req.params;
    const result = await iotService.acknowledgePass(bandId || "DV-BAND-0001");
    return sendSuccess(res, result, "Pass acknowledged on Smart Band.");
  } catch (error) {
    next(error);
  }
};

export const triggerEmergency = async (req, res, next) => {
  try {
    const { bandId } = req.params;
    const result = await iotService.triggerEmergency(bandId || "DV-BAND-0001", req.body);
    return sendSuccess(res, result, "Emergency alert dispatched to temple authorities.", 201);
  } catch (error) {
    next(error);
  }
};

export const getBandEvents = async (req, res, next) => {
  try {
    const { bandId } = req.params;
    const events = await iotService.getBandEvents(bandId || "DV-BAND-0001");
    return sendSuccess(res, events, "Band event timeline retrieved.");
  } catch (error) {
    next(error);
  }
};

export const getAllBands = async (req, res, next) => {
  try {
    const data = await iotService.getAllBands();
    return sendSuccess(res, data, "Connected IoT bands retrieved for authority monitor.");
  } catch (error) {
    next(error);
  }
};

export const resetBand = async (req, res, next) => {
  try {
    const { bandId } = req.params;
    const result = await iotService.resetBand(bandId || "DV-BAND-0001");
    return sendSuccess(res, result, "Band reset to baseline state.");
  } catch (error) {
    next(error);
  }
};

export const simulateEvent = async (req, res, next) => {
  try {
    const { bandId } = req.params;
    const { type } = req.body;
    const result = await iotService.simulateDemoEvent(bandId || "DV-BAND-0001", type);
    return sendSuccess(res, result, `Simulated ${type} event dispatched.`);
  } catch (error) {
    next(error);
  }
};
