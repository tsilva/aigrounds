interface Navigator {
  gpu?: GPU;
}

interface GPU {
  requestAdapter(): Promise<GPUAdapter | null>;
}

interface GPUAdapter {
  requestDevice(): Promise<GPUDevice>;
}

interface GPUDevice {
  queue: GPUQueue;
  createShaderModule(descriptor: { code: string }): GPUShaderModule;
  createComputePipeline(descriptor: {
    layout: "auto";
    compute: {
      module: GPUShaderModule;
      entryPoint: string;
    };
  }): GPUComputePipeline;
  createBuffer(descriptor: {
    size: number;
    usage: number;
    mappedAtCreation?: boolean;
  }): GPUBuffer;
  createBindGroup(descriptor: {
    layout: GPUBindGroupLayout;
    entries: Array<{
      binding: number;
      resource: { buffer: GPUBuffer };
    }>;
  }): GPUBindGroup;
  createCommandEncoder(): GPUCommandEncoder;
  destroy(): void;
}

interface GPUQueue {
  writeBuffer(
    buffer: GPUBuffer,
    bufferOffset: number,
    data: ArrayBufferLike | ArrayBufferView<ArrayBufferLike>,
  ): void;
  submit(commandBuffers: GPUCommandBuffer[]): void;
}

interface GPUShaderModule {
  readonly label?: string;
}

interface GPUComputePipeline {
  getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPUBindGroupLayout {
  readonly label?: string;
}

interface GPUBindGroup {
  readonly label?: string;
}

interface GPUBuffer {
  getMappedRange(): ArrayBuffer;
  mapAsync(mode: number): Promise<void>;
  unmap(): void;
  destroy(): void;
}

interface GPUCommandEncoder {
  beginComputePass(): GPUComputePassEncoder;
  copyBufferToBuffer(
    source: GPUBuffer,
    sourceOffset: number,
    destination: GPUBuffer,
    destinationOffset: number,
    size: number,
  ): void;
  finish(): GPUCommandBuffer;
}

interface GPUComputePassEncoder {
  setPipeline(pipeline: GPUComputePipeline): void;
  setBindGroup(index: number, bindGroup: GPUBindGroup): void;
  dispatchWorkgroups(workgroupCountX: number): void;
  end(): void;
}

interface GPUCommandBuffer {
  readonly label?: string;
}

declare const GPUBufferUsage: {
  COPY_DST: number;
  COPY_SRC: number;
  MAP_READ: number;
  STORAGE: number;
  UNIFORM: number;
};

declare const GPUMapMode: {
  READ: number;
};
