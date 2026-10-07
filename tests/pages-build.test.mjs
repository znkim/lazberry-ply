import assert from 'node:assert/strict';
import {access, readdir, readFile} from 'node:fs/promises';
import pkg from '../package.json' with {type: 'json'};

const assetsDirectory = new URL('../docs/assets/', import.meta.url);
const assets = await readdir(assetsDirectory);
const pageSource = await readFile(new URL('../docs/index.html', import.meta.url), 'utf8');
const workerAsset = assets.find(name => /^point-worker-.*\.js$/.test(name));

assert.ok(workerAsset, 'GitHub Pages build must emit the point-cloud worker asset');
assert.ok(assets.some(name => /^splat-sort-worker-.*\.js$/.test(name)), 'GitHub Pages build must emit the Gaussian splat sort worker asset');

const mainAsset = assets.find(name => /^index-.*\.js$/.test(name));
assert.ok(mainAsset, 'GitHub Pages build must emit the main JavaScript asset');

const mainSource = await readFile(new URL(mainAsset, assetsDirectory), 'utf8');
assert.match(mainSource, new RegExp(`/lazberry-ply/assets/${workerAsset.replace('.', '\\.')}`));
assert.ok(mainSource.includes(`v${pkg.version}`), 'Pages build must display the package version');
assert.match(pageSource,/id="trackball-rotation"/);
assert.match(pageSource,/id="projection-mode"[^>]+aria-pressed="false"/);
assert.match(pageSource,/id="show-mesh"[^>]+checked/);
assert.match(pageSource,/id="show-cloud-points"[^>]+checked/);
assert.match(pageSource,/id="splat-controls"[^>]*hidden/);
assert.match(pageSource,/id="splat-resolution"[^>]+value="100"/);
assert.doesNotMatch(pageSource,/id="show-points"[^>]+checked/);
assert.doesNotMatch(pageSource,/id="show-edge"[^>]+checked/);
assert.match(pageSource,/id="mesh-opacity"[^>]+value="100"/);
assert.doesNotMatch(pageSource,/id="orientation-panel"/);
assert.match(pageSource,/accept="\.ply,\.las,\.laz"/);
assert.match(pageSource,/Drop a PLY, LAS, or LAZ file to open/);
assert.ok(assets.some(name=>name.endsWith('.wasm')),'GitHub Pages build must emit the LAZ decoder WASM asset');
await access(new URL('../docs/favicon.svg', import.meta.url));

console.log('GitHub Pages build tests passed');
