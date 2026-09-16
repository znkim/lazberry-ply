import assert from 'node:assert/strict';
import {readdir, readFile} from 'node:fs/promises';
import pkg from '../package.json' with {type: 'json'};

const assetsDirectory = new URL('../docs/assets/', import.meta.url);
const assets = await readdir(assetsDirectory);
const workerAsset = assets.find(name => /^ply-worker-.*\.js$/.test(name));

assert.ok(workerAsset, 'GitHub Pages build must emit the PLY worker asset');

const mainAsset = assets.find(name => /^index-.*\.js$/.test(name));
assert.ok(mainAsset, 'GitHub Pages build must emit the main JavaScript asset');

const mainSource = await readFile(new URL(mainAsset, assetsDirectory), 'utf8');
assert.match(mainSource, new RegExp(`/lazberry-ply/assets/${workerAsset.replace('.', '\\.')}`));
assert.ok(mainSource.includes(`v${pkg.version}`), 'Pages build must display the package version');

console.log('GitHub Pages build tests passed');
