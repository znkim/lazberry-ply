import assert from 'node:assert/strict';
import {createPreviewCubeGeometry,interpolateMatrices} from '../src/viewport-utils.js';

const from=new Float32Array(16).fill(0),to=new Float32Array(16).fill(2);
assert.deepEqual([...interpolateMatrices(from,to,.5)],new Array(16).fill(1));
assert.deepEqual([...interpolateMatrices(from,to,-1)],new Array(16).fill(0));
assert.deepEqual([...interpolateMatrices(from,to,2)],new Array(16).fill(2));

const cube=createPreviewCubeGeometry();
assert.equal(cube.positions.length,72);
assert.equal(cube.colors.length,72);
assert.equal(cube.indices.length,36);
assert.equal(new Set(Array.from({length:24},(_,index)=>cube.colors.slice(index*3,index*3+3).join(','))).size,6);

console.log('Viewport utility tests passed');
