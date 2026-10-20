// Self-host locked package assets; browser inference never depends on a CDN.
import { mkdir, copyFile, cp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const root=process.cwd(),dest=join(root,'public/ocr-line-detection');
const ort=join(root,'node_modules/onnxruntime-web'),pdf=join(root,'node_modules/pdfjs-dist');
await mkdir(join(dest,'vendor'),{recursive:true});
for(const name of ['ort.wasm.min.js','ort-wasm-simd-threaded.mjs','ort-wasm-simd-threaded.wasm'])await copyFile(join(ort,'dist',name),join(dest,'vendor',name));
for(const name of ['pdf.mjs','pdf.worker.mjs'])await copyFile(join(pdf,'build',name),join(dest,'vendor',name));
for(const name of ['cmaps','standard_fonts'])await cp(join(pdf,name),join(dest,'vendor',name),{recursive:true});
await copyFile(join(pdf,'LICENSE'),join(dest,'vendor/PDFJS-LICENSE.txt'));
await cp(join(root,'src/modules/ocr-line-detection/runtime'),join(dest,'runtime'),{recursive:true});
await writeFile(join(dest,'vendor/versions.json'),JSON.stringify({onnxruntimeWeb:'1.23.2',pdfjs:'5.4.296'})+'\n');
console.log('Prepared self-hosted OCR browser runtime.');
