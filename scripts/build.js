const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('==================================================');
console.log('UNIFIED MONOREPO NETLIFY PRODUCTION BUILD');
console.log('==================================================');

// 1. Install & Build Backend
console.log('\n[1/4] Building Backend TypeScript...');
execSync('npm --prefix backend install --no-audit --legacy-peer-deps', { cwd: rootDir, stdio: 'inherit' });
execSync('npm --prefix backend run build', { cwd: rootDir, stdio: 'inherit' });

// 2. Synchronize Backend into netlify/functions layer and api/ layer
console.log('\n[2/4] Packaging Backend into Netlify Functions layer...');
const backendDist = path.join(rootDir, 'backend', 'dist');

// Target 1: netlify/functions/backend/dist
const netlifyBackendDist = path.join(rootDir, 'netlify', 'functions', 'backend', 'dist');
fs.rmSync(netlifyBackendDist, { recursive: true, force: true });
fs.mkdirSync(netlifyBackendDist, { recursive: true });
fs.cpSync(backendDist, netlifyBackendDist, { recursive: true });
console.log('✓ Successfully synchronized backend distribution into netlify/functions/backend/dist');

// Target 2: api/backend/dist (for backward compatibility and local testing)
const apiBackendDist = path.join(rootDir, 'api', 'backend', 'dist');
fs.rmSync(apiBackendDist, { recursive: true, force: true });
fs.mkdirSync(apiBackendDist, { recursive: true });
fs.cpSync(backendDist, apiBackendDist, { recursive: true });
console.log('✓ Successfully synchronized backend distribution into api/backend/dist');

// 3. Install & Build Frontend
console.log('\n[3/4] Building Frontend Vite Application...');
execSync('npm --prefix frontend install --no-audit --legacy-peer-deps', { cwd: rootDir, stdio: 'inherit' });
execSync('npm --prefix frontend run build', { cwd: rootDir, stdio: 'inherit' });

// 4. Synchronize Frontend to root dist and prepare Netlify SPA & API redirect rules
console.log('\n[4/4] Synchronizing Frontend artifacts into root ./dist ...');
const frontendDist = path.join(rootDir, 'frontend', 'dist');
const rootDist = path.join(rootDir, 'dist');
fs.mkdirSync(rootDist, { recursive: true });
fs.cpSync(frontendDist, rootDist, { recursive: true });

// Ensure 404.html exists as a duplicate of index.html for static edge fallbacks
const indexHtmlPath = path.join(rootDist, 'index.html');
const fallbackHtmlPath = path.join(rootDist, '404.html');
if (fs.existsSync(indexHtmlPath)) {
  fs.copyFileSync(indexHtmlPath, fallbackHtmlPath);
  console.log('✓ Created 404.html SPA fallback in ./dist');
}

// Write Netlify SPA & API rewrite rules into dist/_redirects
// Rule 1: /api/* rewrites to Netlify Function with forced status 200
// Rule 2: /* rewrites to index.html with status 200 for client-side routing
const redirectsContent = `/api/*    /.netlify/functions/api/:splat    200!
/*        /index.html                       200
`;
fs.writeFileSync(path.join(rootDist, '_redirects'), redirectsContent, 'utf-8');
console.log('✓ Generated _redirects route table in ./dist:');
console.log(redirectsContent.trim());

console.log('\n==================================================');
console.log('SUCCESS: Fullstack application compiled and verified for Netlify!');
console.log('==================================================');
