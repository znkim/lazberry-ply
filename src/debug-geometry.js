export function trianglePositions(positions,indices){
  const expanded=new Float32Array(indices.length*3);
  for(let i=0;i<indices.length;i++)expanded.set(positions.subarray(indices[i]*3,indices[i]*3+3),i*3);
  return expanded;
}

export function pointNormalLines(positions,normals,maxLines=10000){
  const count=Math.min(Math.floor(positions.length/3),maxLines),lines=new Float32Array(count*6),colors=new Uint8Array(count*6);
  if(!count)return{positions:lines,colors};
  let written=0;
  for(let sample=0;sample<count;sample++){
    const point=Math.floor(sample*(positions.length/3)/count);
    const a=point*3,normal=[normals[a],normals[a+1],normals[a+2]];
    const length=Math.hypot(...normal);
    if(length<1e-12)continue;
    const center=[positions[a],positions[a+1],positions[a+2]];
    lines.set([...center,...center.map((value,axis)=>value+normal[axis]/length*.018)],written*6);
    colors.set([255,192,64,255,192,64],written*6);
    written++;
  }
  return{positions:lines.subarray(0,written*6),colors:colors.subarray(0,written*6)};
}
