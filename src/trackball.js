const EPSILON=1e-8;

export function normalizeQuaternion([x,y,z,w]){
  const length=Math.hypot(x,y,z,w)||1;
  return[x/length,y/length,z/length,w/length];
}

export function multiplyQuaternions([ax,ay,az,aw],[bx,by,bz,bw]){
  return normalizeQuaternion([aw*bx+ax*bw+ay*bz-az*by,aw*by-ax*bz+ay*bw+az*bx,aw*bz+ax*by-ay*bx+az*bw,aw*bw-ax*bx-ay*by-az*bz]);
}

export function quaternionFromAxisAngle([x,y,z],angle){
  const half=angle/2,s=Math.sin(half);
  return normalizeQuaternion([x*s,y*s,z*s,Math.cos(half)]);
}

export function quaternionFromViewAngles(yaw,pitch){
  return multiplyQuaternions(quaternionFromAxisAngle([1,0,0],pitch),quaternionFromAxisAngle([0,1,0],yaw));
}

export function quaternionBetweenVectors(from,to){
  const dot=Math.max(-1,Math.min(1,from[0]*to[0]+from[1]*to[1]+from[2]*to[2]));
  if(dot>1-EPSILON)return[0,0,0,1];
  if(dot<-1+EPSILON){const axis=Math.abs(from[0])<.9?[0,-from[2],from[1]]:[-from[1],from[0],0],length=Math.hypot(...axis);return quaternionFromAxisAngle(axis.map(value=>value/length),Math.PI)}
  const cross=[from[1]*to[2]-from[2]*to[1],from[2]*to[0]-from[0]*to[2],from[0]*to[1]-from[1]*to[0]];
  return normalizeQuaternion([...cross,1+dot]);
}

export function projectToTrackball(clientX,clientY,rect){
  const scale=Math.max(1,Math.min(rect.width,rect.height));
  let x=(2*(clientX-rect.left)-rect.width)/scale,y=(rect.height-2*(clientY-rect.top))/scale;
  const radiusSquared=x*x+y*y;
  if(radiusSquared>1){const inverse=1/Math.sqrt(radiusSquared);x*=inverse;y*=inverse;return[x,y,0]}
  return[x,y,Math.sqrt(1-radiusSquared)];
}

export function quaternionToMatrix(quaternion){
  const[x,y,z,w]=normalizeQuaternion(quaternion),xx=x*x,yy=y*y,zz=z*z,xy=x*y,xz=x*z,yz=y*z,wx=w*x,wy=w*y,wz=w*z;
  return new Float32Array([1-2*(yy+zz),2*(xy+wz),2*(xz-wy),0,2*(xy-wz),1-2*(xx+zz),2*(yz+wx),0,2*(xz+wy),2*(yz-wx),1-2*(xx+yy),0,0,0,0,1]);
}

export function quaternionFromMatrix(matrix){
  const trace=matrix[0]+matrix[5]+matrix[10];
  let x,y,z,w;
  if(trace>0){const scale=Math.sqrt(trace+1)*2;w=.25*scale;x=(matrix[6]-matrix[9])/scale;y=(matrix[8]-matrix[2])/scale;z=(matrix[1]-matrix[4])/scale}
  else if(matrix[0]>matrix[5]&&matrix[0]>matrix[10]){const scale=Math.sqrt(1+matrix[0]-matrix[5]-matrix[10])*2;w=(matrix[6]-matrix[9])/scale;x=.25*scale;y=(matrix[4]+matrix[1])/scale;z=(matrix[8]+matrix[2])/scale}
  else if(matrix[5]>matrix[10]){const scale=Math.sqrt(1+matrix[5]-matrix[0]-matrix[10])*2;w=(matrix[8]-matrix[2])/scale;x=(matrix[4]+matrix[1])/scale;y=.25*scale;z=(matrix[9]+matrix[6])/scale}
  else{const scale=Math.sqrt(1+matrix[10]-matrix[0]-matrix[5])*2;w=(matrix[1]-matrix[4])/scale;x=(matrix[8]+matrix[2])/scale;y=(matrix[9]+matrix[6])/scale;z=.25*scale}
  return normalizeQuaternion([x,y,z,w]);
}

export function slerpQuaternions(from,to,t){
  const amount=Math.max(0,Math.min(1,t));
  let target=to,dot=from[0]*to[0]+from[1]*to[1]+from[2]*to[2]+from[3]*to[3];
  if(dot<0){dot=-dot;target=to.map(value=>-value)}
  if(dot>.9995)return normalizeQuaternion(from.map((value,index)=>value+(target[index]-value)*amount));
  const angle=Math.acos(Math.max(-1,Math.min(1,dot))),sin=Math.sin(angle),fromWeight=Math.sin((1-amount)*angle)/sin,toWeight=Math.sin(amount*angle)/sin;
  return normalizeQuaternion(from.map((value,index)=>value*fromWeight+target[index]*toWeight));
}

export function viewAnglesFromQuaternion(quaternion){
  const matrix=quaternionToMatrix(quaternion);
  return[Math.atan2(matrix[8],matrix[0]),Math.asin(Math.max(-1,Math.min(1,matrix[6])))];
}
