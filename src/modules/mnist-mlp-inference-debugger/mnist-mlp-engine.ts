export type DenseActivation = "linear" | "relu" | "sigmoid" | "tanh";

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
  inputs: string[];
  outputs: string[];
  attributes: AttributeValue[];
};

type TensorProto = {
  name: string;
  dims: number[];
  dataType: number;
  floats: Float32Array;
};

type ValueInfo = {
  name: string;
  dims: number[];
};

const tensorDataFloat = 1;
const supportedPassThroughOps = new Set([
  "Flatten",
  "Identity",
  "Reshape",
  "Cast",
  "Dropout",
]);

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
    return {
      field: key >>> 3,
      wire: key & 7,
    };
  }

  readVarint() {
    let value = 0;
    let shift = 0;

    while (!this.done) {
      const byte = this.bytes[this.offset++];
      value += (byte & 0x7f) * 2 ** shift;
      if ((byte & 0x80) === 0) {
        return value;
      }
      shift += 7;
    }

    throw new Error("Unexpected end of protobuf varint.");
  }

  readFixed32() {
    const value = this.view.getFloat32(this.offset, true);
    this.offset += 4;
    return value;
  }

  readBytes() {
    const length = this.readVarint();
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
      this.offset += 8;
      return;
    }

    if (wire === 2) {
      this.offset += this.readVarint();
      return;
    }

    if (wire === 5) {
      this.offset += 4;
      return;
    }

    throw new Error(`Unsupported protobuf wire type ${wire}.`);
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
      attribute.int = reader.readVarint();
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

  return {
    name,
    dims,
    dataType,
    floats,
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

  while (!reader.done) {
    const { field, wire } = reader.readKey();

    if (field === 1 && wire === 2) {
      const tensorReader = new ProtoReader(reader.readBytes());

      while (!tensorReader.done) {
        const tensorKey = tensorReader.readKey();

        if (tensorKey.field === 2 && tensorKey.wire === 2) {
          dims = parseTensorShape(tensorReader.readBytes());
        } else {
          tensorReader.skip(tensorKey.wire);
        }
      }
    } else {
      reader.skip(wire);
    }
  }

  return dims;
}

function parseValueInfo(bytes: Uint8Array): ValueInfo {
  const reader = new ProtoReader(bytes);
  const valueInfo: ValueInfo = {
    name: "",
    dims: [],
  };

  while (!reader.done) {
    const { field, wire } = reader.readKey();

    if (field === 1 && wire === 2) {
      valueInfo.name = decodeText(reader.readBytes());
    } else if (field === 2 && wire === 2) {
      valueInfo.dims = parseValueType(reader.readBytes());
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

  while (!reader.done) {
    const { field, wire } = reader.readKey();

    if (field === 1 && wire === 2) {
      nodes.push(parseNode(reader.readBytes()));
    } else if (field === 5 && wire === 2) {
      const tensor = parseTensor(reader.readBytes());
      initializers.set(tensor.name, tensor);
    } else if (field === 11 && wire === 2) {
      inputs.push(parseValueInfo(reader.readBytes()));
    } else {
      reader.skip(wire);
    }
  }

  return {
    nodes,
    initializers,
    inputs,
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
  return values.reduce((total, value) => total * (value || 1), 1);
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
    if (biasTensor.floats.length !== outputSize) {
      throw new Error(`Bias tensor ${biasTensor.name} does not match ${id}.`);
    }
    bias = new Float32Array(biasTensor.floats);
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

export function parseOnnxMlpModel(
  buffer: ArrayBuffer,
  fileName: string,
): MlpModel {
  const reader = new ProtoReader(new Uint8Array(buffer));
  let graph:
    | ReturnType<typeof parseGraph>
    | undefined;

  while (!reader.done) {
    const { field, wire } = reader.readKey();

    if (field === 7 && wire === 2) {
      graph = parseGraph(reader.readBytes());
    } else {
      reader.skip(wire);
    }
  }

  if (!graph) {
    throw new Error("No ONNX graph was found.");
  }

  const initializerNames = new Set(graph.initializers.keys());
  const modelInput = graph.inputs.find((input) => !initializerNames.has(input.name));
  const inputShape = modelInput?.dims.filter((dim) => dim > 0) ?? [1, 1, 28, 28];
  const modelInputSize = product(inputShape);
  const tensorSizes = new Map<string, number>();
  const aliases = new Map<string, string>();
  const layers: Array<DenseLayer & { outputName: string }> = [];

  if (modelInput) {
    tensorSizes.set(modelInput.name, modelInputSize);
  }

  function resolve(name: string): string {
    let current = name;
    const seen = new Set<string>();

    while (aliases.has(current) && !seen.has(current)) {
      seen.add(current);
      current = aliases.get(current) ?? current;
    }

    return current;
  }

  for (const node of graph.nodes) {
    const opType = node.opType;

    if (supportedPassThroughOps.has(opType)) {
      const inputName = resolve(node.inputs[0] ?? "");
      const outputName = node.outputs[0];
      aliases.set(outputName, inputName);
      tensorSizes.set(outputName, tensorSizes.get(inputName) ?? modelInputSize);
      continue;
    }

    if (opType === "Gemm") {
      const inputName = resolve(node.inputs[0] ?? "");
      const weightTensor = graph.initializers.get(node.inputs[1] ?? "");
      const biasTensor = graph.initializers.get(node.inputs[2] ?? "");
      const inputSize = tensorSizes.get(inputName) ?? modelInputSize;

      if (!weightTensor) {
        throw new Error(`Gemm node ${node.name || node.outputs[0]} has no constant weights.`);
      }

      if (getAttribute(node, "transA", 0) !== 0) {
        throw new Error("Transposed Gemm inputs are not supported for MNIST MLPs.");
      }

      const layer = createDenseLayer({
        id: node.name || `Dense ${layers.length + 1}`,
        inputSize,
        outputName: node.outputs[0],
        weightTensor,
        biasTensor,
        transB: getAttribute(node, "transB", 0) === 1,
      });

      layers.push(layer);
      tensorSizes.set(layer.outputName, layer.outputSize);
      continue;
    }

    if (opType === "MatMul") {
      const inputName = resolve(node.inputs[0] ?? "");
      const weightTensor = graph.initializers.get(node.inputs[1] ?? "");
      const inputSize = tensorSizes.get(inputName) ?? modelInputSize;

      if (!weightTensor) {
        throw new Error(`MatMul node ${node.name || node.outputs[0]} has no constant weights.`);
      }

      const layer = createDenseLayer({
        id: node.name || `Dense ${layers.length + 1}`,
        inputSize,
        outputName: node.outputs[0],
        weightTensor,
        transB: false,
      });

      layers.push(layer);
      tensorSizes.set(layer.outputName, layer.outputSize);
      continue;
    }

    if (opType === "Add") {
      const lastLayer = layers.at(-1);
      const biasInput = node.inputs.find((input) => graph.initializers.has(input));

      if (lastLayer && biasInput) {
        const biasTensor = graph.initializers.get(biasInput);

        if (biasTensor && biasTensor.floats.length === lastLayer.outputSize) {
          lastLayer.bias = new Float32Array(biasTensor.floats);
          lastLayer.outputName = node.outputs[0];
          tensorSizes.set(lastLayer.outputName, lastLayer.outputSize);
          continue;
        }
      }
    }

    if (
      opType === "Relu" ||
      opType === "Sigmoid" ||
      opType === "Tanh"
    ) {
      const lastLayer = layers.at(-1);

      if (lastLayer) {
        lastLayer.activation = opType.toLowerCase() as DenseActivation;
        lastLayer.outputName = node.outputs[0];
        tensorSizes.set(lastLayer.outputName, lastLayer.outputSize);
        continue;
      }
    }

    if (opType === "Softmax" || opType === "LogSoftmax") {
      const inputName = resolve(node.inputs[0] ?? "");
      tensorSizes.set(node.outputs[0], tensorSizes.get(inputName) ?? 10);
      continue;
    }
  }

  if (layers.length === 0) {
    throw new Error(
      "No dense MLP layers were found. Upload an ONNX model built from Gemm or MatMul layers.",
    );
  }

  if (layers[0].inputSize !== 784) {
    throw new Error(
      `This debugger expects a 28x28 MNIST input (784 values), but the first layer expects ${layers[0].inputSize}.`,
    );
  }

  const outputSize = layers.at(-1)?.outputSize ?? 0;

  if (outputSize !== 10) {
    throw new Error(
      `This debugger expects 10 digit logits, but the final layer has ${outputSize} outputs.`,
    );
  }

  return {
    fileName,
    inputSize: layers[0].inputSize,
    outputSize,
    inputShape,
    layers: layers.map((layer) => ({
      id: layer.id,
      inputSize: layer.inputSize,
      outputSize: layer.outputSize,
      weights: layer.weights,
      bias: layer.bias,
      activation: layer.activation,
    })),
  };
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
  const maxLogit = Math.max(...logits);
  const exps = Array.from(logits, (logit) => Math.exp(logit - maxLogit));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return new Float32Array(exps.map((value) => value / total));
}

export function runMlpCpu(model: MlpModel, input: Float32Array): ForwardDebug {
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

export async function runMlpWebGpu(
  model: MlpModel,
  input: Float32Array,
): Promise<Float32Array> {
  if (!navigator.gpu) {
    throw new Error("WebGPU is not available in this browser.");
  }

  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) {
    throw new Error("No WebGPU adapter was found.");
  }

  const device = await adapter.requestDevice();
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

  const pipeline = device.createComputePipeline({
    layout: "auto",
    compute: {
      module: shader,
      entryPoint: "main",
    },
  });

  let current = input;

  for (const layer of model.layers) {
    const inputBuffer = createStorageBuffer(device, current);
    const weightBuffer = createStorageBuffer(device, layer.weights);
    const biasBuffer = createStorageBuffer(device, layer.bias);
    const outputBuffer = device.createBuffer({
      size: layer.outputSize * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });
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
      ],
    });
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(Math.ceil(layer.outputSize / 64));
    pass.end();

    const readBuffer = device.createBuffer({
      size: layer.outputSize * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    encoder.copyBufferToBuffer(outputBuffer, 0, readBuffer, 0, layer.outputSize * 4);
    device.queue.submit([encoder.finish()]);
    await readBuffer.mapAsync(GPUMapMode.READ);

    current = new Float32Array(readBuffer.getMappedRange().slice(0));
    readBuffer.unmap();

    inputBuffer.destroy();
    weightBuffer.destroy();
    biasBuffer.destroy();
    outputBuffer.destroy();
    paramsBuffer.destroy();
    readBuffer.destroy();
  }

  device.destroy();

  return current;
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

export function computeInputSaliency(
  model: MlpModel,
  debug: ForwardDebug,
  input: Float32Array,
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

  return new Float32Array(
    Array.from(gradient, (value, index) => value * (input[index] + 0.08)),
  );
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
