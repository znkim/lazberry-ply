const radians = degrees => degrees * Math.PI / 180;

const rotateX = ([x,y,z],angle) => {
  const c=Math.cos(angle),s=Math.sin(angle);
  return [x,c*y-s*z,s*y+c*z];
};

const rotateY = ([x,y,z],angle) => {
  const c=Math.cos(angle),s=Math.sin(angle);
  return [c*x+s*z,y,-s*x+c*z];
};

const rotateZ = ([x,y,z],angle) => {
  const c=Math.cos(angle),s=Math.sin(angle);
  return [c*x-s*y,s*x+c*y,z];
};

function applyUpAxis(vector,upAxis){
  switch(upAxis){
    case '-Z': return rotateX(vector,Math.PI);
    case '+Y': return rotateX(vector,Math.PI/2);
    case '-Y': return rotateX(vector,-Math.PI/2);
    case '+X': return rotateY(vector,-Math.PI/2);
    case '-X': return rotateY(vector,Math.PI/2);
    default: return vector;
  }
}

export function orientSourceVector(vector,upAxis='+Z',rotation={x:0,y:0,z:0}){
  let result=applyUpAxis(vector,upAxis);
  result=rotateX(result,radians(rotation.x||0));
  result=rotateY(result,radians(rotation.y||0));
  return rotateZ(result,radians(rotation.z||0));
}

const sourceToRender=([x,y,z])=>[x,z,-y];
const renderToSource=([x,y,z])=>[x,-z,y];

export function createOrientationMatrix(upAxis='+Z',rotation={x:0,y:0,z:0}){
  const columns=[[1,0,0],[0,1,0],[0,0,1]].map(vector=>sourceToRender(orientSourceVector(renderToSource(vector),upAxis,rotation)));
  return new Float32Array([
    ...columns[0],0,
    ...columns[1],0,
    ...columns[2],0,
    0,0,0,1
  ]);
}
