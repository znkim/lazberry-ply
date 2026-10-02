// Writes test-data/sample-splat.ply: a small synthetic 3D Gaussian Splatting PLY (sphere, floor ring, X-axis needle).
import {writeFileSync} from 'node:fs';

const SH_C0=.28209479177387814,names=['x','y','z','nx','ny','nz','f_dc_0','f_dc_1','f_dc_2',...Array.from({length:45},(_,i)=>`f_rest_${i}`),'opacity','scale_0','scale_1','scale_2','rot_0','rot_1','rot_2','rot_3'],rows=[];
let seed=1;const random=()=>(seed=Math.imul(seed^seed>>>15,0x2c1b3c6d)+0x6d2b79f5>>>0)/4294967296;
// Flattened splat whose local Z axis is aligned to the normal n.
const add=(position,n,rgb,scale,opacity=.9)=>{const q=n[2]<-.999?[0,1,0,0]:[1+n[2],-n[1],n[0],0],length=Math.hypot(...q);rows.push([...position,0,0,0,...rgb.map(c=>(c-.5)/SH_C0),...Array(45).fill(0),Math.log(opacity/(1-opacity)),...scale.map(Math.log),...q.map(v=>v/length)])};
for(let i=0;i<4000;i++){const u=random()*2-1,t=random()*Math.PI*2,r=Math.sqrt(1-u*u),n=[r*Math.cos(t),r*Math.sin(t),u];add(n,n,n.map(v=>.5+.5*v),[.09,.09,.008])}
for(let i=0;i<1200;i++){const a=random()*Math.PI*2,d=1.2+Math.sqrt(random())*.8;add([d*Math.cos(a),d*Math.sin(a),-1],[0,0,1],[.85,.25,.2],[.12,.12,.006],.7)}
for(let i=0;i<40;i++)add([-2+i*.1,0,1.5],[0,0,1],[1,1,0],[.08,.01,.01]);
const header=`ply\nformat binary_little_endian 1.0\nelement vertex ${rows.length}\n${names.map(name=>`property float ${name}`).join('\n')}\nend_header\n`;
writeFileSync(new URL('../test-data/sample-splat.ply',import.meta.url),Buffer.concat([Buffer.from(header,'ascii'),Buffer.from(new Float32Array(rows.flat()).buffer)]));
console.log(`Wrote ${rows.length} splats to test-data/sample-splat.ply`);
