# OCR Line Detection

Route: `/playgrounds/ocr-line-detection`. The lesson is registered on the Vision path after the convolution and tensor-shape refreshers. It uses the approved shared `LearningPage`, experiment rail, controls, summaries and AI Guide entry point.

## Teaching scope

Three Predict → Try → Explain experiments separate dense maps from decoded boxes, isolate threshold decisions, and reconstruct stride-two edge coordinates. The transfer check requires the second PDF page, a 0.65 threshold, an active output cell, a numeric top-edge calculation within 0.02 input pixels and the correct unit explanation. Incorrect explanations cannot complete a check. Changing inputs or the inspected cell clears relevant answers; Reset restores the current exercise's public baseline.

The detector locates text lines. The lesson does not transcribe text, train a model, show hidden-layer activations, rotate pages, infer reading order or run Indra's adaptive retries. Playback changes views of an already-computed run.

## Actual model and provenance

- Datalab [Indra](https://github.com/datalab-to/indra), detector used with Indra OCR 1.1.2.
- Hugging Face model revision: `bd02167fdf2005a19962cc15188f8496a2c87d3b` of `datalab-to/indra-ocr`.
- Unmodified `det.onnx`: 389,948 bytes, 90,568 float initializer values.
- SHA256: `f2bd4cba23e9c328cf7ec824634e423e191a2c6aacbbf35c62bd79dd70f62f59`.
- The worker verifies this digest before creating the ONNX session.
- The model and outputs follow the full modified OpenRAIL-M license in `public/ocr-line-detection/model/LICENSE.txt`. The UI links its use restrictions before Start. Application code remains MIT; the model must not be described as MIT.

The JavaScript decoder follows Indra's `det_post.decode`: sigmoid channel 0, strict `p > threshold`, four-neighbor connected components, area filtering, unweighted mean top/bottom edges, and horizontal extension `0.15 * max(1, height)`. It maps input-pixel bounds to the source image by dividing by preprocessing scale and clipping. Component IDs and box order can differ from OpenCV and do not imply reading order. A higher threshold cannot increase retained mask pixels but may split components; box counts are not necessarily monotonic. Component scores are not calibrated correctness or transcription confidence.

## Browser runtime and privacy

ONNX Runtime Web **1.23.2** executes the detector on browser CPU through single-thread WebAssembly in a dedicated worker. PDF.js **5.4.296** renders one selected PDF page at a time. JavaScript preprocessing constructs the actual float32 ink tensor; there is no PDF text-layer shortcut, server inference endpoint or runtime CDN. The worker and document are disposed when leaving the lesson.

The bundled two-page PDF is an authored raster classroom fixture about a fictional community library. It contains no personal records. The source sandbox's private lab PDF, downloaded tensors and screenshots are not copied into this repo. A learner can open a local PDF/image; its bytes are never uploaded. Existing AI Guide requests use the site's server route and visible lesson context; users should not paste private content into the Guide.

PDF rendering is capped at 200 dpi / 2400 pixels on the long edge. Images are limited to 24 megapixels and reduced to at most 3000 on the long edge. File limit: 25 MB; PDF limit: 500 pages. Browser grayscale/rasterization and resize rounding can differ slightly from OpenCV/PDFium. Native verification uses the exact browser-exported input to isolate model execution and decoder fidelity from those rendering differences.

Input `x`: float32 `[1,1,H,W]`, with `0=paper`, `1=ink`, dimensions padded to multiples of 32. Output `out`: float32 `[1,3,H/2,W/2]`. Channel 0 is the raw centre-band logit; channels 1/2 are top/bottom distances in **input pixels**. Output cell `[y,x]` is centered at input `(2*x+1,2*y+1)`. Its top estimate is `2*y+1 - top_distance`, not `2*(y - top_distance)`.

Threshold and area changes decode the cached raw output. Resolution changes and Run detector execute a new model pass. Timings cover model execution only, excluding initialization, PDF rendering, preprocessing and display-map creation. The inspector/export uses uncapped values; map colors alone cap active distance predictions at the 98th percentile. Inactive-cell edge predictions are not reliable bounds.

## Assets and build

`pnpm prepare:ocr` copies assets from the locked npm packages and the module's runtime source into ignored `public/ocr-line-detection/{vendor,runtime}` directories. `pnpm dev --port auto` and `pnpm build` run it automatically. Build does not fetch models, libraries or PDFs from an external host. Commit the small pinned model, its license, ORT license and authored PDF; do not commit generated runtime bundles. Keep the seven-day pnpm release-age protection and disabled dependency lifecycle scripts.

The source is in `src/modules/ocr-line-detection/`; generated vendor code is excluded from ESLint while source runtime files remain checked. PDF.js font/CMap licenses accompany their generated assets. Runtime reference: [ONNX Runtime Web deployment](https://onnxruntime.ai/docs/tutorials/web/deploy.html), [PDF.js examples](https://mozilla.github.io/pdf.js/examples/).

## Exports and verification

Boxes JSON contains source/input coordinates, scores, areas, shapes, settings, identity and timings. NPZ is written entirely in the browser and contains real `x` and `out` arrays plus metadata encoded as UTF-8 `uint8`:

```python
import json
import numpy as np
run = np.load('indra-tensors.npz', allow_pickle=False)
metadata = json.loads(run['metadata'].tobytes().decode())
print(run['x'].shape, run['out'].shape)
```

The integrated lesson was also checked with its exported browser input on the authored PDF's second page (1024 px, threshold 0.65, minimum area 2): 50 boxes, maximum raw output difference from native ONNX Runtime `1.06812e-4`, mean difference `3.95726e-6`, and maximum decoder coordinate/score difference `6.10352e-5`. The earlier source sandbox's separate comparison had maximum raw difference `1.62125e-5`. Both passed the specified floating-point tolerances. Keep verification specific to tested inputs, device timings and floating-point tolerance, rather than claiming universal model accuracy. Run the repository type, lint, import-cycle and production-build gates after changes, and test PDF loading, settings, exports, guided recovery/transfer, Guide responses and supported desktop breakpoints.
