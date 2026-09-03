import { alertService } from "../services/alertService.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const getAlerts = async (req, res, next) => {
  try {
    const alerts = await alertService.getAlerts();
    return sendSuccess(res, alerts, "Alerts retrieved.", 200, {
      count: alerts.length,
    });
  } catch (error) {
    next(error);
  }
};

export const acknowledgeAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const officerName = req.user?.name || req.body.officerName || "Duty Officer";

    const updated = await alertService.acknowledgeAlert(id, officerName);
    if (!updated) {
      return sendError(res, `Alert with ID '${id}' not found.`, 404);
    }

    return sendSuccess(res, updated, "Alert acknowledged successfully.");
  } catch (error) {
    next(error);
  }
};

export const investigateAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const officerName = req.user?.name || req.body.officerName || "Duty Officer";
    const note = req.body.note || "Marshals dispatched to investigate chokepoint.";

    const updated = await alertService.investigateAlert(id, officerName, note);
    if (!updated) {
      return sendError(res, `Alert with ID '${id}' not found.`, 404);
    }

    return sendSuccess(res, updated, "Alert status set to Investigating.");
  } catch (error) {
    next(error);
  }
};

export const resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const officerName = req.user?.name || req.body.officerName || "Duty Commander";

    const updated = await alertService.resolveAlert(id, officerName);
    if (!updated) {
      return sendError(res, `Alert with ID '${id}' not found.`, 404);
    }

    return sendSuccess(res, updated, "Alert marked as resolved.");
  } catch (error) {
    next(error);
  }
};

export const addAlertNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const author = req.user?.name || req.body.author || "Authority Officer";

    if (!note) {
      return sendError(res, "Note content is required.", 400);
    }

    const updated = await alertService.addResponseNote(id, author, note);
    if (!updated) {
      return sendError(res, `Alert with ID '${id}' not found.`, 404);
    }

    return sendSuccess(res, updated, "Response note added to alert timeline.");
  } catch (error) {
    next(error);
  }
};

export const broadcastAdvisory = async (req, res, next) => {
  try {
    const advisory = {
      ...req.body,
      officerName: req.user?.name || req.body.officerName || "Command Center",
    };

    if (!advisory.message && !advisory.title) {
      return sendError(res, "Advisory message is required.", 400);
    }

    const created = await alertService.broadcastAdvisory(advisory);
    return sendSuccess(res, created, "Public advisory broadcast successfully.", 201);
  } catch (error) {
    next(error);
  }
};
