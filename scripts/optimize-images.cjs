const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const dir = path.join(process.cwd(), "public", "images");
const tmp = path.join(dir, ".tmp-opt");

async function optimize() {
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === ".tmp-opt") continue;
    const full = path.join(dir, f);
    const lower = f.toLowerCase();
    if (!/\.(jpg|jpeg|png|webp)$/.test(lower)) continue;

    const img = sharp(full);
    const meta = await img.metadata();
    const isLogo = f === "logo.webp" || f === "9oftan-logo-cropped.png";

    let targetW, quality, outFormat;
    if (isLogo) {
      targetW = 256; quality = 90; outFormat = "webp";
    } else if (f === "hero-bg.webp") {
      targetW = 1600; quality = 70; outFormat = "webp";
    } else if (f === "ccc.webp" || f === "ccc.jpg") {
      targetW = 1200; quality = 75; outFormat = lower.endsWith(".webp") ? "webp" : "jpeg";
    } else {
      targetW = 800; quality = 78; outFormat = lower.endsWith(".png") ? "png" : "jpeg";
    }

    const resizeW = Math.min(targetW, meta.width);
    const pipeline = img.resize(resizeW, null, { withoutEnlargement: true });

    let outName = f;
    if (outFormat === "webp") outName = f.replace(/\.(jpg|jpeg|png)$/i, ".webp");
    if (outFormat === "jpeg") outName = f.replace(/\.(png|webp)$/i, ".jpg");
    const tmpPath = path.join(tmp, outName);

    if (outFormat === "webp") await pipeline.webp({ quality, effort: 6 }).toFile(tmpPath);
    else if (outFormat === "jpeg") await pipeline.jpeg({ quality, mozjpeg: true }).toFile(tmpPath);
    else await pipeline.png({ compressionLevel: 9 }).toFile(tmpPath);

    const before = fs.statSync(full).size;
    const after = fs.statSync(tmpPath).size;
    if (after < before) {
      try {
        fs.renameSync(tmpPath, path.join(dir, outName));
        if (outName !== f) fs.unlinkSync(full);
        console.log(`${f.padEnd(28)} ${meta.width}x${meta.height} -> ${(after / 1024).toFixed(1)}KB (was ${(before / 1024).toFixed(1)}KB)`);
      } catch (e) {
        console.log(`${f.padEnd(28)} optimized to ${(after / 1024).toFixed(1)}KB but file locked, left at ${tmpPath}`);
      }
    } else {
      console.log(`${f.padEnd(28)} kept original (${(before / 1024).toFixed(1)}KB, optimized ${outName} was larger)`);
    }
  }
  // leave tmp for inspection; cleaned manually
}

optimize().then(() => console.log("done")).catch((e) => console.error(e));
