import { graphEdges,graphNodes,formatProbability,proofTheory,type ProofState } from "./zero-knowledge-proofs-engine";
import styles from "./playground.module.css";
const fills={red:"#bb3044",blue:"#2863b8",green:"#167d59"};
export function ProofGraph({state}:{state:ProofState}) {
  const row=state.current?.opened,opened=row?{[row.edge.from]:row.openedColors[0],[row.edge.to]:row.openedColors[1]}:{};
  const label=row?`Opened ${row.edge.id}: ${row.openedColors.join(" and ")}; ${row.verdict}. Other six nodes hidden.`:state.current?"All eight nodes committed; no colors opened.":"No round committed; no colors opened.";
  return <div className={styles.graphScroll} tabIndex={0} role="region" aria-label="Proof graph scroll area"><svg viewBox="0 0 720 350" className={styles.graph} role="img" aria-label={label}>
    <title>{label}</title>
    <g aria-hidden="true">{graphEdges.map(e=>{const a=graphNodes.find(n=>n.id===e.from)!,b=graphNodes.find(n=>n.id===e.to)!;const selected=!!state.current&&e.id===(row?.edge.id??state.edge);return <line key={e.id} data-edge={e.id} x1={a.x*7.2} y1={a.y*3.4} x2={b.x*7.2} y2={b.y*3.4} stroke={selected?"#5031dc":"#a8b0c8"} strokeWidth={selected?3:1.5} strokeDasharray={selected&&!row?"6 4":undefined}/>;})}
    {graphNodes.map(n=>{const color=opened[n.id];return <g key={n.id} data-node={n.id} transform={`translate(${n.x*7.2},${n.y*3.4})`}><rect x={-37} y={-18} width={74} height={36} rx={4} fill={color?fills[color]:"#f0f2f8"} stroke={color?fills[color]:"#a8b0c8"}/><text textAnchor="middle" y={-27}>{n.id}</text><text textAnchor="middle" y={4} fill={color?"#ffffff":"#536487"}>{color??(state.current?"Hidden":"Uncommitted")}</text></g>;})}</g>
  </svg></div>;
}
export function EscapeFigure({rounds}:{rounds:number}) {
  const theory=proofTheory(rounds),x=(k:number)=>45+k/20*270,y=(p:number)=>15+(1-p)*150;
  return <figure className={styles.chart}><figcaption>Fixed cheater’s all-pass probability<span data-probability>{formatProbability(theory.escapeProbability)} = (7/9)^{rounds}</span></figcaption><div className={styles.chartScroll}><svg viewBox="0 0 330 205" role="img" aria-label={`Integer random rounds 0 through 20. All-pass probability at k=${rounds} is ${formatProbability(theory.escapeProbability)}, not zero.`}>
    {[0,.25,.5,.75,1].map(t=><g key={t} aria-hidden="true"><line x1={45} x2={315} y1={y(t)} y2={y(t)} stroke="#dfe4f4"/><text x={37} y={y(t)+4} textAnchor="end">{t}</text></g>)}
    {[0,5,10,15,20].map(t=><text key={t} x={x(t)} y={184} textAnchor="middle" aria-hidden="true">{t}</text>)}
    <polyline data-escape-curve points={theory.chartPoints.map(p=>`${x(p.rounds).toFixed(5)},${y(p.probability).toFixed(5)}`).join(" ")} fill="none" stroke="#5031dc" strokeWidth={2} aria-hidden="true"/>
    {theory.chartPoints.map(p=><circle key={p.rounds} data-probability-round={p.rounds} cx={x(p.rounds)} cy={y(p.probability)} r={2.5} fill="#5031dc" aria-hidden="true"/>)}
    <circle data-current-probability cx={x(rounds)} cy={y(theory.escapeProbability)} r={5} fill="#5031dc" stroke="white" strokeWidth={1.5} aria-hidden="true"/><text x={180} y={202} textAnchor="middle" aria-hidden="true">Independent random rounds k</text>
  </svg></div><p>Points are integer round counts; segments connect them for reading. At k=0, no checks means all-pass probability 1. Exact values are in the optional table.</p></figure>;
}
