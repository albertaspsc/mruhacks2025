const { startTestServer } = require("./testServer.cjs");

module.exports = async function globalSetup() {
  console.log("🚀 Starting global test setup...");

  try {
    // Start the test server
    await startTestServer();
    console.log("✅ Global test setup completed");
  } catch (error) {
    console.error("❌ Global test setup failed:", error);
    throw error;
  }
};
