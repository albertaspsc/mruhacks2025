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

// Update to your correct paths
const SVG_DIR = "src/assets/gallery";
const OUTPUT_DIR = "src/assets/gallery-op";

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

      // Get image dimensions
      const metadata = await sharp(imageBuffer).metadata();

      // Calculate target size based on original size
      let quality = 75; // Start with good quality
      let targetWidth = 700; // Decent resolution for team photos

      // Adjust settings to target <300KB
      if (originalSize > 2000000) {
        // >2MB files
        targetWidth = 650;
        quality = 65;
      } else if (originalSize > 1000000) {
        // >1MB files
        targetWidth = 700;
        quality = 70;
      }

      // Optimize with adaptive settings
      const optimizedBuffer = await sharp(imageBuffer)
        .resize(targetWidth)
        .png({ quality: quality, compressionLevel: 9 })
        .toBuffer();

      // Check final size and adjust again if needed
      if (optimizedBuffer.length > 307200) {
        // If still >300KB
        const furtherOptimizedBuffer = await sharp(optimizedBuffer)
          .resize(Math.round(targetWidth * 0.9)) // Reduce by 10%
          .png({ quality: quality - 5, compressionLevel: 9 })
          .toBuffer();

        // Use the further optimized version
        const optimizedBase64 = furtherOptimizedBuffer.toString("base64");

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
          `  ${file}: ${(originalSize / 1024).toFixed(2)}KB → ${(optimizedSize / 1024).toFixed(2)}KB (saved ${(savings / 1024).toFixed(2)}KB, ${percent}%)`,
        );
      } else {
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
          `  ${file}: ${(originalSize / 1024).toFixed(2)}KB → ${(optimizedSize / 1024).toFixed(2)}KB (saved ${(savings / 1024).toFixed(2)}KB, ${percent}%)`,
        );
      }
    } catch (error) {
      console.error(`  Error processing ${file}:`, error.message);
    }
  }
}

processFiles().catch((error) => {
  console.error("Error:", error);
});
