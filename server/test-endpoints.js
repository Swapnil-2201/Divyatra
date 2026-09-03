/**
 * Test Suite: Verify unauthenticated notification isolation
 */

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5000/api";

const runTests = async () => {
  console.log("==================================================");
  console.log("🚀 Testing Notification Authentication Isolation...");
  console.log("==================================================");

  try {
    // 1. Health Check
    const healthRes = await fetch(`${BASE_URL}/health`).then((r) => r.json());
    console.log(`✔ [GET /api/health]: Status: ${healthRes.status}`);

    // 2. Unauthenticated notifications fetch -> Must return 0 notifications
    const unauthNotifs = await fetch(`${BASE_URL}/notifications`).then((r) => r.json());
    console.log(`✔ [GET /api/notifications (Unauthenticated)]: Count: ${unauthNotifs.data.length} (Unread: ${unauthNotifs.pagination?.unreadCount ?? 0})`);
    if (unauthNotifs.data.length !== 0) {
      throw new Error(`Expected 0 notifications for unauthenticated session, but got ${unauthNotifs.data.length}`);
    }

    // 3. Authenticated notifications fetch -> Must return user notifications
    const authRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "pilgrim@divyatra.in",
        password: "Pilgrim@123",
      }),
    }).then((r) => r.json());
    const token = authRes.data.token;
    const user = authRes.data.user;

    const authNotifs = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    console.log(`✔ [GET /api/notifications (Authenticated as ${user.email})]: Count: ${authNotifs.data.length} notifications received.`);

    console.log("==================================================");
    console.log("✨ ALL NOTIFICATION ISOLATION TESTS PASSING!");
    console.log("==================================================");
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
};

runTests();
