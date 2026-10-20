// Minimal uncompressed NumPy NPZ writer: standard .npy members in a ZIP archive.
const enc=new TextEncoder();
function npy(data,shape,descr='<f4'){
 let header=`{'descr': '${descr}', 'fortran_order': False, 'shape': (${shape.join(', ')}${shape.length===1?',':''}), }`;
 header+=' '.repeat((64-(10+header.length+1)%64)%64)+'\n';const h=enc.encode(header),b=new Uint8Array(10+h.length+data.byteLength),dv=new DataView(b.buffer);
 b.set([147,78,85,77,80,89,1,0]);dv.setUint16(8,h.length,true);b.set(h,10);b.set(new Uint8Array(data.buffer,data.byteOffset,data.byteLength),10+h.length);return b;
}
const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(b){let c=0xffffffff;for(const v of b)c=crcTable[(c^v)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
export function tensorNPZ(d){const meta=enc.encode(JSON.stringify({source:d.source,input_shape:d.input_shape,output_shape:d.output_shape,model_sha256:d.model_sha256,model_revision:d.revision,model_attribution:"Datalab Indra",model_license:"https://aigrounds.tsilva.eu/ocr-line-detection/model/LICENSE.txt",runtime:d.runtime,threshold:d.threshold,min_area:d.min_area,boxes:d.boxes,timings:d.timings}));
 const files=[['x.npy',npy(d.ink,d.input_shape)],['out.npy',npy(d.tensor,d.output_shape)],['metadata.npy',npy(meta,[meta.length],'|u1')]],local=[],central=[];let offset=0,cs=0;
 for(const [name,data] of files){const n=enc.encode(name),crc=crc32(data),l=new Uint8Array(30+n.length),ld=new DataView(l.buffer);ld.setUint32(0,0x04034b50,true);ld.setUint16(4,20,true);ld.setUint32(14,crc,true);ld.setUint32(18,data.length,true);ld.setUint32(22,data.length,true);ld.setUint16(26,n.length,true);l.set(n,30);
 const c=new Uint8Array(46+n.length),cd=new DataView(c.buffer);cd.setUint32(0,0x02014b50,true);cd.setUint16(4,20,true);cd.setUint16(6,20,true);cd.setUint32(16,crc,true);cd.setUint32(20,data.length,true);cd.setUint32(24,data.length,true);cd.setUint16(28,n.length,true);cd.setUint32(42,offset,true);c.set(n,46);local.push(l,data);central.push(c);offset+=l.length+data.length;cs+=c.length;}
 const e=new Uint8Array(22),ed=new DataView(e.buffer);ed.setUint32(0,0x06054b50,true);ed.setUint16(8,files.length,true);ed.setUint16(10,files.length,true);ed.setUint32(12,cs,true);ed.setUint32(16,offset,true);return new Blob([...local,...central,e],{type:'application/octet-stream'});
}
