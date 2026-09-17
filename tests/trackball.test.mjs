import assert from 'node:assert/strict';
import {multiplyQuaternions,projectToTrackball,quaternionBetweenVectors,quaternionFromMatrix,quaternionFromViewAngles,quaternionToMatrix,slerpQuaternions,viewAnglesFromQuaternion} from '../src/trackball.js';

const close=(actual,expected,epsilon=1e-6)=>expected.forEach((value,index)=>assert.ok(Math.abs(actual[index]-value)<epsilon,`${actual} != ${expected}`));
const transform=(matrix,[x,y,z])=>[matrix[0]*x+matrix[4]*y+matrix[8]*z,matrix[1]*x+matrix[5]*y+matrix[9]*z,matrix[2]*x+matrix[6]*y+matrix[10]*z];

close(projectToTrackball(50,50,{left:0,top:0,width:100,height:100}),[0,0,1]);
close(projectToTrackball(100,50,{left:0,top:0,width:100,height:100}),[1,0,0]);
close(transform(quaternionToMatrix(quaternionBetweenVectors([0,0,1],[1,0,0])),[0,0,1]),[1,0,0]);

const combined=multiplyQuaternions(quaternionBetweenVectors([0,0,1],[1,0,0]),quaternionBetweenVectors([0,1,0],[0,0,1]));
assert.ok(Math.abs(Math.hypot(...combined)-1)<1e-6,'composed quaternion must remain normalized');
for(const angles of [[0,0],[.8,.4],[-1.2,-.6]])close(viewAnglesFromQuaternion(quaternionFromViewAngles(...angles)),angles);

const start=quaternionFromViewAngles(0,Math.PI/2),end=quaternionFromViewAngles(0,-Math.PI/2),middle=slerpQuaternions(start,end,.5),middleMatrix=quaternionToMatrix(middle);
assert.ok(Math.abs(Math.hypot(middleMatrix[0],middleMatrix[1],middleMatrix[2])-1)<1e-6);
assert.ok(Math.abs(Math.hypot(middleMatrix[4],middleMatrix[5],middleMatrix[6])-1)<1e-6);
assert.ok(Math.abs(Math.hypot(middleMatrix[8],middleMatrix[9],middleMatrix[10])-1)<1e-6);
close(quaternionToMatrix(quaternionFromMatrix(middleMatrix)),middleMatrix);

console.log('Trackball tests passed');
