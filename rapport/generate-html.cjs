const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

const md = fs.readFileSync('C:/Users/Moaad/Desktop/maison-tislit-e-commerce-website/rapport/full-report.md', 'utf-8');
const bodyHtml = marked.parse(md);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Maison Tislit - PFE Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Raleway:wght@400;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Raleway', sans-serif; color: #1c1917; line-height: 1.7; padding: 40px; max-width: 900px; margin: 0 auto; }
  h1, h2, h3, h4 { font-family: 'Playfair Display', serif; color: #1a1208; margin-top: 1.5em; margin-bottom: 0.5em; }
  h1 { font-size: 28px; border-bottom: 2px solid #c9a84c; padding-bottom: 10px; margin-top: 1em; }
  h2 { font-size: 22px; }
  h3 { font-size: 18px; }
  p { margin-bottom: 1em; text-align: justify; }
  table { width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 14px; }
  th, td { border: 1px solid #d6d3d1; padding: 8px 12px; text-align: left; }
  th { background: #1a1208; color: #c9a84c; font-weight: 600; }
  tr:nth-child(even) { background: #fafaf9; }
  code { background: #f5f5f4; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
  pre { background: #1a1208; color: #e7e5e4; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 1em 0; }
  pre code { background: none; padding: 0; color: inherit; }
  ul, ol { margin-bottom: 1em; padding-left: 24px; }
  li { margin-bottom: 0.3em; }
  hr { margin: 2em 0; border: none; border-top: 1px solid #d6d3d1; }
  .cover { text-align: center; padding: 120px 0 80px; }
  .cover h1 { font-size: 42px; border: none; margin-bottom: 10px; }
  .cover .subtitle { font-size: 20px; color: #c9a84c; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 40px; }
  .cover .info { font-size: 16px; color: #78716c; line-height: 2; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="cover">
    <h1>Maison Tislit</h1>
    <div class="subtitle">E-Commerce Platform</div>
    <div class="info">
      <p>Projet de Fin d'Etudes</p>
      <p>Full-Stack Web Development</p>
      <p>2025</p>
    </div>
  </div>
  ${bodyHtml}
</body>
</html>`;

fs.writeFileSync('C:/Users/Moaad/Desktop/maison-tislit-e-commerce-website/rapport/full-report.html', html, 'utf-8');
console.log('HTML generated successfully');
