const { stopTestServer } = require("./testServer.cjs");

module.exports = async function globalTeardown() {
  console.log("Starting global test teardown...");

  try {
    // Stop the test server
    await stopTestServer();
    console.log("SUCCESS: Global test teardown completed");
  } catch (error) {
    console.error("ERROR: Global test teardown failed:", error);
    // Don't throw error in teardown to avoid masking test failures
  }
};
