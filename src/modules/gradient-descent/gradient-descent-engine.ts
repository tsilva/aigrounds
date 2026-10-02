export type DescentState={theta:number;velocity:number;step:number};
export type DescentPoint=DescentState&{loss:number;gradient:number;proposedUpdate:number;nextTheta:number;nextLoss:number;gradientTerm:number;momentumTerm:number;crossesMinimum:boolean};
export const minimumTheta=0,defaultStartTheta=2.4;
export function loss(theta:number){return .5*theta*theta;}
export function analyzeDescent(state:DescentState,learningRate:number,momentum:number):DescentPoint {
 if(!Number.isFinite(state.theta)||!Number.isFinite(state.velocity)||!Number.isInteger(state.step)||state.step<0||!Number.isFinite(learningRate)||learningRate<=0||!Number.isFinite(momentum)||momentum<0||momentum>=1)throw new Error("A finite state, positive rate and momentum from zero to below one are required.");
 const gradientTerm=-learningRate*state.theta,momentumTerm=momentum*state.velocity,proposedUpdate=gradientTerm+momentumTerm,nextTheta=state.theta+proposedUpdate;
 if(!Number.isFinite(nextTheta)||!Number.isFinite(loss(nextTheta)))throw new Error("The update exceeds finite numeric range.");
 return {...state,loss:loss(state.theta),gradient:state.theta,gradientTerm,momentumTerm,proposedUpdate,nextTheta,nextLoss:loss(nextTheta),crossesMinimum:state.theta*nextTheta<0};
}
export function stepDescent(state:DescentState,learningRate:number,momentum:number):DescentState {const a=analyzeDescent(state,learningRate,momentum);return {theta:a.nextTheta,velocity:a.proposedUpdate,step:state.step+1};}
export function simulateDescent(initialTheta:number,learningRate:number,momentum:number,steps:number){const states:DescentState[]=[{theta:initialTheta,velocity:0,step:0}];for(let i=0;i<steps;i++)states.push(stepDescent(states.at(-1)!,learningRate,momentum));return states.map(s=>({...s,loss:loss(s.theta),gradient:s.theta}));}
export function formatNumber(v:number,digits=4){return v===0?"0":Math.abs(v)<10**-digits||Math.abs(v)>=1e6?v.toExponential(3):Number(v.toFixed(digits)).toString();}
export function formatSigned(v:number,digits=4){return `${v>0?"+":""}${formatNumber(v,digits)}`;}
