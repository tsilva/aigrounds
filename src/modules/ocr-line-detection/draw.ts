import { inspectCell, type Cell, type Channel, type OcrRun, type View } from "./ocr-types";
export function drawDetector(canvas: HTMLCanvasElement, run: OcrRun, view: View, channel: Channel, point: Cell|null, selected: number|null) {
 canvas.width=run.input_shape[3];canvas.height=run.input_shape[2];const g=canvas.getContext('2d');if(!g)return;
 const w=canvas.width,h=canvas.height,source=view==='page'||view==='boxes',name=source?'source':view==='maps'?channel:view==='threshold'?'mask':view;
 g.fillStyle='#e8e8f7';g.fillRect(0,0,w,h);g.imageSmoothingEnabled=source;
 g.drawImage(run.images[name],0,0,source?run.original_shape[1]*run.input_scale:w,source?run.original_shape[0]*run.input_scale:h);
 if(view==='boxes')run.boxes.forEach((b,i)=>{const [x0,y0,x1,y1]=b.input_box;g.strokeStyle=selected===i?'#5031dc':'#168260';g.fillStyle=selected===i?'#5031dc22':'#16826010';g.lineWidth=selected===i?3:1.3;g.fillRect(x0,y0,x1-x0,y1-y0);g.strokeRect(x0,y0,x1-x0,y1-y0);g.font='10px monospace';g.fillStyle=g.strokeStyle;g.fillText(String(i+1),x0,Math.max(10,y0-2));});
 if(point){const c=inspectCell(run,point),x=2*point.x+1,y=c.inputY;g.strokeStyle='#d75c13';g.lineWidth=2;
  if(c.probability>run.threshold){g.setLineDash([5,4]);for(const edge of [c.topEdge,c.bottomEdge]){g.beginPath();g.moveTo(x-35,edge);g.lineTo(x+35,edge);g.stroke();}g.setLineDash([]);}
  g.beginPath();g.arc(x,y,6,0,Math.PI*2);g.moveTo(x-12,y);g.lineTo(x+12,y);g.moveTo(x,y-12);g.lineTo(x,y+12);g.stroke();
 }
}
export function drawNeighborhood(canvas: HTMLCanvasElement,run:OcrRun,point:Cell){const g=canvas.getContext('2d');if(!g)return;g.fillStyle='#171c34';g.fillRect(0,0,180,180);g.imageSmoothingEnabled=false;
 for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const x=point.x+dx,y=point.y+dy;if(x>=0&&y>=0&&x<run.output_shape[3]&&y<run.output_shape[2])g.drawImage(run.images.centres,x,y,1,1,(dx+4)*20,(dy+4)*20,20,20);}
 g.strokeStyle='#ffffff55';for(let i=0;i<=9;i++){g.beginPath();g.moveTo(i*20,0);g.lineTo(i*20,180);g.moveTo(0,i*20);g.lineTo(180,i*20);g.stroke();}g.lineWidth=2;g.strokeStyle='white';g.strokeRect(80,80,20,20);
}
