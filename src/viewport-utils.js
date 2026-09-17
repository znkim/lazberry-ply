export function createPreviewCubeGeometry(size=.225){
  const faces=[
    [[size,0,0],[255,64,64],[[size,-size,-size],[size,size,-size],[size,size,size],[size,-size,size]]],
    [[-size,0,0],[0,220,220],[[-size,-size,size],[-size,size,size],[-size,size,-size],[-size,-size,-size]]],
    [[0,size,0],[64,128,255],[[-size,size,-size],[-size,size,size],[size,size,size],[size,size,-size]]],
    [[0,-size,0],[255,220,32],[[-size,-size,size],[-size,-size,-size],[size,-size,-size],[size,-size,size]]],
    [[0,0,size],[255,64,220],[[size,-size,size],[size,size,size],[-size,size,size],[-size,-size,size]]],
    [[0,0,-size],[64,255,96],[[-size,-size,-size],[-size,size,-size],[size,size,-size],[size,-size,-size]]]
  ];
  const positions=[],colors=[],indices=[];
  for(const[,color,corners]of faces){
    const offset=positions.length/3;
    for(const corner of corners){positions.push(...corner);colors.push(...color)}
    indices.push(offset,offset+1,offset+2,offset,offset+2,offset+3);
  }
  return{positions:new Float32Array(positions),colors:new Uint8Array(colors),indices:new Uint32Array(indices)};
}
