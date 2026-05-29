Design a high-fidelity AI Grounds interactive learning playground page titled "Convolution Filter Lab". Match the cross-entropy reference structure: no logo, no top-left brand mark, no global nav, no sidebar; huge black page title at upper left; short dark-blue subtitle; one pale outlined AI Guide button at upper right; light cool gray page background; compact numbered lesson panels with pale blue borders, white surfaces, subtle cool shadows, electric indigo section titles, mono numeric/formula details, and restrained red/green/amber state colors.

Concept: convolution filters, 3x3 kernels, stride, and padding. Core intuition: a convolution output cell is the weighted sum of a tiny local image patch, and stride/padding change which patches get sampled and how large the output grid becomes.

Use the smallest memorable interaction: the learner drags or steps a 3x3 kernel window across a 5x5 image grid and sees output cells fill. Show filter choices Edge, Blur, and Sharpen; stride and padding controls; a padded image with the active 3x3 window; patch x kernel = product; the exact weighted-sum formula; and a feature-map grid.

Accepted numeric state for the final mockup:
- selected filter: Edge vertical, kernel [[-1,0,1],[-1,0,1],[-1,0,1]]
- input image: every row is [1, 2, 3, 4, 5]
- padding = 1, stride = 1, output size = 5 x 5
- current patch y[0,0] = [[0,0,0],[0,1,2],[0,1,2]]
- product = [[0,0,0],[0,0,2],[0,0,2]]
- formula: y[0,0] = 0 + 0 + 0 + 0 + 0 + 2 + 0 + 0 + 2 = 4
- output feature map:
  [4, 4, 4, 4, -8]
  [6, 6, 6, 6, -12]
  [6, 6, 6, 6, -12]
  [6, 6, 6, 6, -12]
  [4, 4, 4, 4, -8]

The final accepted artifact was rendered deterministically from this design direction so the visible arithmetic is exact.
