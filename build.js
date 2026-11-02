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

// 1. Generate static redirect page for each slug with strict security headers
for (const [slug, target] of Object.entries(routes)) {
  const cleanSlug = String(slug).toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (!cleanSlug) continue;
  const slugDir = path.join(ROOT_DIR, cleanSlug);
  fs.mkdirSync(slugDir, { recursive: true });

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <meta name="referrer" content="no-referrer">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; form-action 'none';">
  <title>Redirecionando...</title>
  <meta http-equiv="refresh" content="0; url=${target}">
  <script>
    (function() {
      var base = ${JSON.stringify(target)};
      var safeParams = ["p", "id", "code", "platform"];
      try {
        var dest = new URL(base);
        var curr = new URL(location.href);
        curr.searchParams.forEach(function(v, k) {
          if (safeParams.indexOf(k) !== -1 && String(v).length <= 64) {
            dest.searchParams.set(k, v);
          }
        });
        location.replace(dest.toString());
      } catch(e) {
        location.replace(base);
      }
    })();
  </script>
  <style>
    body {
      margin: 0;
      background: #0E1114;
      color: #9CA3AF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <p>Redirecionando...</p>
</body>
</html>`;

  fs.writeFileSync(path.join(slugDir, 'index.html'), html, 'utf-8');
  console.log(`[OK] Generated secure /${cleanSlug}/index.html`);
}

// 2. Generate static SVGs for QR codes
async function generateQRCodes() {
  for (const [slug] of Object.entries(routes)) {
    const cleanSlug = String(slug).toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanSlug) continue;
    const permanentUrl = `https://multi-forge.github.io/${cleanSlug}`;
    const svgPath = path.join(QR_DIR, `${cleanSlug}.svg`);
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
    console.log(`[OK] Generated QR: qr/${cleanSlug}.svg`);
  }
}

// 3. Update routes dictionary in 404.html
const p404 = path.join(ROOT_DIR, '404.html');
if (fs.existsSync(p404)) {
  let content404 = fs.readFileSync(p404, 'utf-8');
  const serialized = JSON.stringify(routes, null, 2).replace(/\n/g, '\n        ');
  content404 = content404.replace(/var ROUTES = \{[\s\S]*?\};/, `var ROUTES = ${serialized};`);
  fs.writeFileSync(p404, content404, 'utf-8');
  console.log('[OK] Updated ROUTES table in 404.html');
}

generateQRCodes().then(() => {
  console.log('\nSecure build complete!');
}).catch(err => {
  console.error('Build error:', err);
  process.exit(1);
});
