import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const distDir = 'dist';
const clientDir = join(distDir, 'client');
const staticDir = join(distDir, 'static');

// Get the actual hashed filenames
const assets = readdirSync(join(clientDir, 'assets'));
const indexJs = assets.find(f => f.startsWith('index-') && f.endsWith('.js'));
const stylesCss = assets.find(f => f.startsWith('styles-') && f.endsWith('.css'));

if (!indexJs || !stylesCss) {
  console.error('Could not find index.js or styles.css in assets');
  process.exit(1);
}

// Create static directory
if (!existsSync(staticDir)) {
  mkdirSync(staticDir, { recursive: true });
}

// Copy assets
const assetsDir = join(staticDir, 'assets');
if (!existsSync(assetsDir)) {
  mkdirSync(assetsDir, { recursive: true });
}

for (const file of assets) {
  copyFileSync(join(clientDir, 'assets', file), join(assetsDir, file));
}

// Create index.html with correct hashed filenames
const html = `<!DOCTYPE html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hiragana Draw & Learn</title>
    <meta name="description" content="Learn and practice Hiragana characters" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;700&family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet" />
    <script type="module" crossorigin src="/assets/${indexJs}"></script>
    <link rel="stylesheet" crossorigin href="/assets/${stylesCss}">
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
`;

writeFileSync(join(staticDir, 'index.html'), html);

// Create _redirects for SPA routing
writeFileSync(join(staticDir, '_redirects'), '/* /index.html 200\n');

console.log('Static build complete in dist/static/');
console.log('- index.html created');
console.log('- _redirects created for SPA routing');
console.log(`- Assets copied: ${assets.length} files`);
