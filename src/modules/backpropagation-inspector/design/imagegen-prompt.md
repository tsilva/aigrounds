Regenerate the Backpropagation Inspector as a cleaner high-fidelity AI Grounds desktop app screenshot. Keep the exact reference style: no logo, no top-left brand mark, no global nav, no sidebar; huge black title at upper left, short dark-blue subtitle, one pale outlined help button at upper right; bright white/cool-gray background; electric indigo section titles and active controls; pale blue borders; compact numbered lesson panels; mono numeric/formula details; dense readable teaching UI; no decorative orbs, no marketing hero, no nested decorative cards, no bottom instruction bar.

Important correction from the prior draft: remove all input-to-hidden weight gradients and any stray red numbers on input-to-hidden arrows. Do not show extra gradient values unless they are in the table below. Teach one clean backprop step from cached hidden activations to the output weights, plus hidden-credit signals. This avoids inconsistent hidden-weight math.

Concept: backpropagation as credit assignment through local derivatives. Core intuition: the output error flows backward; each output weight gets a signed credit score equal to cached activation times downstream error.

Page structure:
1. Panel "1. PICK ONE TRAINING CASE": three segmented case buttons. Active Case A shows cached activations h1=0.80 and h2=0.35, target y=1. Compact summary: task binary classification, loss binary cross entropy. Case buttons should look like the reference segmented cards.
2. Panel "2. STEP THE SIGNAL FORWARD": a simple graph with two cached hidden activation nodes h1=0.80 and h2=0.35 feeding one sigmoid output node p=0.659. Edges are output weights w_out1=1.40 and w_out2=-0.60, plus output bias b=-0.25. Formula strip with exactly these values:
   z = 1.40*h1 - 0.60*h2 - 0.25 = 0.66
   p = sigmoid(z) = 0.659
   L = -log(p) = 0.417
   Show target y=1 and loss 0.417 on the right. Use blue for forward activations and red only for error/loss.
3. Panel "3. SEND CREDIT BACKWARD": same graph with red backward arrows only on the output-weight paths and into the hidden activation nodes. Step controls Forward / Backward / Update, with Backward active. Gradient table must include only these exact rows and values:
   dL/dz = p - y = -0.341
   dL/dw_out1 = h1 * dL/dz = 0.80 * -0.341 = -0.273
   dL/dw_out2 = h2 * dL/dz = 0.35 * -0.341 = -0.119
   dL/dh1 = w_out1 * dL/dz = 1.40 * -0.341 = -0.477
   dL/dh2 = w_out2 * dL/dz = -0.60 * -0.341 = +0.205
   Add a compact formula pill: "weight credit = cached activation x downstream error".
4. Panel "4. SEE THE UPDATE": learning rate slider set to 0.20, before/after table with exactly:
   w_out1 before 1.40, grad -0.273, change +0.055, after 1.45
   w_out2 before -0.60, grad -0.119, change +0.024, after -0.58
   Concise takeaway: "Bigger cached activation times bigger downstream error means bigger update."

Controls and coverage: case buttons update both the graph and gradient table; step controls update both graph overlay and formulas; learning-rate slider updates both weight changes and after-values. Ensure text is not clipped or cramped. Do not invent hidden ReLU formulas, input weights, extra gradient labels, random values, or contradictory math.
