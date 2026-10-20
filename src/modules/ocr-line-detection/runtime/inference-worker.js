/* global ort, importScripts */
/* The only neural inference path: the real ONNX model in a browser worker. */
importScripts('/ocr-line-detection/vendor/ort.wasm.min.js');
ort.env.wasm.numThreads=1;
ort.env.wasm.wasmPaths=new URL('/ocr-line-detection/vendor/',self.location.href).href;
ort.env.wasm.proxy=false;
const SHA256='f2bd4cba23e9c328cf7ec824634e423e191a2c6aacbbf35c62bd79dd70f62f59';
const ready=(async()=>{
 const response=await fetch('/ocr-line-detection/model/det.onnx');if(!response.ok)throw Error('Could not load detector weights');
 const bytes=await response.arrayBuffer();
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
 if(digest!==SHA256)throw Error('Detector checksum mismatch');
 return ort.InferenceSession.create(bytes,{executionProviders:['wasm'],graphOptimizationLevel:'all'});
})();
self.onmessage=async({data})=>{
 try{
  const session=await ready;
  if(data.type==='ready'){self.postMessage({id:data.id,ready:true,sha256:SHA256});return;}
  const started=performance.now();
  const result=await session.run({x:new ort.Tensor('float32',data.x,data.shape)});
  const out=result.out;
  self.postMessage({id:data.id,out:out.data,shape:out.dims,ms:performance.now()-started},[out.data.buffer]);
 }catch(e){self.postMessage({id:data.id,error:String(e.message||e)});}
};
