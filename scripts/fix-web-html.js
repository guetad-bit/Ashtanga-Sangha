const fs = require('fs');
const path = 'dist/index.html';

if (!fs.existsSync(path)) {
  console.log('No dist/index.html found, skipping patch');
  process.exit(0);
}

let html = fs.readFileSync(path, 'utf8');
html = html.replace(/<script defer/g, '<script type="module" defer');
fs.writeFileSync(path, html);
console.log('Patched dist/index.html: added type="module" to script tags');
