const { stopTestServer } = require("./testServer.cjs");

module.exports = async function globalTeardown() {
  console.log("Starting global test teardown...");

  try {
    // Stop the test server
    await stopTestServer();
    console.log("SUCCESS: Test server stopped");
  } catch (error) {
    console.error("ERROR: Failed to stop test server:", error);
  }

  // Force garbage collection to clean up any remaining references
  if (global.gc) {
    global.gc();
    console.log("SUCCESS: Garbage collection triggered");
  }

  // Give a moment for cleanup to complete
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("SUCCESS: Global test teardown completed");
};
