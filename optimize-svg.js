const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Check if sharp is installed, install if needed
try {
  require.resolve("sharp");
} catch (e) {
  console.log("Installing sharp package...");
  execSync("npm install sharp");
}

const sharp = require("sharp");

const SVG_DIR = "src/assets/mascots";
const OUTPUT_DIR = "src/assets/mascots-op";

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Process each SVG file
async function processFiles() {
  const files = fs.readdirSync(SVG_DIR).filter((file) => file.endsWith(".svg"));

  console.log(`Processing ${files.length} SVG files...`);

  for (const file of files) {
    const filePath = path.join(SVG_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file);

    console.log(`Processing ${file}...`);

    try {
      // Read the SVG file
      const svgContent = fs.readFileSync(filePath, "utf8");

      // Extract base64 content using regex
      const base64Match = svgContent.match(
        /xlink:href="data:image\/png;base64,([^"]+)"/,
      );

      if (!base64Match || !base64Match[1]) {
        console.log(`  No embedded PNG found in ${file}, copying as is`);
        fs.copyFileSync(filePath, outputPath);
        continue;
      }

      // Get original file size
      const originalSize = fs.statSync(filePath).size;

      // Decode base64 to buffer
      const imageBuffer = Buffer.from(base64Match[1], "base64");

      // Optimize the PNG using sharp
      const optimizedBuffer = await sharp(imageBuffer)
        .resize(800) // Resize to a reasonable size for mobile
        .png({ quality: 75, compressionLevel: 9 })
        .toBuffer();

      // Re-encode to base64
      const optimizedBase64 = optimizedBuffer.toString("base64");

      // Replace the base64 data in the SVG
      const optimizedSvgContent = svgContent.replace(
        /xlink:href="data:image\/png;base64,[^"]+"/,
        `xlink:href="data:image/png;base64,${optimizedBase64}"`,
      );

      // Write the optimized SVG
      fs.writeFileSync(outputPath, optimizedSvgContent);

      // Get optimized file size
      const optimizedSize = fs.statSync(outputPath).size;

      // Calculate savings
      const savings = originalSize - optimizedSize;
      const percent = ((savings / originalSize) * 100).toFixed(2);

      console.log(
        `  ${file}: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(optimizedSize / 1024 / 1024).toFixed(2)}MB (saved ${(savings / 1024 / 1024).toFixed(2)}MB, ${percent}%)`,
      );
    } catch (error) {
      console.error(`  Error processing ${file}:`, error.message);
    }
  }
}

processFiles().catch((error) => {
  console.error("Error:", error);
});
