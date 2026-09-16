import{parsePly}from'./ply.js';

self.onmessage=event=>{try{const model=parsePly(event.data);self.postMessage(model,[model.positions.buffer,model.colors.buffer,model.indices.buffer])}catch(error){self.postMessage({error:error instanceof Error?error.message:String(error)})}};
