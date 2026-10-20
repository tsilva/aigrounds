// All PDF parsing, preprocessing, inference and decoding happens on this client.
import * as pdfjs from '/ocr-line-detection/vendor/pdf.mjs';
pdfjs.GlobalWorkerOptions.workerSrc='/ocr-line-detection/vendor/pdf.worker.mjs';
export function createEngine(){
const worker=new Worker('/ocr-line-detection/runtime/inference-worker.js'),pending=new Map();let nextId=0;
worker.onmessage=({data})=>{const p=pending.get(data.id);if(!p)return;pending.delete(data.id);if(data.error)p.reject(Error(data.error));else p.resolve(data);};
worker.onerror=()=>{for(const p of pending.values())p.reject(Error('Inference worker failed to load'));pending.clear();};
function ask(data){return new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});worker.postMessage({...data,id});});}
const ready=ask({type:'ready'});
const hash='f2bd4cba23e9c328cf7ec824634e423e191a2c6aacbbf35c62bd79dd70f62f59';
const revision='bd02167fdf2005a19962cc15188f8496a2c87d3b';
let pdf=null,current=null,serial=0,cached=null;
const makeCanvas=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
async function openFile(file){
 if(file.size>25*1024*1024)throw Error('Choose a file smaller than 25 MB.');
 const bytes=new Uint8Array(await file.arrayBuffer());
 if(pdf){await pdf.destroy();pdf=null;}
 if(new TextDecoder().decode(bytes.subarray(0,4))==='%PDF'){
  pdf=await pdfjs.getDocument({data:bytes,isEvalSupported:false,cMapUrl:'/ocr-line-detection/vendor/cmaps/',cMapPacked:true,standardFontDataUrl:'/ocr-line-detection/vendor/standard_fonts/'}).promise;
  if(pdf.numPages>500){await pdf.destroy();pdf=null;throw Error('Choose a PDF with at most 500 pages.');}
  current={kind:'pdf',name:file.name,id:++serial};return {name:file.name,pages:pdf.numPages};
 }
 const image=await createImageBitmap(file);
 try{if(image.width*image.height>24000000)throw Error('Image exceeds 24 megapixels.');
  const scale=Math.min(1,3000/Math.max(image.width,image.height)),c=makeCanvas(Math.round(image.width*scale),Math.round(image.height*scale));
  const ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(image,0,0,c.width,c.height);
  current={kind:'image',name:file.name,canvas:c,id:++serial};return {name:file.name,pages:1};
 }finally{image.close();}
}
async function openProvided(){const r=await fetch('/ocr-line-detection/document.pdf');if(!r.ok)throw Error('Could not load the provided PDF. Open a local file instead.');return openFile(new File([await r.blob()],'AI Grounds document example.pdf',{type:'application/pdf'}));}
function sample(name){const c=makeCanvas(800,1080),g=c.getContext('2d');g.fillStyle='white';g.fillRect(0,0,800,1080);g.fillStyle='#222';
 if(name!=='blank'){g.font='bold 27px sans-serif';g.fillText('A PAGE BECOMES A GRID',56,80);g.font='15px sans-serif';g.fillText('Synthetic control · browser generated',56,125);
 if(name==='dense'){for(let col=0;col<2;col++)for(let row=0;row<24;row++){g.font='11px sans-serif';g.fillText('Text lines become regions on a grid.',56+col*365,210+row*29);}}
 else{g.font='24px sans-serif';g.fillText('Find the lines. Read them later.',56,225);for(let row=0;row<15;row++){g.font='20px sans-serif';g.fillText(['A separate model reads the characters.','This detector predicts where the lines are.','Inspect each output cell in the browser.'][row%3],56,285+row*40);}}}
 return c;
}
async function getPage(source,page){if(source!=='upload')return sample(source);
 if(!current)throw Error('Open a PDF or image first.');if(current.kind==='image')return current.canvas;
 const p=await pdf.getPage(page),base=p.getViewport({scale:1}),scale=Math.min(200/72,2400/Math.max(base.width,base.height));
 const view=p.getViewport({scale}),c=makeCanvas(Math.ceil(view.width),Math.ceil(view.height));
 await p.render({canvasContext:c.getContext('2d'),viewport:view,background:'white'}).promise;p.cleanup();return c;
}
// Area integration for downsampling; bilinear for upsampling. Padding is white.
// This mirrors Indra's geometry and normalization, using browser rasterization.
function prepare(c,resolution){const g=c.getContext('2d',{willReadFrequently:true}),rgba=g.getImageData(0,0,c.width,c.height).data,w=c.width,h=c.height;
 const gray=new Uint8Array(w*h);for(let i=0;i<gray.length;i++)gray[i]=(rgba[i*4]*4899+rgba[i*4+1]*9617+rgba[i*4+2]*1868+8192)>>14;
 const scale=resolution/Math.max(h,w),nh=Math.max(1,Math.round(h*scale)),nw=Math.max(1,Math.round(w*scale));
 const ph=Math.ceil(nh/32)*32,pw=Math.ceil(nw/32)*32,x=new Float32Array(ph*pw);
 const weights=(n,m)=>Array.from({length:m},(_,d)=>{if(scale>=1){const t=Math.max(0,(d+.5)*n/m-.5),i=Math.floor(t),f=t-i;return [[Math.min(n-1,i),1-f],[Math.min(n-1,i+1),f]];}
  const a=d*n/m,b=(d+1)*n/m,out=[];for(let i=Math.floor(a);i<Math.ceil(b);i++)if(i<n)out.push([i,(Math.min(b,i+1)-Math.max(a,i))/(b-a)]);return out;});
 const wx=weights(w,nw),wy=weights(h,nh),temp=new Float32Array(h*nw);
 for(let y=0;y<h;y++)for(let dx=0;dx<nw;dx++){let v=0;for(const [sx,a] of wx[dx])v+=gray[y*w+sx]*a;temp[y*nw+dx]=v;}
 for(let dy=0;dy<nh;dy++)for(let dx=0;dx<nw;dx++){let v=0;for(const [sy,a] of wy[dy])v+=temp[sy*nw+dx]*a;x[dy*pw+dx]=Math.fround(1-Math.round(v)/255);}
 const input=makeCanvas(pw,ph),pixels=input.getContext('2d').createImageData(pw,ph);for(let i=0;i<x.length;i++){const v=Math.round((1-x[i])*255);pixels.data.set([v,v,v,255],i*4);}input.getContext('2d').putImageData(pixels,0,0);
 return {x,shape:[1,1,ph,pw],scale,input,gray};
}
const prob=x=>1/(1+Math.exp(-x));
// Four-neighbor components, with Indra's unweighted mean distance decoder.
function decode(out,w,h,threshold,minArea,scale,original){
 const size=w*h,labels=new Int32Array(size),mask=new Uint8Array(size),queue=new Int32Array(size),boxes=[];let components=0;
 for(let i=0;i<size;i++)mask[i]=prob(out[i])>threshold?1:0;
 for(let start=0;start<size;start++){if(!mask[start]||labels[start])continue;const id=++components;labels[start]=id;queue[0]=start;
  let head=0,tail=1,left=w,right=0,top=0,bottom=0,score=0;
  while(head<tail){const i=queue[head++],y=Math.floor(i/w),x=i%w;left=Math.min(left,x);right=Math.max(right,x);top+=(2*y+1)-out[size+i];bottom+=(2*y+1)+out[2*size+i];score+=prob(out[i]);
   const visit=j=>{if(mask[j]&&!labels[j]){labels[j]=id;queue[tail++]=j;}};
   if(x>0)visit(i-1);if(x<w-1)visit(i+1);if(y>0)visit(i-w);if(y<h-1)visit(i+w);
  }
  if(tail<minArea)continue;top/=tail;bottom/=tail;const ex=.15*Math.max(1,bottom-top),inputBox=[left*2-ex,top,(right+1)*2+ex,bottom].map(Math.fround);
  boxes.push({component:id,input_box:inputBox,box:inputBox.map((v,k)=>Math.max(0,Math.min(original[k%2===0?1:0],v/scale))),score:Math.fround(score/tail),area:tail});
 }
 return {labels,mask,boxes,components};
}
function color(t){t=Math.max(0,Math.min(1,t));const stops=[[48,18,59],[50,92,220],[25,196,210],[132,250,82],[249,186,44],[180,24,28]];const z=t*5,i=Math.min(4,Math.floor(z)),f=z-i;return stops[i].map((v,k)=>Math.round(v*(1-f)+stops[i+1][k]*f));}
function mapCanvas(w,h,fn){const c=makeCanvas(w,h),g=c.getContext('2d'),im=g.createImageData(w,h);for(let i=0;i<w*h;i++){const rgb=fn(i);im.data.set([...rgb,255],4*i);}g.putImageData(im,0,0);return c;}
function maps(out,w,h,decoded){const {mask,labels}=decoded,size=w*h,caps={};
 const images={centres:mapCanvas(w,h,i=>color(prob(out[i]))),mask:mapCanvas(w,h,i=>mask[i]?[255,255,255]:[0,0,0]),components:mapCanvas(w,h,i=>labels[i]?color(((labels[i]*.61803398875)%1)):[22,27,29])};
 for(const [ch,name] of [[1,'top'],[2,'bottom']]){const active=[];for(let i=0;i<size;i++)if(mask[i])active.push(out[ch*size+i]);active.sort((a,b)=>a-b);const pos=.98*(active.length-1),lo=Math.floor(pos),hi=Math.ceil(pos);const cap=Math.max(1,active.length?active[lo]+(active[hi]-active[lo])*(pos-lo):1);caps[name]=cap;images[name]=mapCanvas(w,h,i=>mask[i]?color(out[ch*size+i]/cap):[22,27,29]);}
 return {images,caps};
}
async function analyze(p){const started=performance.now(),key=[p.source,p.source==='upload'?current?.id:0,p.page,p.resolution].join(':');const cachedInference=!p.force&&cached?.key===key;
 if(!cachedInference){const source=await getPage(p.source,p.page),pre=performance.now(),prepared=prepare(source,p.resolution),preMs=performance.now()-pre;
  await ready;const result=await ask({type:'run',x:prepared.x,shape:prepared.shape});
  cached={key,source,...prepared,out:result.out,outputShape:result.shape,ms:result.ms,preMs};
 }
 const c=cached,w=c.outputShape[3],h=c.outputShape[2],t=performance.now(),decoded=decode(c.out,w,h,p.threshold,p.min_area,c.scale,[c.source.height,c.source.width]),decodeMs=performance.now()-t,display=maps(c.out,w,h,decoded);
 return {source:p.source==='upload'?current.name+' / page '+p.page:p.source,original_shape:[c.source.height,c.source.width],input_shape:c.shape,output_shape:c.outputShape,input_scale:c.scale,threshold:p.threshold,min_area:p.min_area,resolution:p.resolution,model_sha256:hash,revision,
  boxes:decoded.boxes,components:decoded.components,labels:decoded.labels,tensor:c.out,ink:c.x,images:{source:c.source,input:c.input,...display.images},distance_caps:display.caps,
  runtime:'ONNX Runtime Web 1.23.2 · WebAssembly · browser CPU · worker',timings:{preprocess_ms:c.preMs,inference_ms:c.ms,decode_ms:decodeMs,request_ms:performance.now()-started,cached_inference:cachedInference}};
}

function dispose(){worker.terminate();for(const p of pending.values())p.reject(Error('Detector closed'));pending.clear();if(pdf)void pdf.destroy();pdf=null;current=null;cached=null;}
return {ready,openFile,openProvided,analyze,dispose};
}
