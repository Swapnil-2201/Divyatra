import mongoose from "mongoose";

const templeCrowdOverviewSchema = new mongoose.Schema(
  {
    templeId: { type: String, required: true },
    name: { type: String, required: true },
    crowdPercentage: { type: Number, required: true },
    status: { type: String, required: true },
    activeCount: { type: Number, required: true },
    avgWait: { type: Number, required: true },
    statusLabel: { type: String, required: true },
    statusColor: { type: String, required: true },
    trend: { type: String, default: "stable" },
  },
  { _id: false }
);

const hourlyPredictionSchema = new mongoose.Schema(
  {
    hour: { type: String, required: true },
    somnath: { type: Number, default: 40 },
    dwarka: { type: Number, default: 50 },
    ambaji: { type: Number, default: 30 },
    pavagadh: { type: Number, default: 45 },
    overall: { type: Number, default: 42 },
  },
  { _id: false }
);

const criticalZoneSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    templeId: { type: String, required: true },
    templeName: { type: String, required: true },
    zoneName: { type: String, required: true },
    currentDensity: { type: String, required: true },
    threshold: { type: String, required: true },
    severity: { type: String, required: true },
    actionRecommended: { type: String, required: true },
  },
  { _id: false }
);

const crowdSnapshotSchema = new mongoose.Schema(
  {
    totalActivePilgrims: { type: Number, required: true, default: 15000 },
    averageWaitTimeMinutes: { type: Number, required: true, default: 30 },
    activeCriticalZones: { type: Number, default: 2 },
    systemAlertLevel: { type: String, default: "ELEVATED_WATCH" },
    templeOverview: [templeCrowdOverviewSchema],
    hourlyPredictions: [hourlyPredictionSchema],
    criticalZonesList: [criticalZoneSchema],
  },
  { timestamps: true }
);

export const CrowdSnapshot =
  mongoose.models.CrowdSnapshot ||
  mongoose.model("CrowdSnapshot", crowdSnapshotSchema);
