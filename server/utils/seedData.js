import { Temple } from "../models/Temple.js";
import { DarshanSlot } from "../models/DarshanSlot.js";
import { Prasadam } from "../models/Prasadam.js";
import { CrowdSnapshot } from "../models/CrowdSnapshot.js";
import { Alert } from "../models/Alert.js";
import { Notification } from "../models/Notification.js";
import { temples as seedTemples } from "../data/temples.js";
import { prasadItems as seedPrasad } from "../data/prasad.js";
import { crowdData as seedCrowd } from "../data/crowd.js";
import { alerts as seedAlerts } from "../data/alerts.js";

/**
 * Seed MongoDB database with initial datasets
 */
export const seedDatabaseIfEmpty = async () => {
  try {
    const templeCount = await Temple.countDocuments();
    if (templeCount === 0) {
      console.log("🌱 [Seed] Seeding 4 target pilgrimage temples into MongoDB Atlas...");
      await Temple.insertMany(seedTemples);
      console.log(`✅ [Seed] ${seedTemples.length} temples seeded.`);
    }

    const slotCount = await DarshanSlot.countDocuments();
    if (slotCount === 0) {
      console.log("🌱 [Seed] Seeding darshan slots into MongoDB Atlas...");
      const allSlots = [];
      seedTemples.forEach((t) => {
        if (t.darshanSlots) {
          t.darshanSlots.forEach((slot) => {
            allSlots.push({ ...slot, templeId: t.id });
          });
        }
      });
      if (allSlots.length > 0) {
        await DarshanSlot.insertMany(allSlots);
        console.log(`✅ [Seed] ${allSlots.length} darshan slots seeded.`);
      }
    }

    const prasadCount = await Prasadam.countDocuments();
    if (prasadCount === 0) {
      console.log("🌱 [Seed] Seeding 20 authentic prasadam items into MongoDB Atlas...");
      await Prasadam.insertMany(seedPrasad);
      console.log(`✅ [Seed] ${seedPrasad.length} prasadam items seeded.`);
    }

    const crowdCount = await CrowdSnapshot.countDocuments();
    if (crowdCount === 0) {
      console.log("🌱 [Seed] Seeding initial crowd intelligence snapshot...");
      await CrowdSnapshot.create(seedCrowd);
      console.log("✅ [Seed] Initial crowd snapshot seeded.");
    }

    const alertCount = await Alert.countDocuments();
    if (alertCount === 0) {
      console.log("🌱 [Seed] Seeding safety alerts & advisories...");
      await Alert.insertMany(seedAlerts);
      console.log(`✅ [Seed] ${seedAlerts.length} alerts seeded.`);
    }

    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      await Notification.insertMany([
        {
          id: "notif-01",
          title: "Maha Aarti Fast-Track Booking",
          message: "Evening Maha Aarti slot passes now open for booking across all four shrines.",
          level: "HIGH_PRIORITY",
          templeId: "all",
          type: "ADVISORY",
        },
      ]);
    }
  } catch (error) {
    console.error("⚠️ [Seed] Database seeding warning:", error.message);
  }
};
