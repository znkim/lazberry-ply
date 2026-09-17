const MIN_RECORD_LENGTH=[20,28,26,34,57,63,30,36,38,59,67];
const COLOR_OFFSETS={2:20,3:28,5:28,7:30,8:30,10:30};
const GPS_TIME_OFFSETS={1:20,3:20,4:20,5:20,6:22,7:22,8:22,9:22,10:22};
const CLASSIFICATION_COLORS=[
  [210,218,228],[155,118,83],[92,156,72],[80,142,63],[64,128,58],[70,130,180],
  [205,198,150],[190,190,190],[180,210,225],[120,180,190],[225,190,90],[235,150,80]
];

function requireBytes(view,offset,length,message='The LAS file is truncated.'){
  if(offset<0||length<0||offset+length>view.byteLength)throw new Error(message);
}

function safePointCount(view,versionMinor,legacyCount){
  if(versionMinor<4||view.byteLength<255)return legacyCount;
  const extended=view.getBigUint64(247,true);
  if(extended===0n)return legacyCount;
  if(extended>BigInt(Number.MAX_SAFE_INTEGER))throw new Error('The LAS point count is too large for this browser.');
  return Number(extended);
}

export function parseLasHeader(buffer){
  const view=new DataView(buffer);
  requireBytes(view,0,227,'The file is too small to contain a LAS header.');
  if(String.fromCharCode(...new Uint8Array(buffer,0,4))!=='LASF')throw new Error('Invalid LAS signature.');
  const versionMajor=view.getUint8(24),versionMinor=view.getUint8(25);
  if(versionMajor!==1||versionMinor>4)throw new Error(`Unsupported LAS version: ${versionMajor}.${versionMinor}`);
  const headerSize=view.getUint16(94,true),pointDataOffset=view.getUint32(96,true),formatByte=view.getUint8(104);
  const compressed=(formatByte&0x80)!==0,pointFormat=formatByte&0x3f,pointRecordLength=view.getUint16(105,true);
  if(pointFormat>10)throw new Error(`Unsupported LAS point format: ${pointFormat}`);
  if(pointRecordLength<MIN_RECORD_LENGTH[pointFormat])throw new Error(`Invalid record length ${pointRecordLength} for LAS point format ${pointFormat}.`);
  if(headerSize<227||pointDataOffset<headerSize)throw new Error('Invalid LAS header or point data offset.');
  const pointCount=safePointCount(view,versionMinor,view.getUint32(107,true));
  const scale=[view.getFloat64(131,true),view.getFloat64(139,true),view.getFloat64(147,true)];
  const offset=[view.getFloat64(155,true),view.getFloat64(163,true),view.getFloat64(171,true)];
  if(scale.some(value=>!Number.isFinite(value)||value===0)||offset.some(value=>!Number.isFinite(value)))throw new Error('Invalid LAS scale or offset values.');
  const min=[view.getFloat64(187,true),view.getFloat64(203,true),view.getFloat64(219,true)];
  const max=[view.getFloat64(179,true),view.getFloat64(195,true),view.getFloat64(211,true)];
  return{version:`${versionMajor}.${versionMinor}`,versionMajor,versionMinor,headerSize,pointDataOffset,pointFormat,pointRecordLength,pointCount,compressed,scale,offset,min,max};
}

function color8(value){return Math.max(0,Math.min(255,Math.round(value/257)))}
function fallbackColor(intensity,classification){
  if(classification>0)return CLASSIFICATION_COLORS[Math.min(classification,CLASSIFICATION_COLORS.length-1)];
  if(intensity>0){const value=color8(intensity);return[value,value,value]}
  return CLASSIFICATION_COLORS[0];
}

export function decodeLasPoints(header,pointCount,recordViewAt,onProgress=()=>{}){
  const positions=new Float64Array(pointCount*3),colors=new Uint8Array(pointCount*3),intensity=new Uint16Array(pointCount),classification=new Uint8Array(pointCount),returnNumber=new Uint8Array(pointCount),numberOfReturns=new Uint8Array(pointCount);
  const gpsOffset=GPS_TIME_OFFSETS[header.pointFormat],gpsTime=gpsOffset===undefined?null:new Float64Array(pointCount),colorOffset=COLOR_OFFSETS[header.pointFormat];
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(let index=0;index<pointCount;index++){
    const view=recordViewAt(index);requireBytes(view,0,header.pointRecordLength);
    const base=index*3;
    for(let axis=0;axis<3;axis++){
      const value=view.getInt32(axis*4,true)*header.scale[axis]+header.offset[axis];
      positions[base+axis]=value;min[axis]=Math.min(min[axis],value);max[axis]=Math.max(max[axis],value);
    }
    const strength=view.getUint16(12,true);intensity[index]=strength;
    if(header.pointFormat<=5){const flags=view.getUint8(14);returnNumber[index]=flags&7;numberOfReturns[index]=(flags>>3)&7;classification[index]=view.getUint8(15)&31}
    else{const flags=view.getUint8(14);returnNumber[index]=flags&15;numberOfReturns[index]=(flags>>4)&15;classification[index]=view.getUint8(16)}
    if(gpsTime)gpsTime[index]=view.getFloat64(gpsOffset,true);
    if(colorOffset!==undefined){colors[base]=color8(view.getUint16(colorOffset,true));colors[base+1]=color8(view.getUint16(colorOffset+2,true));colors[base+2]=color8(view.getUint16(colorOffset+4,true))}
    else colors.set(fallbackColor(strength,classification[index]),base);
    if((index&65535)===0)onProgress(index,pointCount);
  }
  onProgress(pointCount,pointCount);
  if(pointCount===0){min.fill(0);max.fill(0)}
  return{positions,colors,indices:new Uint32Array(),min,max,vertexCount:pointCount,faceCount:0,triangleCount:0,format:`LAS ${header.version} · point format ${header.pointFormat}`,las:{...header,attributes:{intensity,classification,returnNumber,numberOfReturns,...(gpsTime?{gpsTime}:{})}}};
}

export function parseLas(buffer){
  const header=parseLasHeader(buffer);
  if(header.compressed)throw new Error('Compressed LAZ data must be decoded with the LAZ worker.');
  const required=header.pointDataOffset+header.pointCount*header.pointRecordLength;
  if(required>buffer.byteLength)throw new Error('The LAS point data is truncated.');
  return decodeLasPoints(header,header.pointCount,index=>new DataView(buffer,header.pointDataOffset+index*header.pointRecordLength,header.pointRecordLength));
}

export function transferableLasBuffers(model){
  const values=[model.positions.buffer,model.colors.buffer,model.indices.buffer];
  for(const value of Object.values(model.las?.attributes||{}))values.push(value.buffer);
  return values;
}
