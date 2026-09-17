import assert from 'node:assert/strict';
import {createOrientationMatrix,orientSourceVector} from '../src/orientation.js';

const close=(actual,expected)=>expected.forEach((value,index)=>assert.ok(Math.abs(actual[index]-value)<1e-6,`${actual} != ${expected}`));

for(const [axis,sourceUp] of Object.entries({'+Z':[0,0,1],'-Z':[0,0,-1],'+Y':[0,1,0],'-Y':[0,-1,0],'+X':[1,0,0],'-X':[-1,0,0]})){
  close(orientSourceVector(sourceUp,axis),[0,0,1]);
}

close(orientSourceVector([0,1,0],'+Z',{x:90,y:0,z:0}),[0,0,1]);
close(orientSourceVector([1,0,0],'+Z',{x:0,y:0,z:90}),[0,1,0]);

const matrix=createOrientationMatrix('+Y');
const transform=([x,y,z])=>[
  matrix[0]*x+matrix[4]*y+matrix[8]*z,
  matrix[1]*x+matrix[5]*y+matrix[9]*z,
  matrix[2]*x+matrix[6]*y+matrix[10]*z
];
close(transform([0,0,-1]),[0,1,0]);

console.log('Orientation tests passed');
