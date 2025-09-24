const { stopTestServer } = require("./testServer.cjs");

module.exports = async function globalTeardown() {
  console.log("🛑 Starting global test teardown...");

  try {
    // Stop the test server
    await stopTestServer();
    console.log("✅ Global test teardown completed");
  } catch (error) {
    console.error("❌ Global test teardown failed:", error);
    // Don't throw error in teardown to avoid masking test failures
  }
};
