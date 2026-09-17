import assert from 'node:assert/strict';
import {createPreviewCubeGeometry} from '../src/viewport-utils.js';

const cube=createPreviewCubeGeometry();
assert.equal(cube.positions.length,72);
assert.equal(cube.colors.length,72);
assert.equal(cube.indices.length,36);
assert.equal(new Set(Array.from({length:24},(_,index)=>cube.colors.slice(index*3,index*3+3).join(','))).size,6);

console.log('Viewport utility tests passed');
