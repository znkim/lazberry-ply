import{sortSplatsByDepth}from'./splat.js';

let positions=null;
self.onmessage=({data})=>{
  if(data.positions){positions=data.positions;return}
  const order=sortSplatsByDepth(positions,data.direction);
  self.postMessage({order},[order.buffer]);
};
