export type BiasScenario="low"|"high"|"zero";
export type BiasState={scenario:BiasScenario;degree:number;draw:number;probe:0.5|1.5};
export const biasScenarios=[{id:"low",label:"Low noise",shortLabel:"Independent ±0.5"},{id:"high",label:"High noise",shortLabel:"Independent ±1.5"},{id:"zero",label:"Noise-free",shortLabel:"Zero response noise"}];
export const biasX=[-2,-1,0,1,2];
export const biasTruth=(x:number)=>2+x+x*x;
export const polynomialValue=(c:number[],x:number)=>c.reduce((sum,v,i)=>sum+v*x**i,0);
function fitPolynomial(y:number[],degree:number){
 const n=degree+1,a=Array.from({length:n},(_,i)=>Array.from({length:n+1},(_,j)=>j===n?biasX.reduce((sum,x,k)=>sum+x**i*y[k],0):biasX.reduce((sum,x)=>sum+x**(i+j),0)));
 for(let k=0;k<n;k++){
  const row=a.reduce((best,r,i)=>i>=k&&Math.abs(r[k])>Math.abs(a[best][k])?i:best,k);[a[k],a[row]]=[a[row],a[k]];
  const pivot=a[k][k];if(Math.abs(pivot)<1e-12)throw new Error("Training positions must identify this polynomial");a[k]=a[k].map(v=>v/pivot);
  for(let i=0;i<n;i++)if(i!==k){const factor=a[i][k];a[i]=a[i].map((v,j)=>v-factor*a[k][j]);}
 }
 return a.map(r=>r[n]);
}
export function biasCohort(scenario:BiasScenario,degree:number){
 if(!["low","high","zero"].includes(scenario)||!Number.isInteger(degree)||degree<0||degree>4)throw new Error("Invalid noise or degree");
 const amplitude=scenario==="low"?0.5:scenario==="high"?1.5:0;
 const fits=Array.from({length:32},(_,mask)=>{const signs=biasX.map((_,i)=>(mask&(1<<i))?1:-1),ys=biasX.map((x,i)=>biasTruth(x)+amplitude*signs[i]),coefficients=fitPolynomial(ys,degree),trainMse=biasX.reduce((sum,x,i)=>sum+(ys[i]-polynomialValue(coefficients,x))**2,0)/5;return{draw:mask+1,signs,ys,coefficients,trainMse,curve:Array.from({length:81},(_,k)=>polynomialValue(coefficients,-2+k/20))};});
 const meanCoefficients=Array.from({length:degree+1},(_,i)=>fits.reduce((sum,f)=>sum+f.coefficients[i],0)/32);
 return{scenario,degree,amplitude,fits,meanCoefficients};
}
export function analyzeBias(s:BiasState){
 if(!Number.isInteger(s.draw)||s.draw<1||s.draw>32||![0.5,1.5].includes(s.probe))throw new Error("Invalid training draw or probe");
 const cohort=biasCohort(s.scenario,s.degree),truth=biasTruth(s.probe),predictions=cohort.fits.map(f=>polynomialValue(f.coefficients,s.probe)),mean=predictions.reduce((sum,p)=>sum+p,0)/32,bias=mean-truth,biasSquared=bias*bias,variance=predictions.reduce((sum,p)=>sum+(p-mean)**2,0)/32,noise=cohort.amplitude**2,error=predictions.reduce((sum,p)=>sum+[-1,1].reduce((v,sign)=>v+(truth+sign*cohort.amplitude-p)**2,0),0)/64;
 return{...s,...cohort,truth,mean,bias,biasSquared,variance,noise,error,predictions,selected:cohort.fits[s.draw-1],selectedPrediction:predictions[s.draw-1],meanCurve:Array.from({length:81},(_,k)=>polynomialValue(cohort.meanCoefficients,-2+k/20)),truthCurve:Array.from({length:81},(_,k)=>biasTruth(-2+k/20))};
}
export type BiasAnalysis=ReturnType<typeof analyzeBias>;
export function biasNumber(v:number,digits=6){const value=Math.abs(v)<1e-10?0:v,scale=10**digits;return (Math.sign(value)*Math.round((Math.abs(value)+1e-12)*scale)/scale).toFixed(digits).replace("-","−");}
export function biasChart(a:BiasAnalysis,width:number){
 if(!Number.isFinite(width)||width<200)throw new Error("Chart width must be at least200");
 const left=56,right=26,top=26,baseline=326,height=374,x=(v:number)=>left+(v+2)/4*(width-left-right),y=(v:number)=>baseline-(v+4)/16*(baseline-top),path=(values:number[])=>values.map((v,k)=>`${k===0?"M":"L"}${x(-2+k/20)},${y(v)}`).join(" "),cx=x(a.probe),selectedY=y(a.selectedPrediction),truthY=y(a.truth);
 return{width,height,left,right,top,baseline,paths:a.fits.map(f=>({draw:f.draw,path:path(f.curve)})),selected:path(a.selected.curve),mean:path(a.meanCurve),truth:path(a.truthCurve),probe:{x:cx,selectedY,truthY,square:`${cx-7},${selectedY-7} ${cx+7},${selectedY-7} ${cx+7},${selectedY+7} ${cx-7},${selectedY+7}`,diamond:`${cx},${truthY-5} ${cx+5},${truthY} ${cx},${truthY+5} ${cx-5},${truthY}`},points:biasX.map((v,i)=>({id:i+1,x:v,y:a.selected.ys[i],cx:x(v),cy:y(a.selected.ys[i])})),xTicks:biasX.map(value=>({value,x:x(value)})),yTicks:[-4,0,4,8,12].map(value=>({value,y:y(value)}))};
}
