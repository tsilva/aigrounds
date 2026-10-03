const points = [[8.2,6.4],[20.6,5],[21.8,7.2],[15,15.6],[12.7,22.4]];
function distance(x:number,y:number,a:number[],b:number[]) {
  const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy,t=length===0?0:Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/length));
  return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
export const referenceSeven = new Float32Array(Array.from({length:784},(_,i)=>{
  let lit=0;for(let sx=0;sx<4;sx++)for(let sy=0;sy<4;sy++)if(points.slice(1).some((b,j)=>distance(i%28+(sx+.5)/4,Math.floor(i/28)+(sy+.5)/4,points[j],b)<=1.2))lit++;
  return lit/16;
}));
export const blankInput = new Float32Array(784);
export const defaultModelUrl = "https://huggingface.co/tsilva/mnist-mlp-classifier/resolve/main/model.onnx";
export function paintStroke(input:Float32Array,from:{x:number;y:number},to:{x:number;y:number},erase:boolean) {
  return input.map((value,i)=>{
    const d=distance(i%28+.5,Math.floor(i/28)+.5,[from.x,from.y],[to.x,to.y]);
    return d<=(erase?1.7:1.4)?(erase?0:1):value;
  });
}
