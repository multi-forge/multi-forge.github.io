const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const ROOT_DIR = __dirname;
const ROUTES_PATH = path.join(ROOT_DIR, 'routes.json');
const QR_DIR = path.join(ROOT_DIR, 'qr');

if (!fs.existsSync(ROUTES_PATH)) {
  console.error('routes.json not found!');
  process.exit(1);
}

const routes = JSON.parse(fs.readFileSync(ROUTES_PATH, 'utf-8'));
fs.mkdirSync(QR_DIR, { recursive: true });

// 1. Generate static redirect page for each slug
for (const [slug, target] of Object.entries(routes)) {
  const slugDir = path.join(ROOT_DIR, slug);
  fs.mkdirSync(slugDir, { recursive: true });

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Redirecionando...</title>
  <meta http-equiv="refresh" content="0; url=${target}">
  <link rel="canonical" href="${target}">
  <script>
    (function() {
      var base = ${JSON.stringify(target)};
      try {
        var dest = new URL(base, location.origin);
        var curr = new URL(location.href);
        curr.searchParams.forEach(function(v, k) { dest.searchParams.set(k, v); });
        if (curr.hash) dest.hash = curr.hash;
        location.replace(dest.toString());
      } catch(e) {
        location.replace(base + location.search + location.hash);
      }
    })();
  </script>
  <style>
    body {
      margin: 0;
      background: #0E1114;
      color: #EDEFF2;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .box {
      border: 1px solid #282E38;
      background: #161A20;
      padding: 24px 32px;
      border-radius: 8px;
      text-align: center;
      max-width: 480px;
    }
    a { color: #60A5FA; text-decoration: none; word-break: break-all; }
  </style>
</head>
<body>
  <div class="box">
    <p style="margin:0 0 12px;font-size:14px;color:#9CA3AF;">Redirecionando para:</p>
    <a href="${target}">${target}</a>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(slugDir, 'index.html'), html, 'utf-8');
  console.log(`[OK] Generated /${slug}/index.html -> ${target}`);
}

// 2. Generate static SVGs for QR codes
async function generateQRCodes() {
  for (const [slug, target] of Object.entries(routes)) {
    const permanentUrl = `https://multi-forge.github.io/${slug}`;
    const svgPath = path.join(QR_DIR, `${slug}.svg`);
    const svgContent = await QRCode.toString(permanentUrl, {
      type: 'svg',
      margin: 1,
      width: 400,
      color: {
        dark: '#111827',
        light: '#FFFFFF'
      }
    });
    fs.writeFileSync(svgPath, svgContent, 'utf-8');
    console.log(`[OK] Generated QR: qr/${slug}.svg (${permanentUrl})`);
  }
}

// 3. Update routes dictionary in 404.html
const p404 = path.join(ROOT_DIR, '404.html');
if (fs.existsSync(p404)) {
  let content404 = fs.readFileSync(p404, 'utf-8');
  const serialized = JSON.stringify(routes, null, 2).replace(/\n/g, '\n      ');
  content404 = content404.replace(/var ROUTES = \{[\s\S]*?\};/, `var ROUTES = ${serialized};`);
  fs.writeFileSync(p404, content404, 'utf-8');
  console.log('[OK] Updated ROUTES table in 404.html');
}

generateQRCodes().then(() => {
  console.log('\nBuild complete! All routes and QR codes ready.');
}).catch(err => {
  console.error('Build error:', err);
  process.exit(1);
});
