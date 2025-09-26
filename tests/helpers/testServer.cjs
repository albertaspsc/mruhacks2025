const { spawn } = require("child_process");
const { promisify } = require("util");

const sleep = promisify(setTimeout);

class TestServer {
  constructor(port = 3001) {
    this.port = port;
    this.server = null;
    this.maxRetries = 30;
    this.retryDelay = 1000;
  }

  async start() {
    if (this.server) {
      console.log("Server already running");
      return;
    }

    console.log("Starting Next.js development server...");

    // Load environment variables for the test
    const { config } = require("dotenv");
    config();

    this.server = spawn("npm", ["run", "dev"], {
      stdio: "pipe",
      env: {
        ...process.env,
        PORT: this.port.toString(),
        NODE_ENV: "test",
      },
    });

    // Handle server output
    this.server.stdout?.on("data", (data) => {
      const output = data.toString();
      if (output.includes("Ready") || output.includes("started server")) {
        console.log("SUCCESS: Next.js server started");
      }
    });

    this.server.stderr?.on("data", (data) => {
      const error = data.toString();
      if (!error.includes("warn") && !error.includes("DeprecationWarning")) {
        console.error("Server error:", error);
        // Check for port conflict and try alternative port
        if (error.includes("EADDRINUSE")) {
          console.log(
            `Port ${this.port} is in use, trying port ${this.port + 1}...`
          );
          this.port += 1;
          this.server.kill();
          this.server = null;
          // Retry with new port
          setTimeout(() => this.start(), 1000);
          return;
        }
      }
    });

    // Wait for server to be ready
    await this.waitForServer();
  }

  async stop() {
    if (!this.server) {
      return;
    }

    console.log("Stopping Next.js development server...");

    return new Promise((resolve) => {
      this.server.on("close", () => {
        console.log("SUCCESS: Next.js server stopped");
        this.server = null;
        resolve();
      });

      this.server.kill("SIGTERM");

      // Force kill after 10 seconds
      setTimeout(() => {
        if (this.server) {
          this.server.kill("SIGKILL");
          this.server = null;
          resolve();
        }
      }, 10000);
    });
  }

  async waitForServer() {
    const url = `http://localhost:${this.port}`;

    for (let i = 0; i < this.maxRetries; i++) {
      try {
        const fetch = (await import("node-fetch")).default;
        const response = await fetch(url, {
          method: "HEAD",
        });

        if (response.ok || response.status < 500) {
          console.log(`SUCCESS: Server is ready at ${url}`);
          return;
        }
      } catch (error) {
        // Server not ready yet, continue waiting
      }

      console.log(`Waiting for server... (${i + 1}/${this.maxRetries})`);
      await sleep(this.retryDelay);
    }

    throw new Error(`Server failed to start after ${this.maxRetries} attempts`);
  }

  isRunning() {
    return this.server !== null && !this.server.killed;
  }

  getUrl() {
    return `http://localhost:${this.port}`;
  }
}

// Global test server instance
let globalTestServer = null;

async function startTestServer(port = 3001) {
  if (globalTestServer && globalTestServer.isRunning()) {
    return globalTestServer;
  }

  globalTestServer = new TestServer(port);
  await globalTestServer.start();
  return globalTestServer;
}

async function stopTestServer() {
  if (globalTestServer) {
    await globalTestServer.stop();
    globalTestServer = null;
  }
}

function getTestServer() {
  return globalTestServer;
}

module.exports = {
  TestServer,
  startTestServer,
  stopTestServer,
  getTestServer,
};
