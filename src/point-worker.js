import{parsePly}from'./ply.js';
import{decodeLasPoints,parseLas,parseLasHeader,transferableLasBuffers}from'./las.js';
import{createLazPerf}from'laz-perf/lib/worker/index.js';
import lazPerfWasmUrl from'laz-perf/lib/worker/laz-perf.wasm?url';

function postProgress(done,total,label){self.postMessage({progress:total?done/total:0,label})}

async function parseLaz(buffer){
  const sourceHeader=parseLasHeader(buffer);
  const LazPerf=await createLazPerf({locateFile:path=>path.endsWith('.wasm')?lazPerfWasmUrl:path});
  const filePointer=LazPerf._malloc(buffer.byteLength),reader=new LazPerf.LASZip();
  let pointPointer=0;
  try{
    LazPerf.HEAPU8.set(new Uint8Array(buffer),filePointer);
    reader.open(filePointer,buffer.byteLength);
    const pointCount=reader.getCount(),pointRecordLength=reader.getPointLength(),pointFormat=reader.getPointFormat()&0x3f;
    const header={...sourceHeader,pointCount,pointRecordLength,pointFormat,compressed:true};
    pointPointer=LazPerf._malloc(pointRecordLength);
    const model=decodeLasPoints(header,pointCount,()=>{reader.getPoint(pointPointer);return new DataView(LazPerf.HEAPU8.buffer,pointPointer,pointRecordLength)},(done,total)=>postProgress(done,total,'Decompressing LAZ points'));
    model.format=`LAZ ${header.version} · point format ${pointFormat}`;
    return model;
  }finally{
    if(pointPointer)LazPerf._free(pointPointer);
    reader.delete();LazPerf._free(filePointer);
  }
}

self.onmessage=async event=>{
  try{
    const{buffer,extension}=event.data;
    let model;
    if(extension==='ply')model=parsePly(buffer);
    else if(extension==='las'||extension==='laz')model=parseLasHeader(buffer).compressed?await parseLaz(buffer):parseLas(buffer);
    else throw new Error(`Unsupported point-cloud format: ${extension||'unknown'}`);
    const transfers=extension==='ply'?[model.positions.buffer,model.colors.buffer,model.indices.buffer]:transferableLasBuffers(model);
    self.postMessage({model},transfers);
  }catch(error){self.postMessage({error:error instanceof Error?error.message:String(error)})}
};
