export type View = "page" | "input" | "maps" | "threshold" | "components" | "boxes";
export type Channel = "centres" | "top" | "bottom";
export type Cell = { x: number; y: number };
export type LineBox = { component: number; input_box: number[]; box: number[]; score: number; area: number };
export type OcrRun = {
 source: string; original_shape: number[]; input_shape: number[]; output_shape: number[]; input_scale: number;
 threshold: number; min_area: number; resolution: number; model_sha256: string; revision: string;
 boxes: LineBox[]; components: number; labels: Int32Array; tensor: Float32Array; ink: Float32Array;
 images: Record<string, HTMLCanvasElement>; distance_caps: Record<string, number>; runtime: string;
 timings: { preprocess_ms: number; inference_ms: number; decode_ms: number; request_ms: number; cached_inference: boolean };
};
export type OcrEngine = {
 ready: Promise<unknown>;
 openFile(file: File): Promise<{ name: string; pages: number }>;
 openProvided(): Promise<{ name: string; pages: number }>;
 analyze(p: { source: string; page: number; resolution: number; threshold: number; min_area: number; force?: boolean }): Promise<OcrRun>;
 dispose(): void;
};
export async function loadOcrEngine(): Promise<OcrEngine> {
 const url = "/ocr-line-detection/runtime/engine.mjs";
 const runtimeModule = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url);
 return runtimeModule.createEngine() as OcrEngine;
}
export function probability(logit: number) { return 1 / (1 + Math.exp(-logit)); }
export function inspectCell(run: OcrRun, cell: Cell) {
 const width = run.output_shape[3], size = width * run.output_shape[2], i = cell.y * width + cell.x;
 const logit = run.tensor[i], top = run.tensor[size+i], bottom = run.tensor[2*size+i], inputY = 2*cell.y+1;
 return { logit, probability: probability(logit), top, bottom, inputY, topEdge: inputY-top, bottomEdge: inputY+bottom, component: run.labels[i] };
}
export function strongestCell(run: OcrRun, component?: number): Cell | null {
 let best = -Infinity, at = -1;
 for (let i=0;i<run.labels.length;i++) if ((component === undefined ? run.labels[i] > 0 : run.labels[i] === component) && run.tensor[i] > best) { best=run.tensor[i]; at=i; }
 return at<0 ? null : { x: at%run.output_shape[3], y: Math.floor(at/run.output_shape[3]) };
}
export function saveDownload(blob: Blob, filename: string) {
 const url = URL.createObjectURL(blob), link = document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
