// 3D Gaussian Splatting PLY support: attribute decoding, GPU packing, and depth sorting.
export const SPLAT_FIELDS=['f_dc_0','f_dc_1','f_dc_2','opacity','scale_0','scale_1','scale_2','rot_0','rot_1','rot_2','rot_3'];
const SH_C0=.28209479177387814,TEXELS_PER_SPLAT=3;

export function isGaussianSplat(names){return SPLAT_FIELDS.every(name=>names.includes(name))}
export function createSplatData(count){return{scales:new Float32Array(count*3),rotations:new Float32Array(count*4),opacities:new Float32Array(count)}}
export function transferableSplatBuffers(splat){return splat?[splat.scales.buffer,splat.rotations.buffer,splat.opacities.buffer]:[]}

// values follow SPLAT_FIELDS order; writes decoded scale/rotation/opacity and the SH DC base color.
export function writeSplat(splat,colors,index,values){
  for(let a=0;a<3;a++){colors[index*3+a]=Math.round(Math.max(0,Math.min(1,.5+SH_C0*values[a]))*255);splat.scales[index*3+a]=Math.exp(values[4+a])}
  splat.opacities[index]=1/(1+Math.exp(-values[3]));
  const length=Math.hypot(values[7],values[8],values[9],values[10]);
  for(let a=0;a<4;a++)splat.rotations[index*4+a]=length?values[7+a]/length:+!a;
}

// Covariance R·S·Sᵀ·Rᵀ in source coordinates, then mapped like centerAndMapZUp: (x,y,z)/radius -> (x,z,-y).
export function splatCovariance(scale,rotation,radius){
  const[w,x,y,z]=rotation,r=[1-2*(y*y+z*z),2*(x*y-w*z),2*(x*z+w*y),2*(x*y+w*z),1-2*(x*x+z*z),2*(y*z-w*x),2*(x*z-w*y),2*(y*z+w*x),1-2*(x*x+y*y)];
  const m=r.map((value,index)=>value*scale[index%3]),c=(i,j)=>(m[i*3]*m[j*3]+m[i*3+1]*m[j*3+1]+m[i*3+2]*m[j*3+2])/(radius*radius);
  return[c(0,0),c(0,2),-c(0,1),c(2,2),-c(2,1),c(1,1)];
}

// Three RGBA32UI texels per splat: [x,y,z,rgba8] [c00,c01,c02,c11] [c12,c22,-,-]; rows never split a splat.
export function packSplats(positions,colors,splat,radius,maxTextureSize){
  const count=splat.opacities.length;let perRow=Math.floor(Math.min(maxTextureSize,4096)/TEXELS_PER_SPLAT),height=Math.max(1,Math.ceil(count/perRow));
  if(height>maxTextureSize){perRow=Math.floor(maxTextureSize/TEXELS_PER_SPLAT);height=Math.ceil(count/perRow)}
  if(height>maxTextureSize)throw new Error(`This Gaussian splat has too many splats (${count.toLocaleString()}) for this GPU.`);
  const width=perRow*TEXELS_PER_SPLAT,data=new Uint32Array(width*height*4),floats=new Float32Array(data.buffer);
  for(let i=0;i<count;i++){
    const o=(Math.floor(i/perRow)*width+i%perRow*TEXELS_PER_SPLAT)*4,cov=splatCovariance(splat.scales.subarray(i*3,i*3+3),splat.rotations.subarray(i*4,i*4+4),radius);
    floats[o]=positions[i*3];floats[o+1]=positions[i*3+1];floats[o+2]=positions[i*3+2];
    data[o+3]=(colors[i*3]|colors[i*3+1]<<8|colors[i*3+2]<<16|Math.round(splat.opacities[i]*255)<<24)>>>0;
    floats.set(cov,o+4);
  }
  return{data,width,height,perRow,count};
}

// Back-to-front order for a camera looking down -z: ascending view-space z = dot(direction, position).
export function sortSplatsByDepth(positions,direction,order=new Uint32Array(positions.length/3)){
  const count=positions.length/3,depths=new Float32Array(count),[dx,dy,dz]=direction;let min=Infinity,max=-Infinity;
  for(let i=0;i<count;i++){const depth=dx*positions[i*3]+dy*positions[i*3+1]+dz*positions[i*3+2];depths[i]=depth;if(depth<min)min=depth;if(depth>max)max=depth}
  const buckets=65536,scale=max>min?(buckets-1)/(max-min):0,keys=new Uint16Array(count),starts=new Uint32Array(buckets);
  for(let i=0;i<count;i++){const key=Math.floor((depths[i]-min)*scale);keys[i]=key;starts[key]++}
  for(let i=0,sum=0;i<buckets;i++){const value=starts[i];starts[i]=sum;sum+=value}
  for(let i=0;i<count;i++)order[starts[keys[i]]++]=i;
  return order;
}
