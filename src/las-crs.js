const decoder=new TextDecoder();

function text(bytes){return decoder.decode(bytes).replace(/\0.*$/s,'').trim()}

function projectionRecords(buffer,header){
  const view=new DataView(buffer),bytes=new Uint8Array(buffer),records=[];
  const read=(start,count,headerLength,lengthOffset,lengthSize)=>{
    let cursor=start;
    for(let index=0;index<count;index++){
      if(!Number.isSafeInteger(cursor)||cursor<0||cursor+headerLength>buffer.byteLength)break;
      const length=lengthSize===8?Number(view.getBigUint64(cursor+lengthOffset,true)):view.getUint16(cursor+lengthOffset,true);
      const end=cursor+headerLength+length;
      if(!Number.isSafeInteger(end)||end>buffer.byteLength)break;
      if(text(bytes.subarray(cursor+2,cursor+18))==='LASF_Projection')
        records.push({id:view.getUint16(cursor+18,true),data:bytes.subarray(cursor+headerLength,end)});
      cursor=end;
    }
  };
  read(header.headerSize,view.getUint32(100,true),54,20,2);
  if(header.versionMinor>=4&&buffer.byteLength>=247){
    const start=Number(view.getBigUint64(235,true));
    if(start>0)read(start,view.getUint32(243,true),60,20,8);
  }
  return records;
}

function geoKeyEpsg(data){
  if(data.byteLength<8)return null;
  const view=new DataView(data.buffer,data.byteOffset,data.byteLength),count=view.getUint16(6,true);
  if(8+count*8>data.byteLength)return null;
  for(const key of [3072,2048,4096])for(let index=0;index<count;index++){
    const at=8+index*8;
    if(view.getUint16(at,true)!==key||view.getUint16(at+2,true)!==0||view.getUint16(at+4,true)!==1)continue;
    const code=view.getUint16(at+6,true);
    if(code>0&&code!==32767)return code;
  }
  return null;
}

export function readLasCrs(buffer,header){
  const records=projectionRecords(buffer,header);
  const wkt=records.find(record=>record.id===2112||record.id===2111);
  const wktText=wkt?text(wkt.data):'';
  const keys=records.find(record=>record.id===34735);
  const epsg=keys?geoKeyEpsg(keys.data):null;
  if(!wktText&&!epsg)return null;
  const wktCodes=[...wktText.matchAll(/(?:AUTHORITY|ID)\s*\[\s*["']EPSG["']\s*,\s*["']?(\d+)/gi)];
  const wktCode=wktCodes.at(-1)?.[1];
  const code=epsg||wktCode;
  const name=wktText.match(/^\s*\w+\s*\[\s*"([^"]+)"/)?.[1];
  return{label:[code?`EPSG:${code}`:null,name].filter(Boolean).join(' · ')||wktText.slice(0,120),wkt:wktText||null};
}
