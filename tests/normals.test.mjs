import assert from'node:assert/strict';
import{parsePly,sampleVertices}from'../src/ply.js';
import{pointNormalLines}from'../src/debug-geometry.js';

const encoder=new TextEncoder();
const ascii=encoder.encode(`ply
format ascii 1.0
element vertex 2
property float x
property float y
property float z
property float nx
property float ny
property float nz
end_header
0 0 0 0 0 1
1 0 0 0 1 0
`).buffer;
const parsed=parsePly(ascii);
assert.deepEqual([...parsed.normals],[0,0,1,0,1,0]);
assert.deepEqual([...sampleVertices(parsed,1).normals],[0,0,1]);

const header=encoder.encode(`ply
format binary_little_endian 1.0
element vertex 1
property float x
property float y
property float z
property float normal_x
property float normal_y
property float normal_z
end_header
`);
const binary=new Uint8Array(header.length+24),view=new DataView(binary.buffer);
binary.set(header);
[2,3,4,1,0,0].forEach((value,index)=>view.setFloat32(header.length+index*4,value,true));
assert.deepEqual([...parsePly(binary.buffer).normals],[1,0,0]);

const lines=pointNormalLines(new Float32Array([0,0,0]),new Float32Array([0,0,1]));
assert.equal(lines.positions.length,6);
assert.ok(Math.abs(lines.positions[5]-.018)<1e-6);
console.log('Point normal tests passed');
