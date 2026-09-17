import assert from'node:assert/strict';
import{parseLas,parseLasHeader}from'../src/las.js';

const RECORD_LENGTHS=[20,28,26,34,57,63,30,36,38,59,67],GPS_OFFSETS={1:20,3:20,4:20,5:20,6:22,7:22,8:22,9:22,10:22},COLOR_OFFSETS={2:20,3:28,5:28,7:30,8:30,10:30};
function makeLas({format=3,minor=format>=6?4:2,compressed=false}={}){
  const headerSize=minor>=4?375:227,recordLength=RECORD_LENGTHS[format],count=2,buffer=new ArrayBuffer(headerSize+recordLength*count),bytes=new Uint8Array(buffer),view=new DataView(buffer);
  bytes.set(new TextEncoder().encode('LASF'),0);view.setUint8(24,1);view.setUint8(25,minor);view.setUint16(94,headerSize,true);view.setUint32(96,headerSize,true);view.setUint8(104,format|(compressed?0x80:0));view.setUint16(105,recordLength,true);view.setUint32(107,count,true);
  if(minor>=4)view.setBigUint64(247,BigInt(count),true);
  [0.01,0.01,0.01].forEach((value,index)=>view.setFloat64(131+index*8,value,true));[500000,4000000,100].forEach((value,index)=>view.setFloat64(155+index*8,value,true));
  const writePoint=(index,values)=>{const at=headerSize+index*recordLength;view.setInt32(at,values[0],true);view.setInt32(at+4,values[1],true);view.setInt32(at+8,values[2],true);view.setUint16(at+12,values[3],true);if(format<=5){view.setUint8(at+14,2|(3<<3));view.setUint8(at+15,values[4])}else{view.setUint8(at+14,2|(3<<4));view.setUint8(at+16,values[4])}const gps=GPS_OFFSETS[format],color=COLOR_OFFSETS[format];if(gps!==undefined)view.setFloat64(at+gps,values[5],true);if(color!==undefined){view.setUint16(at+color,values[6],true);view.setUint16(at+color+2,values[7],true);view.setUint16(at+color+4,values[8],true)}};
  writePoint(0,[100,200,300,65535,5,123.5,65535,32896,0]);writePoint(1,[-100,-200,-300,0,2,456.25,0,257,65535]);return buffer;
}

for(let format=0;format<=10;format++){
  const buffer=makeLas({format}),header=parseLasHeader(buffer),model=parseLas(buffer);
  assert.equal(header.pointFormat,format);assert.equal(header.pointCount,2);assert.equal(header.version,format>=6?'1.4':'1.2');
  assert.ok(model.positions instanceof Float64Array);assert.deepEqual([...model.positions],[500001,4000002,103,499999,3999998,97]);
  assert.deepEqual([...model.colors],COLOR_OFFSETS[format]!==undefined?[255,128,0,0,1,255]:[70,130,180,92,156,72]);assert.deepEqual([...model.las.attributes.intensity],[65535,0]);assert.deepEqual([...model.las.attributes.classification],[5,2]);assert.deepEqual([...model.las.attributes.returnNumber],[2,2]);assert.deepEqual([...model.las.attributes.numberOfReturns],[3,3]);
  if(GPS_OFFSETS[format]!==undefined)assert.deepEqual([...model.las.attributes.gpsTime],[123.5,456.25]);else assert.equal(model.las.attributes.gpsTime,undefined);
  assert.deepEqual(model.min,[499999,3999998,97]);assert.deepEqual(model.max,[500001,4000002,103]);assert.equal(model.vertexCount,2);assert.equal(model.indices.length,0);
}

assert.equal(parseLasHeader(makeLas({format:7,compressed:true})).compressed,true);
assert.throws(()=>parseLas(makeLas({format:7,compressed:true})),/LAZ worker/);
assert.throws(()=>parseLas(makeLas().slice(0,-1)),/truncated/);
const invalid=makeLas();new Uint8Array(invalid)[0]=0;assert.throws(()=>parseLasHeader(invalid),/signature/);
console.log('LAS parser tests passed');
