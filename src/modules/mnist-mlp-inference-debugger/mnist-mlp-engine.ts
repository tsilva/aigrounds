export type DenseActivation = "linear" | "relu" | "sigmoid" | "tanh";
export type MnistPreprocessingMode = "mnist-standard" | "raw";

export type DenseLayer = {
  id: string;
  inputSize: number;
  outputSize: number;
  weights: Float32Array;
  bias: Float32Array;
  activation: DenseActivation;
};

export type MlpModel = {
  fileName: string;
  inputSize: number;
  outputSize: number;
  inputShape: number[];
  layers: DenseLayer[];
  outputTransform: "logits" | "softmax" | "log-softmax";
  foldedBatchNorm: boolean;
};

export type ForwardDebug = {
  logits: Float32Array;
  probabilities: Float32Array;
  preActivations: Float32Array[];
  activations: Float32Array[];
  predictedClass: number;
  confidence: number;
};

type AttributeValue = {
  name: string;
  int?: number;
  float?: number;
};

type NodeProto = {
  name: string;
  opType: string;
  domain: string;
  inputs: string[];
  outputs: string[];
  attributes: AttributeValue[];
};

type TensorProto = {
  name: string;
  dims: number[];
  dataType: number;
  floats: Float32Array;
  integers: number[];
};

type ValueInfo = {
  name: string;
  dims: number[];
  dataType: number;
};

const tensorDataFloat = 1;

class ProtoReader {
  private readonly view: DataView;
  private offset = 0;

  constructor(private readonly bytes: Uint8Array) {
    this.view = new DataView(
      bytes.buffer,
      bytes.byteOffset,
      bytes.byteLength,
    );
  }

  get done() {
    return this.offset >= this.bytes.length;
  }

  readKey() {
    const key = this.readVarint();
    if (key > 0xffffffff || (key >>> 3) === 0 || ![0,1,2,5].includes(key&7)) throw new Error("Invalid protobuf field key.");
    return {
      field: key >>> 3,
      wire: key & 7,
    };
  }

  readVarint() {
    const value = this.readUnsignedVarint();
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("Oversized protobuf integer.");
    return Number(value);
  }

  readUnsignedVarint() {
    let value = BigInt(0);
    for (let shift = BigInt(0); shift < BigInt(70) && !this.done; shift += BigInt(7)) {
      const byte = this.bytes[this.offset++];
      if (shift === BigInt(63) && byte > 1) throw new Error("Oversized protobuf varint.");
      value |= BigInt(byte & 0x7f) << shift;
      if ((byte & 0x80) === 0) {
        return value;
      }
    }
    throw new Error("Invalid or truncated protobuf varint.");
  }

  readSignedVarint() {
    const value = BigInt.asIntN(64,this.readUnsignedVarint());
    if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) throw new Error("Oversized signed protobuf integer.");
    return Number(value);
  }

  requireBytes(length: number) {
    if (!Number.isSafeInteger(length) || length < 0 || this.offset + length > this.bytes.length) throw new Error("Truncated ONNX data.");
  }

  readFixed32() {
    this.requireBytes(4);
    const value = this.view.getFloat32(this.offset, true);
    this.offset += 4;
    return value;
  }

  readBytes() {
    const length = this.readVarint();
    this.requireBytes(length);
    const start = this.offset;
    this.offset += length;
    return this.bytes.subarray(start, start + length);
  }

  skip(wire: number) {
    if (wire === 0) {
      this.readVarint();
      return;
    }

    if (wire === 1) {
      this.requireBytes(8);
      this.offset += 8;
      return;
    }

    if (wire === 2) {
      const length = this.readVarint();
      this.requireBytes(length);
      this.offset += length;
      return;
    }

    if (wire === 5) {
      this.requireBytes(4);
      this.offset += 4;
      return;
    }

    throw new Error(`Unsupported protobuf wire type ${wire} at byte ${this.offset}.`);
  }
}

function decodeText(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes);
}

function readPackedVarints(bytes: Uint8Array) {
  const reader = new ProtoReader(bytes);
  const values: number[] = [];

  while (!reader.done) {
    values.push(reader.readVarint());
  }

  return values;
}

function readPackedFloats(bytes: Uint8Array) {
  if (bytes.byteLength % 4) throw new Error("Truncated float32 tensor.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const values = new Float32Array(bytes.byteLength / 4);

  for (let index = 0; index < values.length; index += 1) {
    values[index] = view.getFloat32(index * 4, true);
  }

  return values;
}

function parseAttribute(bytes: Uint8Array): AttributeValue {
  const reader = new ProtoReader(bytes);
  const attribute: AttributeValue = {
    name: "",
  };

  while (!reader.done) {
    const { field, wire } = reader.readKey();

    if (field === 1 && wire === 2) {
      attribute.name = decodeText(reader.readBytes());
    } else if (field === 2 && wire === 5) {
      attribute.float = reader.readFixed32();
    } else if (field === 3 && wire === 0) {
      attribute.int = reader.readSignedVarint();
    } else {
      reader.skip(wire);
    }
  }

  return attribute;
}

function parseNode(bytes: Uint8Array): NodeProto {
  const reader = new ProtoReader(bytes);
  const node: NodeProto = {
    name: "",
    opType: "",
    domain: "",
    inputs: [],
    outputs: [],
    attributes: [],
  };

  while (!reader.done) {
    const { field, wire } = reader.readKey();

    if (field === 1 && wire === 2) {
      node.inputs.push(decodeText(reader.readBytes()));
    } else if (field === 2 && wire === 2) {
      node.outputs.push(decodeText(reader.readBytes()));
    } else if (field === 3 && wire === 2) {
      node.name = decodeText(reader.readBytes());
    } else if (field === 4 && wire === 2) {
      node.opType = decodeText(reader.readBytes());
    } else if (field === 5 && wire === 2) {
      node.attributes.push(parseAttribute(reader.readBytes()));
    } else if (field === 7 && wire === 2) {
      node.domain = decodeText(reader.readBytes());
    } else {
      reader.skip(wire);
    }
  }

  return node;
}

function parseTensor(bytes: Uint8Array): TensorProto {
  const reader = new ProtoReader(bytes);
  let name = "";
  const dims: number[] = [];
  let dataType = 0;
  const floatChunks: number[] = [];
  const integers: number[] = [];
  let rawData: Uint8Array | undefined;

  while (!reader.done) {
    const { field, wire } = reader.readKey();

    if (field === 1 && wire === 0) {
      dims.push(reader.readVarint());
    } else if (field === 1 && wire === 2) {
      dims.push(...readPackedVarints(reader.readBytes()));
    } else if (field === 2 && wire === 0) {
      dataType = reader.readVarint();
    } else if (field === 4 && wire === 5) {
      floatChunks.push(reader.readFixed32());
    } else if (field === 4 && wire === 2) {
      floatChunks.push(...readPackedFloats(reader.readBytes()));
    } else if ((field === 5 || field === 7) && wire === 0) {
      integers.push(reader.readSignedVarint());
    } else if ((field === 5 || field === 7) && wire === 2) {
      const packed = new ProtoReader(reader.readBytes());
      while (!packed.done) integers.push(packed.readSignedVarint());
    } else if (field === 8 && wire === 2) {
      name = decodeText(reader.readBytes());
    } else if (field === 9 && wire === 2) {
      rawData = reader.readBytes();
    } else {
      reader.skip(wire);
    }
  }

  let floats = new Float32Array(floatChunks);

  if (rawData && dataType === tensorDataFloat) {
    floats = readPackedFloats(rawData);
  }
  if (rawData && dataType === 7) {
    if (rawData.byteLength % 8) throw new Error("Truncated int64 tensor.");
    const view = new DataView(rawData.buffer,rawData.byteOffset,rawData.byteLength);
    for (let i=0;i<rawData.byteLength;i+=8) {
      const value=view.getBigInt64(i,true);
      if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) throw new Error("Unsupported int64 tensor value.");
      integers.push(Number(value));
    }
  }
  if (rawData && dataType === 9) integers.push(...rawData);

  return {
    name,
    dims,
    dataType,
    floats,
    integers,
  };
}

function parseTensorShape(bytes: Uint8Array) {
  const reader = new ProtoReader(bytes);
  const dims: number[] = [];

  while (!reader.done) {
    const { field, wire } = reader.readKey();

    if (field === 1 && wire === 2) {
      const dimReader = new ProtoReader(reader.readBytes());
      let dimValue = 0;

      while (!dimReader.done) {
        const dimKey = dimReader.readKey();

        if (dimKey.field === 1 && dimKey.wire === 0) {
          dimValue = dimReader.readVarint();
        } else {
          dimReader.skip(dimKey.wire);
        }
      }

      dims.push(dimValue);
    } else {
      reader.skip(wire);
    }
  }

  return dims;
}

function parseValueType(bytes: Uint8Array) {
  const reader = new ProtoReader(bytes);
  let dims: number[] = [];
  let dataType = 0;

  while (!reader.done) {
    const { field, wire } = reader.readKey();

    if (field === 1 && wire === 2) {
      const tensorReader = new ProtoReader(reader.readBytes());

      while (!tensorReader.done) {
        const tensorKey = tensorReader.readKey();

        if (tensorKey.field === 1 && tensorKey.wire === 0) {
          dataType = tensorReader.readVarint();
        } else if (tensorKey.field === 2 && tensorKey.wire === 2) {
          dims = parseTensorShape(tensorReader.readBytes());
        } else {
          tensorReader.skip(tensorKey.wire);
        }
      }
    } else {
      reader.skip(wire);
    }
  }

  return {dims,dataType};
}

function parseValueInfo(bytes: Uint8Array): ValueInfo {
  const reader = new ProtoReader(bytes);
  const valueInfo: ValueInfo = {
    name: "",
    dims: [],
    dataType: 0,
  };

  while (!reader.done) {
    const { field, wire } = reader.readKey();

    if (field === 1 && wire === 2) {
      valueInfo.name = decodeText(reader.readBytes());
    } else if (field === 2 && wire === 2) {
      Object.assign(valueInfo,parseValueType(reader.readBytes()));
    } else {
      reader.skip(wire);
    }
  }

  return valueInfo;
}

function parseGraph(bytes: Uint8Array) {
  const reader = new ProtoReader(bytes);
  const nodes: NodeProto[] = [];
  const initializers = new Map<string, TensorProto>();
  const inputs: ValueInfo[] = [];
  const outputs: ValueInfo[] = [];

  while (!reader.done) {
    const { field, wire } = reader.readKey();

    if (field === 1 && wire === 2) {
      nodes.push(parseNode(reader.readBytes()));
    } else if (field === 5 && wire === 2) {
      const tensor = parseTensor(reader.readBytes());
      initializers.set(tensor.name, tensor);
    } else if (field === 11 && wire === 2) {
      inputs.push(parseValueInfo(reader.readBytes()));
    } else if (field === 12 && wire === 2) {
      outputs.push(parseValueInfo(reader.readBytes()));
    } else {
      reader.skip(wire);
    }
  }

  return {
    nodes,
    initializers,
    inputs,
    outputs,
  };
}

function getAttribute(
  node: NodeProto,
  name: string,
  fallback: number,
): number {
  const attribute = node.attributes.find((item) => item.name === name);
  return attribute?.int ?? attribute?.float ?? fallback;
}

function product(values: number[]) {
  return values.reduce((total, value) => total * value, 1);
}

function createDenseLayer({
  id,
  inputSize,
  outputName,
  weightTensor,
  biasTensor,
  transB,
}: {
  id: string;
  inputSize: number;
  outputName: string;
  weightTensor: TensorProto;
  biasTensor?: TensorProto;
  transB: boolean;
}): DenseLayer & { outputName: string } {
  if (weightTensor.dataType !== tensorDataFloat) {
    throw new Error(`Weight tensor ${weightTensor.name} is not float32.`);
  }

  if (weightTensor.dims.length !== 2) {
    throw new Error(`Weight tensor ${weightTensor.name} is not a matrix.`);
  }

  const [rows, columns] = weightTensor.dims;
  if (![rows,columns].every(x=>Number.isSafeInteger(x)&&x>0) || rows*columns !== weightTensor.floats.length || weightTensor.floats.some(x=>!Number.isFinite(x))) throw new Error(`Weight tensor ${weightTensor.name} has invalid shape or data.`);
  const outputSize = transB ? rows : columns;
  const expectedInputSize = transB ? columns : rows;

  if (expectedInputSize !== inputSize) {
    throw new Error(
      `Dense layer ${id} expects ${expectedInputSize} inputs, but previous tensor has ${inputSize}.`,
    );
  }

  const weights = new Float32Array(inputSize * outputSize);

  for (let inputIndex = 0; inputIndex < inputSize; inputIndex += 1) {
    for (let outputIndex = 0; outputIndex < outputSize; outputIndex += 1) {
      weights[inputIndex * outputSize + outputIndex] = transB
        ? weightTensor.floats[outputIndex * columns + inputIndex]
        : weightTensor.floats[inputIndex * columns + outputIndex];
    }
  }

  let bias = new Float32Array(outputSize);

  if (biasTensor) {
    if (!validBias(biasTensor, outputSize)) {
      throw new Error(`Bias tensor ${biasTensor.name} does not match ${id}.`);
    }
    bias = biasTensor.floats.length === 1 ? new Float32Array(outputSize).fill(biasTensor.floats[0]) : new Float32Array(biasTensor.floats);
  }

  return {
    id,
    inputSize,
    outputSize,
    weights,
    bias,
    activation: "linear",
    outputName,
  };
}

function getInitializer(
  graph: ReturnType<typeof parseGraph>,
  name: string | undefined,
  nodeLabel: string,
) {
  const tensor = name ? graph.initializers.get(name) : undefined;

  if (!tensor) {
    throw new Error(`${nodeLabel} requires constant BatchNorm parameters.`);
  }

  return tensor;
}

function foldBatchNormalizationIntoDense({
  layer,
  scaleTensor,
  biasTensor,
  meanTensor,
  varianceTensor,
  epsilon,
}: {
  layer: DenseLayer & { outputName: string };
  scaleTensor: TensorProto;
  biasTensor: TensorProto;
  meanTensor: TensorProto;
  varianceTensor: TensorProto;
  epsilon: number;
}) {
  if (!Number.isFinite(epsilon) || epsilon <= 0 || varianceTensor.floats.some(x => x < 0)) throw new Error("BatchNorm requires positive epsilon and nonnegative finite variance.");
  const tensors = [scaleTensor, biasTensor, meanTensor, varianceTensor];

  tensors.forEach((tensor) => {
    if (tensor.dataType !== tensorDataFloat) {
      throw new Error(`BatchNorm tensor ${tensor.name} is not float32.`);
    }

    if (tensor.floats.length !== layer.outputSize || tensor.dims.length !== 1 || tensor.dims[0] !== layer.outputSize || tensor.floats.some(x => !Number.isFinite(x))) {
      throw new Error(
        `BatchNorm tensor ${tensor.name} has ${tensor.floats.length} values, but ${layer.id} has ${layer.outputSize} outputs.`,
      );
    }
  });

  for (let outputIndex = 0; outputIndex < layer.outputSize; outputIndex += 1) {
    const scale = scaleTensor.floats[outputIndex] ?? 1;
    const offset = biasTensor.floats[outputIndex] ?? 0;
    const mean = meanTensor.floats[outputIndex] ?? 0;
    const variance = varianceTensor.floats[outputIndex] ?? 1;
    const factor = scale / Math.sqrt(variance + epsilon);

    for (let inputIndex = 0; inputIndex < layer.inputSize; inputIndex += 1) {
      const weightIndex = inputIndex * layer.outputSize + outputIndex;
      layer.weights[weightIndex] *= factor;
    }

    layer.bias[outputIndex] = (layer.bias[outputIndex] - mean) * factor + offset;
  }
}

export function parseOnnxMlpModel(buffer: ArrayBuffer, fileName: string): MlpModel {
  const reader = new ProtoReader(new Uint8Array(buffer));
  let graph: ReturnType<typeof parseGraph> | undefined;
  let opset = 0;
  while (!reader.done) {
    const {field,wire}=reader.readKey();
    if (field===7&&wire===2) graph=parseGraph(reader.readBytes());
    else if (field===8&&wire===2) {
      const opReader=new ProtoReader(reader.readBytes());let domain="",version=0;
      while (!opReader.done) {const key=opReader.readKey();if(key.field===1&&key.wire===2)domain=decodeText(opReader.readBytes());else if(key.field===2&&key.wire===0)version=opReader.readVarint();else opReader.skip(key.wire);}
      if (!domain || domain==="ai.onnx") opset=version;
    } else reader.skip(wire);
  }
  if (!graph) throw new Error("No ONNX graph was found.");
  if (opset<13 || opset>21) throw new Error("This debugger supports ONNX opsets 13–21 for its sequential float32 MLP subset.");
  const modelInputs=graph.inputs.filter(i=>!graph.initializers.has(i.name));
  if (modelInputs.length!==1 || graph.outputs.length!==1) throw new Error("Upload a single-input, single-output sequential MNIST MLP.");
  const modelInput=modelInputs[0];
  const inputShape=modelInput.dims.map((d,i)=>d===0&&i===0?1:d);
  if (modelInput.dataType!==1 || inputShape.length<2 || inputShape[0]!==1 || inputShape.some(d=>!Number.isSafeInteger(d)||d<=0) || product(inputShape)!==784) throw new Error("The input must be float32 with a singleton batch and 784 image values. Only the batch dimension may be symbolic.");
  const outputShape=graph.outputs[0].dims.map((d,i)=>d===0&&i===0?1:d);
  if (graph.outputs[0].dataType!==1 || outputShape.length!==2 || outputShape[0]!==1 || outputShape[1]!==10) throw new Error("The output must be one float32 vector of ten digit scores.");
  const layers: Array<DenseLayer & {outputName:string}> = [];
  let currentName=modelInput.name, currentShape=inputShape, currentSize=784;
  let outputTransform: MlpModel["outputTransform"]="logits", foldedBatchNorm=false;
  function requireCurrent(node:NodeProto,index=0) {
    if (node.inputs[index]!==currentName) throw new Error(`Node ${node.name||node.opType} is not on the supported single sequential path.`);
    if (outputTransform!=="logits") throw new Error("Softmax or LogSoftmax must be the final operation.");
  }
  for (const node of graph.nodes) {
    if (node.domain && node.domain!=="ai.onnx") throw new Error(`Unsupported ONNX domain ${node.domain}.`);
    if (!node.outputs[0]) throw new Error("Every supported node requires an output.");
    const op=node.opType, last=layers.at(-1);
    if (["Identity","Flatten","Reshape","Cast","Dropout"].includes(op)) {
      requireCurrent(node);
      if (op==="Flatten") {
        if (getAttribute(node,"axis",1)!==1) throw new Error("Only batch-preserving Flatten axis=1 is supported.");
        currentShape=[1,currentSize];
      }
      if (op==="Reshape") {
        const shape=graph.initializers.get(node.inputs[1]);
        if (!shape || shape.dataType!==7 || shape.dims.length!==1 || shape.dims[0]!==2 || shape.integers.length!==2 || getAttribute(node,"allowzero",0)!==0) throw new Error("Reshape requires a constant int64 shape [1, features] or [0, -1].");
        const [batch,features]=shape.integers;
        if (![0,1].includes(batch) || ![-1,currentSize].includes(features)) throw new Error("Reshape must preserve a singleton batch and all features.");
        currentShape=[1,currentSize];
      }
      if (op==="Cast" && getAttribute(node,"to",0)!==1) throw new Error("Only float32-preserving Cast is supported.");
      if (op==="Dropout") {
        if (getAttribute(node,"is_test",1)!==1) throw new Error("Training Dropout is not supported.");
        if (node.inputs[2]) {
          const training=graph.initializers.get(node.inputs[2]);
          if (!training || training.dataType!==9 || training.integers.length!==1 || training.integers[0]!==0) throw new Error("Dropout training_mode must be a constant false value.");
        }
      }
      currentName=node.outputs[0];
      continue;
    }
    if (op==="Gemm" || op==="MatMul") {
      requireCurrent(node);
      if (currentShape.length!==2 || currentShape[0]!==1) throw new Error("Dense operations require a [1, features] input; use batch-preserving Flatten first.");
      const weight=graph.initializers.get(node.inputs[1]), bias=op==="Gemm"&&node.inputs[2]?graph.initializers.get(node.inputs[2]):undefined;
      if (!weight || (op==="Gemm"&&node.inputs[2]&&!bias)) throw new Error("Dense weights and optional bias must be constant float32 tensors.");
      if (op==="Gemm" && getAttribute(node,"transA",0)!==0) throw new Error("Transposed Gemm inputs are not supported.");
      const transB=op==="Gemm"?getAttribute(node,"transB",0):0;
      if (![0,1].includes(transB)) throw new Error("Gemm transB must be 0 or 1.");
      const layer=createDenseLayer({id:node.name||`Dense ${layers.length+1}`,inputSize:currentSize,outputName:node.outputs[0],weightTensor:weight,biasTensor:bias,transB:transB===1});
      const alpha=op==="Gemm"?getAttribute(node,"alpha",1):1, beta=op==="Gemm"?getAttribute(node,"beta",1):1;
      if (![alpha,beta].every(Number.isFinite)) throw new Error("Gemm multipliers must be finite.");
      if (alpha!==1) layer.weights=layer.weights.map(w=>w*alpha);
      if (beta!==1) layer.bias=layer.bias.map(b=>b*beta);
      layers.push(layer);currentSize=layer.outputSize;currentShape=[1,currentSize];currentName=node.outputs[0];continue;
    }
    if (op==="Add") {
      const dynamic=node.inputs.findIndex(x=>x===currentName);
      if (dynamic<0 || node.inputs.length!==2 || !last || last.activation!=="linear") throw new Error("Constant Add is supported only before a dense layer’s activation on the sequential path.");
      requireCurrent(node,dynamic);
      const bias=graph.initializers.get(node.inputs[1-dynamic]);
      if (!bias || !validBias(bias,last.outputSize)) throw new Error("Add requires a finite broadcastable float32 bias.");
      last.bias=last.bias.map((x,i)=>x+bias.floats[bias.floats.length===1?0:i]);
      last.outputName=node.outputs[0];currentName=node.outputs[0];continue;
    }
    if (op==="BatchNormalization") {
      requireCurrent(node);
      if (!last || last.activation!=="linear" || getAttribute(node,"training_mode",0)!==0 || getAttribute(node,"is_test",1)!==1) throw new Error("Only frozen inference BatchNorm before the dense activation can be folded.");
      if (node.outputs.slice(1).some(Boolean)) throw new Error("Training BatchNorm outputs are not supported.");
      foldBatchNormalizationIntoDense({layer:last,scaleTensor:getInitializer(graph,node.inputs[1],"BatchNorm"),biasTensor:getInitializer(graph,node.inputs[2],"BatchNorm"),meanTensor:getInitializer(graph,node.inputs[3],"BatchNorm"),varianceTensor:getInitializer(graph,node.inputs[4],"BatchNorm"),epsilon:getAttribute(node,"epsilon",.00001)});
      foldedBatchNorm=true;last.outputName=node.outputs[0];currentName=node.outputs[0];continue;
    }
    if (["Relu","Sigmoid","Tanh"].includes(op)) {
      requireCurrent(node);
      if (!last || last.activation!=="linear") throw new Error("The supported MLP subset permits one activation after each dense affine stage.");
      last.activation=op.toLowerCase() as DenseActivation;last.outputName=node.outputs[0];currentName=node.outputs[0];continue;
    }
    if (op==="Softmax" || op==="LogSoftmax") {
      requireCurrent(node);
      if (!last || last.activation!=="linear" || ![-1,1].includes(getAttribute(node,"axis",-1))) throw new Error("Terminal Softmax requires ten unactivated scores along the feature axis.");
      outputTransform=op==="Softmax"?"softmax":"log-softmax";currentName=node.outputs[0];continue;
    }
    throw new Error(`Unsupported ONNX operation ${op}. No inference was substituted for this graph.`);
  }
  if (!layers.length || layers[0].inputSize!==784 || layers.at(-1)?.outputSize!==10 || layers.at(-1)?.activation!=="linear" || currentName!==graph.outputs[0].name) throw new Error("The supported model must be one sequential dense chain from 784 inputs to ten unactivated scores, optionally ending in Softmax/LogSoftmax.");
  if (layers.some(l=>l.weights.some(x=>!Number.isFinite(x))||l.bias.some(x=>!Number.isFinite(x)))) throw new Error("The effective model parameters must remain finite.");
  return {fileName,inputSize:784,outputSize:10,inputShape,outputTransform,foldedBatchNorm,layers:layers.map(l=>({id:l.id,inputSize:l.inputSize,outputSize:l.outputSize,weights:l.weights,bias:l.bias,activation:l.activation}))};
}

function validBias(tensor:TensorProto, outputSize:number) {
  return tensor.dataType===1 && tensor.dims.length<=2 && (tensor.dims.length!==2||tensor.dims[0]===1) && [1,outputSize].includes(tensor.dims.at(-1)??1) && tensor.floats.length===product(tensor.dims) && tensor.floats.every(Number.isFinite);
}

function activate(value: number, activation: DenseActivation) {
  if (activation === "relu") {
    return Math.max(0, value);
  }

  if (activation === "sigmoid") {
    return 1 / (1 + Math.exp(-value));
  }

  if (activation === "tanh") {
    return Math.tanh(value);
  }

  return value;
}

function activationDerivative(value: number, activation: DenseActivation) {
  if (activation === "relu") {
    return value > 0 ? 1 : 0;
  }

  if (activation === "sigmoid") {
    const activated = activate(value, activation);
    return activated * (1 - activated);
  }

  if (activation === "tanh") {
    const activated = Math.tanh(value);
    return 1 - activated * activated;
  }

  return 1;
}

export function softmax(logits: Float32Array) {
  if (!logits.length || logits.some(x=>!Number.isFinite(x))) throw new Error("Softmax requires nonempty finite scores.");
  const maxLogit = Math.max(...logits);
  const exps = Array.from(logits, (logit) => Math.exp(logit - maxLogit));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return new Float32Array(exps.map((value) => value / total));
}

export function runMlpCpu(model: MlpModel, input: Float32Array): ForwardDebug {
  if (input.length!==model.inputSize || input.some(x=>!Number.isFinite(x))) throw new Error("The model input must have the expected finite values.");
  const preActivations: Float32Array[] = [];
  const activations: Float32Array[] = [];
  let current = input;

  for (const layer of model.layers) {
    const z = new Float32Array(layer.outputSize);
    const a = new Float32Array(layer.outputSize);

    for (let outputIndex = 0; outputIndex < layer.outputSize; outputIndex += 1) {
      let sum = layer.bias[outputIndex] ?? 0;

      for (let inputIndex = 0; inputIndex < layer.inputSize; inputIndex += 1) {
        sum += current[inputIndex] * layer.weights[inputIndex * layer.outputSize + outputIndex];
      }

      z[outputIndex] = sum;
      a[outputIndex] = activate(sum, layer.activation);
    }

    preActivations.push(z);
    activations.push(a);
    current = a;
  }

  const logits = activations.at(-1) ?? new Float32Array(10);
  const probabilities = softmax(logits);
  let predictedClass = 0;

  for (let index = 1; index < probabilities.length; index += 1) {
    if (probabilities[index] > probabilities[predictedClass]) {
      predictedClass = index;
    }
  }

  return {
    logits,
    probabilities,
    preActivations,
    activations,
    predictedClass,
    confidence: probabilities[predictedClass],
  };
}

export async function runMlpWebGpu(model:MlpModel,input:Float32Array):Promise<Float32Array> {
  return (await runMlpWebGpuDebug(model,input)).logits;
}

export async function runMlpWebGpuDebug(
  model: MlpModel,
  input: Float32Array,
): Promise<ForwardDebug> {
  if (input.length !== model.inputSize || input.some(x=>!Number.isFinite(x))) throw new Error("Invalid model input.");
  if (!navigator.gpu) {
    throw new Error("WebGPU is not available in this browser.");
  }

  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) {
    throw new Error("No WebGPU adapter was found.");
  }

  const device = await adapter.requestDevice();
  const resources: GPUBuffer[] = [];
  device.pushErrorScope("validation");
  try {
  const shader = device.createShaderModule({
    code: `
      struct Params {
        inputSize: u32,
        outputSize: u32,
        activation: u32,
        _pad: u32,
      };

      @group(0) @binding(0) var<storage, read> inputValues: array<f32>;
      @group(0) @binding(1) var<storage, read> weights: array<f32>;
      @group(0) @binding(2) var<storage, read> bias: array<f32>;
      @group(0) @binding(3) var<storage, read_write> outputValues: array<f32>;
      @group(0) @binding(4) var<uniform> params: Params;
      @group(0) @binding(5) var<storage, read_write> preValues: array<f32>;

      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) globalId: vec3<u32>) {
        let outputIndex = globalId.x;

        if (outputIndex >= params.outputSize) {
          return;
        }

        var sum = bias[outputIndex];

        for (var inputIndex = 0u; inputIndex < params.inputSize; inputIndex = inputIndex + 1u) {
          let weightIndex = inputIndex * params.outputSize + outputIndex;
          sum = sum + inputValues[inputIndex] * weights[weightIndex];
        }

        preValues[outputIndex] = sum;
        if (params.activation == 1u && sum < 0.0) {
          sum = 0.0;
        }

        if (params.activation == 2u) {
          sum = 1.0 / (1.0 + exp(-sum));
        }

        if (params.activation == 3u) {
          sum = tanh(sum);
        }

        outputValues[outputIndex] = sum;
      }
    `,
  });

  const info = await shader.getCompilationInfo();
  if (info.messages.some(m=>m.type === "error")) throw new Error("WebGPU shader compilation failed.");
  const pipeline = device.createComputePipeline({
    layout: "auto",
    compute: {
      module: shader,
      entryPoint: "main",
    },
  });

  let current = input;
  const preActivations: Float32Array[] = [], activations: Float32Array[] = [];

  for (const layer of model.layers) {
    if (layer.weights.byteLength > device.limits.maxStorageBufferBindingSize) throw new Error("This model exceeds the WebGPU storage-buffer limit.");
    const inputBuffer = createStorageBuffer(device, current);
    const weightBuffer = createStorageBuffer(device, layer.weights);
    const biasBuffer = createStorageBuffer(device, layer.bias);
    const outputBuffer = device.createBuffer({
      size: layer.outputSize * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });
    const preBuffer = device.createBuffer({size:layer.outputSize*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC});
    const paramsBuffer = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const params = new Uint32Array([
      layer.inputSize,
      layer.outputSize,
      activationCode(layer.activation),
      0,
    ]);

    device.queue.writeBuffer(paramsBuffer, 0, params);

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: inputBuffer } },
        { binding: 1, resource: { buffer: weightBuffer } },
        { binding: 2, resource: { buffer: biasBuffer } },
        { binding: 3, resource: { buffer: outputBuffer } },
        { binding: 4, resource: { buffer: paramsBuffer } },
        { binding: 5, resource: { buffer: preBuffer } },
      ],
    });
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(Math.ceil(layer.outputSize / 64));
    pass.end();

    const readBuffer = device.createBuffer({
      size: layer.outputSize * 8,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    resources.push(inputBuffer,weightBuffer,biasBuffer,outputBuffer,preBuffer,paramsBuffer,readBuffer);
    encoder.copyBufferToBuffer(outputBuffer, 0, readBuffer, 0, layer.outputSize * 4);
    encoder.copyBufferToBuffer(preBuffer, 0, readBuffer, layer.outputSize * 4, layer.outputSize * 4);
    device.queue.submit([encoder.finish()]);
    await readBuffer.mapAsync(GPUMapMode.READ);

    const bytes=readBuffer.getMappedRange();
    current = new Float32Array(bytes.slice(0,layer.outputSize*4));
    const z = new Float32Array(bytes.slice(layer.outputSize*4));
    if (current.some(x=>!Number.isFinite(x)) || z.some(x=>!Number.isFinite(x))) throw new Error("The model produced nonfinite WebGPU values.");
    activations.push(current);preActivations.push(z);
    readBuffer.unmap();

    inputBuffer.destroy();
    weightBuffer.destroy();
    biasBuffer.destroy();
    outputBuffer.destroy();
    preBuffer.destroy();
    paramsBuffer.destroy();
    readBuffer.destroy();
  }

  const error=await device.popErrorScope();
  if (error) throw new Error(`WebGPU validation failed: ${error.message}`);
  const probabilities=softmax(current);
  let predictedClass=0;
  for(let i=1;i<probabilities.length;i++)if(probabilities[i]>probabilities[predictedClass])predictedClass=i;
  return {logits:current,probabilities,preActivations,activations,predictedClass,confidence:probabilities[predictedClass]};
  } finally {
    resources.forEach(b=>b.destroy());
    device.destroy();
  }
}

function createStorageBuffer(device: GPUDevice, values: Float32Array) {
  const buffer = device.createBuffer({
    size: values.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(buffer, 0, values);
  return buffer;
}

function activationCode(activation: DenseActivation) {
  if (activation === "relu") {
    return 1;
  }

  if (activation === "sigmoid") {
    return 2;
  }

  if (activation === "tanh") {
    return 3;
  }

  return 0;
}

export function normalizeMnistInput(values: number[]) {
  const normalized = new Float32Array(784);

  for (let index = 0; index < normalized.length; index += 1) {
    normalized[index] = Math.min(1, Math.max(0, values[index] ?? 0));
  }

  return normalized;
}

export function preprocessMnistInput(
  input: Float32Array,
  mode: MnistPreprocessingMode,
) {
  if (input.length!==784 || input.some(x=>!Number.isFinite(x)) || !["mnist-standard","raw"].includes(mode)) throw new Error("Preprocessing requires 784 finite brightness values and a supported mode.");
  const preprocessed = new Float32Array(784);

  for (let index = 0; index < preprocessed.length; index += 1) {
    const value = Math.min(1, Math.max(0, input[index] ?? 0));
    preprocessed[index] =
      mode === "mnist-standard" ? (value - 0.1307) / 0.3081 : value;
  }

  return preprocessed;
}

export function computeInputSaliency(
  model: MlpModel,
  debug: ForwardDebug,
  mode?: MnistPreprocessingMode,
) {
  let gradient = new Float32Array(model.outputSize);
  gradient[debug.predictedClass] = 1;

  for (let layerIndex = model.layers.length - 1; layerIndex >= 0; layerIndex -= 1) {
    const layer = model.layers[layerIndex];
    const z = debug.preActivations[layerIndex];
    const gradZ = new Float32Array(layer.outputSize);

    for (let outputIndex = 0; outputIndex < layer.outputSize; outputIndex += 1) {
      gradZ[outputIndex] =
        gradient[outputIndex] *
        activationDerivative(z[outputIndex], layer.activation);
    }

    const gradInput = new Float32Array(layer.inputSize);

    for (let inputIndex = 0; inputIndex < layer.inputSize; inputIndex += 1) {
      let sum = 0;

      for (let outputIndex = 0; outputIndex < layer.outputSize; outputIndex += 1) {
        sum += layer.weights[inputIndex * layer.outputSize + outputIndex] * gradZ[outputIndex];
      }

      gradInput[inputIndex] = sum;
    }

    gradient = gradInput;
  }

  return mode === "mnist-standard" ? gradient.map(g=>g/.3081) : gradient;
}

export function topContributors(
  layer: DenseLayer,
  previousActivation: Float32Array,
  neuronIndex: number,
  count = 5,
) {
  return Array.from({ length: layer.inputSize }, (_, index) => {
    const weight = layer.weights[index * layer.outputSize + neuronIndex] ?? 0;
    return {
      neuron: index,
      activation: previousActivation[index] ?? 0,
      weight,
      contribution: weight * (previousActivation[index] ?? 0),
    };
  })
    .sort((left, right) => Math.abs(right.contribution) - Math.abs(left.contribution))
    .slice(0, count);
}
