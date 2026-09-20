// Regenerates the favicon set from public/images/9oftan logo 2-01.png,
// keeping its dark background (RGB 69,40,41) exactly as designed.
// Output: public/favicon.webp (512), public/favicon-48.webp (48),
//         public/apple-touch-icon.png (180), public/favicon.ico (32).
// Run from the project root: node scripts/generate-favicons.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const SRC = 'public/images/9oftan logo 2-01.png'; // 4167x4167 square, logo centered on dark bg

const base = sharp(SRC);

// Favicon set — straight downscales of the original square artwork.
await base.clone().resize(512, 512).webp({ quality: 90 }).toFile('public/favicon.webp');
await base.clone().resize(48, 48).webp({ quality: 90 }).toFile('public/favicon-48.webp');
await base.clone().resize(180, 180).png().toFile('public/apple-touch-icon.png');

// favicon.ico = 32x32 PNG wrapped in an ICO container (supported by all modern browsers).
const png32 = await base.clone().resize(32, 32).png().toBuffer();
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // image count
const entry = Buffer.alloc(16);
entry[0] = 32; entry[1] = 32; // width, height in px
entry.writeUInt16LE(1, 4); // color planes
entry.writeUInt16LE(32, 6); // bits per pixel
entry.writeUInt32LE(png32.length, 8); // data size
entry.writeUInt32LE(22, 12); // data offset (6 + 16)
writeFileSync('public/favicon.ico', Buffer.concat([header, entry, png32]));

console.log('[favicons] wrote favicon.webp (512), favicon-48.webp (48), apple-touch-icon.png (180), favicon.ico (32)');
