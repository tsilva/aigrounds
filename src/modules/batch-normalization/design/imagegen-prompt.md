Design a high-fidelity AI Grounds interactive learning playground page for Batch Normalization Lab. Match the current AI Grounds cross entropy reference structure exactly: bright white/cool-gray page, oversized black page title upper left, short dark-blue subtitle underneath, one pale outlined AI Guide help button upper right, no logo, no global nav, no sidebar, no marketing hero. Content is a centered dense lesson page with stacked numbered compact panels using pale blue borders, near-white surfaces, 8-14px radius, subtle cool shadow, electric indigo uppercase section titles, mono numeric/formula details, and restrained neutral copy.

Core intuition: BatchNorm uses mini-batch mean and standard deviation to recenter and rescale activations, then gamma and beta reshape the output.

Use a compact mini-batch activation lab: scenario selector, batch-size slider, training/inference toggle, gamma slider, beta slider, raw activation dot strip, normalized z dot strip, output y dot strip, formula cards, statistic pills, and a training/inference comparison. Every primary control updates at least two teaching surfaces.

Final accepted direction: exact point-transform layout with numbered panels:

1. Shape The Mini-Batch: select Centered, Shifted, Wide, or Outlier; show raw activation dots, batch mean, batch standard deviation, and epsilon.
2. Normalize With Batch Stats: show `z = (x - mu_batch) / sqrt(var_batch + epsilon)` plus raw-to-z point transform and mean/std result pills.
3. Let The Layer Learn gamma And beta: show `y = gamma * z + beta`, gamma and beta sliders, output point strip, and output mean/std.
4. Compare Training To Inference: compact table showing current mini-batch stats in training and saved running stats in inference.

Avoid decorative backgrounds, clipped labels, malformed formulas, contradictory values, nested cards, and marketing-style layout.
