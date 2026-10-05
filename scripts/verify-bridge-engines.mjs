import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import ts from "typescript";

// Load the pure TypeScript engines without adding a runtime dependency.
function engine(slug, name) {
  const filename = resolve(`src/modules/${slug}/${name}-engine.ts`);
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, { exports }, { filename });
  return exports;
}
let checks = 0;
function equal(actual, expected, label) {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected), label);
  checks++;
}
function near(actual, expected, label, tolerance = 1e-9) {
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance, `${label}: ${actual} ≠ ${expected}`);
  checks++;
}
function vector(actual, expected, label, tolerance) {
  equal(actual.length, expected.length, `${label} dimensions`);
  expected.forEach((value, i) => near(actual[i], value, `${label}[${i}]`, tolerance));
}

// Training: numerical derivatives of independently evaluated BCE, not a second
// implementation of the analytic backward pass. Fixtures avoid ReLU's kink.
const train = engine("neural-network-training-loop", "training");
function referenceLoss(p, { x, y }) {
  const h1 = Math.max(0, p[0] * x[0] + p[1] * x[1] + p[4]);
  const h2 = Math.max(0, p[2] * x[0] + p[3] * x[1] + p[5]);
  const probability = 1 / (1 + Math.exp(-(p[6] * h1 + p[7] * h2 + p[8])));
  return -(y * Math.log(probability) + (1 - y) * Math.log(1 - probability));
}
for (const scenario of ["standard", "shifted"]) {
  const { train: rows, validation } = train.trainingData(scenario);
  equal(rows.some(row => validation.some(held => JSON.stringify(held.x) === JSON.stringify(row.x))), false, "distinct held-out inputs");
  const p = Array.from(train.initialParameters);
  const numeric = rows.map(row => p.map((_, i) => {
    const plus = p.slice(), minus = p.slice(), delta = 1e-5;
    plus[i] += delta; minus[i] -= delta;
    return (referenceLoss(plus, row) - referenceLoss(minus, row)) / (2 * delta);
  }));
  rows.forEach((row, i) => {
    const observed = train.forwardTraining(p, row);
    near(observed.loss, referenceLoss(p, row), "stable BCE equals direct BCE");
    vector(observed.gradient, numeric[i], "finite-difference row gradient", 2e-8);
  });
  for (const size of [2, 4]) {
    const expectedMean = p.map((_, i) => numeric.slice(0, size).reduce((sum, g) => sum + g[i], 0) / size);
    const initial = train.createTraining(scenario, size, .1);
    const frozen = JSON.stringify(initial);
    let stepped = initial;
    for (let stage = 0; stage < 3; stage++) {
      stepped = train.stepTraining(stepped);
      vector(stepped.parameters, p, "Forward/Loss/Backward keep parameters");
    }
    stepped = train.stepTraining(stepped);
    vector(stepped.parameters, p.map((v, i) => v - .1 * expectedMean[i]), "mean-gradient update", 2e-9);
    equal(JSON.stringify(initial), frozen, "training input immutable");
    const epoch = train.runTrainingEpoch(initial);
    equal([epoch.epoch, epoch.updates], [1, 4 / size], "epoch counts");
    near(epoch.history.at(-1).validation, validation.reduce((sum, row) => sum + referenceLoss(epoch.parameters, row), 0) / validation.length, "held-out history independently recomputed");
    const zero = train.runTrainingEpoch(train.createTraining(scenario, size, 0));
    vector(zero.parameters, p, "zero rate leaves parameters");
  }
}
let partial = train.stepTraining(train.createTraining());
partial = train.runTrainingEpoch(partial);
equal([partial.epoch, partial.updates], [1, 2], "epoch finishes pending stages");
let capped = train.createTraining();
for (let i = 0; i < 51; i++) capped = train.runTrainingEpoch(capped);
equal([capped.updates, capped.history.length], [100, 100], "bounded actual history");
equal(train.stepTraining(capped), capped, "cap is inert");
vector(train.forwardTraining(Array(9).fill(0), { id: "zero", x: [1, 1], y: 1 }).gradient.slice(0, 8), Array(8).fill(0), "ReLU derivative at zero");
near(train.forwardTraining([0,0,0,0,0,0,0,0,1000], {id:"extreme",x:[0,0],y:0}).loss, 1000, "extreme stable loss");

// Classification: score decisions and a geometric oracle. Clipped endpoints
// must lie on the policy's equation and remain inside the displayed square.
const boundary = engine("linear-classification-boundaries", "boundary");
for (const w1 of [-3, -1, 0, .1, 2, 3]) for (const w2 of [-3, 0, .1, 3])
for (const bias of [-3, 0, 3]) for (const cutoff of [0, .01, .5, .75, .99, 1]) {
  const state = { w1, w2, bias, cutoff };
  for (const { x, y } of boundary.boundaryPoints) {
    const score = w1 * x + w2 * y + bias;
    const probability = 1 / (1 + Math.exp(-score));
    const observed = boundary.boundaryPrediction(state, x, y);
    near(observed.score, score, "classifier score");
    near(observed.probability, probability, "classifier sigmoid");
    equal(observed.decision, Number(probability >= cutoff), "inclusive decision cutoff");
  }
  const line = boundary.decisionBoundary(state);
  if (cutoff === 0 || cutoff === 1) equal(line.kind, "endpoint", "finite sigmoid endpoint policy");
  else if (w1 === 0 && w2 === 0) equal(line.kind, bias === Math.log(cutoff / (1 - cutoff)) ? "everywhere" : "constant", "constant-score geometry");
  else {
    const rhs = Math.log(cutoff / (1 - cutoff)) - bias;
    for (const p of line.points) {
      near(w1 * p.x + w2 * p.y, rhs, "clipped boundary equation");
      assert.ok(Math.abs(p.x) <= 3 + 1e-9 && Math.abs(p.y) <= 3 + 1e-9);
      checks++;
    }
    const extent = 3 * (Math.abs(w1) + Math.abs(w2));
    if (Math.abs(rhs) < extent - 1e-9) equal(line.kind, "line", "line intersects square interior");
    if (Math.abs(rhs) > extent + 1e-9) equal(line.kind, "outside", "line outside square");
  }
}
equal(boundary.decisionBoundary(boundary.boundaryPreset("vertical")).points, [{x:.5,y:-3},{x:.5,y:3}], "vertical boundary");

// Decoding: independent temperature power normalization and filter selection.
const decode = engine("autoregressive-generation-decoding", "decoding");
const banks = new Map([
  ["The cat", [["sat",.5],["slept",.3],["ran",.2]]],
  ["The dog", [["barked",.6],["slept",.4]]],
  ["The cat sat", [["on",.6],["near",.3],["EOS",.1]]],
  ["The cat slept", [["EOS",.7],["soundly",.3]]],
  ["The cat ran", [["away",.8],["EOS",.2]]],
  ["The dog barked", [["loudly",.5],["EOS",.5]]],
  ["The cat sat on", [["the",1]]], ["The cat sat near", [["the",1]]],
  ["The cat sat on the", [["mat",1]]], ["The cat sat on the mat", [["EOS",1]]],
  ["The cat slept soundly", [["EOS",1]]], ["The cat ran away", [["EOS",1]]],
]);
for (const [prefix, bank] of banks) for (const temperature of [.1, .5, 1, 2])
for (const filter of ["all", "top-k", "top-p"]) for (const k of [1, 2, 3]) for (const p of [.1, .5, .8, 1]) {
  const state = {...decode.createDecoding(), prompt:prefix, temperature, filter, k, p};
  const total = bank.reduce((sum, [, weight]) => sum + weight ** (1 / temperature), 0);
  const expected = bank.map(([token, weight]) => ({ token, base:weight ** (1 / temperature) / total })).sort((a,b)=>b.base-a.base);
  let count = expected.length;
  if (filter === "top-k") count = Math.min(k, count);
  if (filter === "top-p") { count=1; let mass=expected[0].base; while (mass < p - 1e-12 && count < expected.length) mass += expected[count++].base; }
  const keptMass = expected.slice(0,count).reduce((sum,row)=>sum+row.base,0);
  const observed = decode.decodingCandidates(state);
  observed.forEach((row,i)=> {
    equal(row.token, expected[i].token, "stable ranked candidates");
    near(row.base, expected[i].base, "temperature normalization");
    equal(row.keep, i < count, "filter retains minimum prefix");
    near(row.probability, i < count ? expected[i].base / keptMass : 0, "filtered normalization");
  });
  near(observed.reduce((sum,row)=>sum+row.probability,0),1,"probability conserved");
  for (const draw of [0, .5, .65, .8, .999999]) {
    let mass=0, selected=expected[count-1].token;
    for (const row of expected.slice(0,count)) { mass+=row.base/keptMass; if(draw < mass){selected=row.token;break;} }
    equal(decode.selectedToken({...state,draw}),selected,"half-open sample intervals");
    equal(decode.selectedToken({...state,draw,mode:"greedy"}),expected[0].token,"greedy ignores draw");
  }
}
const beginning = decode.createDecoding(), before = JSON.stringify(beginning), appended=decode.appendToken(beginning);
equal(appended.generated,["slept"],"sampling fixture");
equal(decode.decodingPrefix(appended),"The cat slept","feedback prefix");
equal(decode.decodingCandidates(appended).map(r=>r.token),["EOS","soundly"],"next distribution changed");
equal(JSON.stringify(beginning),before,"decoding input immutable");
equal(decode.appendToken(beginning), appended, "replay deterministic");
equal(decode.decodingStop(decode.appendToken({...decode.createDecoding("dog"),draw:.8,limit:1})),"Token limit","length stops before EOS");
const eos={...appended,generated:["slept","EOS"],limit:2};
equal(decode.decodingStop(eos),"EOS","EOS takes precedence");
equal(decode.appendToken(eos),eos,"stopping is inert");

// Transformer: independent scalar-loop reference with the disclosed matrices.
// Verify causality and branch ablations, not just the default picture.
const block=engine("transformer-block-residual-stream","block");
const norm=x=>{const denominator=Math.sqrt((x[0]*x[0]+x[1]*x[1])/2+1e-6);return x.map(v=>v/denominator);};
for(const scenario of ["base","future","shifted"]) for(const attentionScale of [0,.5,1,2]) for(const mlpScale of [0,.5,1,2]) {
  const inputs=scenario==="shifted"?[[-1,2],[1,-1]]:[[1,2],scenario==="future"?[4,-1]:[-1,1]];
  const state={...block.blockPreset(scenario),attentionScale,mlpScale}, result=block.traceBlock(state), frozen=JSON.stringify(state);
  const n=inputs.map(norm), scale=Math.sqrt(2.500001);
  for(let token=0;token<2;token++) {
    const score=[];for(let key=0;key<=token;key++)score.push((n[token][0]*n[key][0]+n[token][1]*n[key][1])/Math.sqrt(2));
    const denominator=score.reduce((sum,v)=>sum+Math.exp(v),0), weights=score.map(v=>Math.exp(v)/denominator);
    const attention=[0,0];for(let key=0;key<=token;key++){attention[0]+=weights[key]*n[key][0]*.2*scale;attention[1]+=weights[key]*n[key][1]*-.05*scale;}
    const h=inputs[token].map((v,i)=>v+attentionScale*attention[i]), n2=norm(h), relu=n2.map(v=>Math.max(0,v));
    const mlp=[.2*relu[0]+.1*relu[1],-.1*relu[0]+.3*relu[1]];
    vector(result[token].weights,[...weights,...Array(1-token).fill(0)],"causal attention weights");
    vector(result[token].attention,attention,"weighted value mixture");
    vector(result[token].h,h,"first residual sum");
    vector(result[token].norm2,n2,"second RMS normalization");
    vector(result[token].output,h.map((v,i)=>v+mlpScale*mlp[i]),"second residual sum");
    if(attentionScale===0)vector(result[token].h,inputs[token],"attention ablation bypass");
    if(mlpScale===0)vector(result[token].output,result[token].h,"MLP ablation bypass");
  }
  equal(JSON.stringify(state),frozen,"block input immutable");
}
vector(block.rmsVector([0,0]),[0,0],"zero vector RMS safe");
vector(block.traceBlock(block.blockPreset())[0].attention,[.2,-.1],"approved first branch arithmetic");
vector(block.traceBlock(block.blockPreset("future"))[0].output,block.traceBlock(block.blockPreset())[0].output,"future cannot affect first token");

// RAG: exhaust all 450 UI states; independent fact/citation and task ledgers.
const rag=engine("rag-pipeline","pipeline");
const facts={D1:["hours:10","day:Tuesday"],D2:["hours:9","day:Tuesday"],D3:["admission:4","admission:charge"],D4:["closure:Sunday","closure:weekly"]};
const references={hours:"hours:10",admission:"admission:4",closure:"closure:Sunday"};
for(const query of ["hours","admission","closure"])for(const order of ["relevant","outdated"])for(let retrieval=0;retrieval<=4;retrieval++)for(let context=0;context<=4;context++)for(const answer of ["evidence","wrong","incomplete"]){
  const state={query,order,retrieval,context,answer}, frozen=JSON.stringify(state), a=rag.analyzePipeline(state);
  equal(a.retrieved.length,retrieval,"retrieval count");
  equal(a.context.length,Math.min(retrieval,context),"context cannot add unretrieved rows");
  equal(a.context.map(d=>d.id),a.retrieved.slice(0,context).map(d=>d.id),"context comes from retrieved prefix");
  const supported=a.fact!==null&&a.context.some(d=>d.id===a.citation&&facts[d.id].includes(a.fact));
  equal(a.supported,supported,"supplied-source fact support");
  equal(a.correct,a.fact===references[query],"independent full task reference");
  equal(a.complete,a.fact!==null&&a.fact.startsWith(query+":")&&!a.fact.endsWith(":charge")&&!a.fact.endsWith(":weekly"),"requested value supplied");
  equal(a.abstained,a.citation===null,"no relevant context abstains");
  equal(JSON.stringify(state),frozen,"pipeline input immutable");
}
const outdated=rag.analyzePipeline(rag.pipelinePreset("outdated")), wrong=rag.analyzePipeline(rag.pipelinePreset("wrong"));
equal([outdated.fact,outdated.supported,outdated.correct,outdated.complete],["hours:9",true,false,true],"supported outdated counterexample");
equal([wrong.fact,wrong.supported,wrong.correct,wrong.complete],["hours:11",false,false,true],"citation is not support");
const incomplete=rag.analyzePipeline({query:"admission",order:"relevant",retrieval:1,context:1,answer:"incomplete"});
equal([incomplete.supported,incomplete.correct,incomplete.complete],[true,false,false],"faithful incomplete transfer");
console.log(`Bridge engines: ${checks} independent numeric, geometry, state and invariant checks passed.`);
