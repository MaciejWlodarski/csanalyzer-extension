import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const manifestPath = './public/manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

manifest.version = pkg.version;

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
