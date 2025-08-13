import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const manifestPath = './public/manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

const [versionCore, prerelease] = pkg.version.split('-');

manifest.version = versionCore;

if (prerelease) {
  manifest.version_name = pkg.version;
} else {
  delete manifest.version_name;
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
