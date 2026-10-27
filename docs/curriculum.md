# Curriculum

The recommended AI core has 20 steps. Specialist paths share foundations and
have their own local order. Paths recommend study; they never restrict access.
The dashboard is the learner-facing lesson plan. `src/lib/curriculum.ts` defines
its order, path membership, chapter groups and prerequisite concepts; metadata
defines published versus planned status.

## Applied structure

- Global search, Browse all, 28 specialist main paths and 16 optional branches alongside
  the core. Regression is core step 5 and gradient descent is step 6.
- Optional prerequisite refreshers appear within lessons.
- Path-aware next links, explicit skips over planned steps, chapter links and
  browser-local progress. No account is required.
- Visits, self-reported reviews and successful **explicit transfer checks** are
  separate records. Regular experiment completion does not establish transfer.
  Lessons without an explicit transfer result do not produce a transfer record.
- After a day, completed transfer chapters offer a recall prompt tied to that
  chapter's learning goal. These prompts invite practice; they do not grade or
  claim retained mastery. Progress stays in local storage, with an in-memory
  fallback when storage is unavailable.
- The Concept Atlas and Zero Knowledge Proofs remain available under Explore &
  reference, outside the numbered course.

All previously published lesson routes remain registered. Five pairs now
share one dashboard card, with two linked chapters and their original engines,
scenarios, guided experiments and AI Guides:

| Group | Chapter 1 | Chapter 2 |
| --- | --- | --- |
| Fit a Line & Understand Its Loss | Linear Regression Line Fitting | Least Squares Loss Landscape |
| Classification Decisions & Metrics | Classification Metrics Foundations | Confusion Matrix & Thresholds |
| Probability Predictions & Cross Entropy | Log Loss Confidence Penalties | Cross Entropy Loss |
| Confidence Intervals & Precision | Confidence Intervals Explorer | Margin of Error & Sample Size Lab |
| Errors, Power & Sample Planning | Type I & Type II Errors Lab | Power, Effect Size & Sample Size Lab |

This uses the approved linked-chapter consolidation option. It does not claim a
shared dataset or a combined engine. There are 90 registered playgrounds and 85 published catalog cards after the
five chapter consolidations; two cards are reference/extras. All 20 core steps
are available locally.

## Core

1. Mean, Median & Mode
2. Variance & Standard Deviation
3. Sampling & Sample Size
4. Sampling Bias
5. Fit a Line & Understand Its Loss
6. Gradient Descent
7. Train/Test Split & Generalization
8. Overfitting
9. Class Scores & Logits
10. Linear Classification & Decision Boundaries
11. Softmax & Temperature
12. Classification Decisions & Metrics
13. Probability Predictions & Cross Entropy
14. Regularization
15. Activation Functions
16. Neural Network Forward Pass
17. Autograd & the Chain Rule
18. Backpropagation
19. The Training Loop
20. MNIST: inspect a real model

## Implemented bridges

| Priority | Lesson | Teaching contract |
| --- | --- | --- |
| 1 | The Training Loop | Step forward, loss, backward and update separately; repeat batches and epochs; compare held-out loss without fitting held-out rows. |
| 2 | Linear Classification & Decision Boundaries | Change weights/bias and distinguish signed scores, sigmoid readouts and decision cutoffs; handle degenerate boundaries explicitly. |
| 3 | How Tokens Become an Answer | Append tokens from a disclosed authored transition bank; compare greedy and seeded sampling, candidate filters, EOS and length limits. |
| 4 | Inside a Transformer Block | Trace one disclosed pre-normalized decoder block, residual additions and attention/MLP branches; retain a complete numeric trace beyond the default first-addition view. |
| 5 | From Retrieval to a Grounded Answer | Trace ranked authored chunks into supplied context and evidence-linked authored answers; isolate retrieval failure from answer failure. |

Each bridge includes three gated prediction/action/explanation experiments,
incorrect-answer recovery and a different-case transfer check. The accepted
designs and refinements are stored with each module. Pure engines have
independent numeric and state checks in `scripts/verify-bridge-engines.mjs`.
Authored generation, transformer and retrieval traces explicitly identify their
teaching assumptions; they do not imply live model inference.

Local built-in exercises can run without server-backed assistance. Live AI Guide
verification requires a configured OpenRouter server. The local verification
run found it unconfigured, so the full lesson clean-pass certification remains
blocked. Local implementation does not imply deployment or learner validation.

## Planned curriculum from aiml-notebooks

There are **144 teaching-unit placeholders**, grouped into **140 coming-soon
cards**, plus **5 planned extensions** to published workbenches. Alongside
90 live routes, the dashboard has 225 cards after chapter consolidation.
The published 20-step core is unchanged. The selector offers 28 specialist
main paths and 16 explicitly optional branches.

The first **creation priorities** remain **Cross-Validation & Fold Design**,
**Adaptive Optimizers: RMSprop & Adam**, then **Decision Trees & Information Gain**.
`curriculumCreationPriorities` owns this build queue. It does not seed Browse all
or determine learner study order; the checker verifies that changing the queue
leaves study order unchanged.

All additions here are placeholders. No playground components, routes, algorithm
engines, AI Guides or runnable chapter exercises have been created. Internal
chapter outlines and optional comparisons record future scope only.

`src/lib/planned-curriculum.ts` owns primary interactions, concepts, source
notebooks, prerequisites, chapter outlines and `plannedLessonGroups`.
`upcomingPlaygrounds` exposes the planned units to the catalog. A group shares one
coming-soon card while retaining both original unit IDs and source mappings.
Grouped placeholders have no lesson links. `src/lib/curriculum.ts` owns paths,
optional branch parents and prerequisite-respecting study order.

### Applied ordering corrections

- Model selection introduces bias–variance and learning curves before search.
- Classical ML introduces kNN, linear decisions and trees before ensembles, with
  stacking last. Naive Bayes and support-vector models are optional family branches.
- Training places capacity and initialization near the forward-pass foundations.
  Gradient accumulation belongs to the later efficiency path.
- Retrieval reaches a simple RAG baseline and diagnoses evidence quality before
  introducing chunking, sparse scores, fusion and reranking. Approximate indexes
  belong to an optional search-scaling branch.
- Basic generation follows tokens and probabilities into decoding and operating
  metrics. Bigram/MLP training stays in Sequence & language models; caches, head
  sharing and speculative/tiled inference have an optional efficiency branch.
- Vision teaches input transforms, convolution, pooling and normalization before
  optional detection/OCR, segmentation, image-transformer and efficiency paths.
- Generative models branch into latent models, adversarial training and diffusion.
  Learners need not finish every family or a segmentation course before diffusion.
- Projection proceeds through vectors, projections, PCA and SVD before nonlinear
  maps. Hard/soft clustering is an optional branch after distance foundations.
- Relationships completes ordinary regression, residual diagnostics, generalization
  and learning curves before an optional Bayesian-regression branch.
- The main transformer path ends at a complete decoder block. Masked objectives
  are optional; image transformers, MoE and quantization retain specialist owners.
- Entity tagging and extractive QA are sibling NLP branches. CRF decoding follows
  entity tagging; it is not a prerequisite for learning answer spans.
- The generative foundation route refreshes training and noise. MSE versus MAE
  remains in regression rather than being required by every generative family.

Grad-CAM depends on CNN feature maps and backward gradients, not Integrated
Gradients. Token labels, answer spans and CTC alignment probabilities do not
require the example notebook’s recurrent or cross-attention architecture.
Flash Attention explicitly builds on stable softmax/log-sum-exp. Prerequisites
within a grouped card are checked in chapter order; prerequisites of every chapter
also participate in ordering the card. Foundations outside a path remain linked
refreshers rather than being silently treated as completed.

### Additions, split and grouping decisions

- **Sequential Decisions & Discounted Returns** introduces states, policies,
  trajectories and returns after exploration and expected value. Q-learning now
  concentrates on Bellman targets and table updates. Policy gradients and
  supplied-value return targets use the shared foundation rather than requiring
  the Q-learning algorithm solely to introduce sequential rewards.
- **Cost-Sensitive Threshold Selection** changes false-positive/false-negative
  costs on fixed validation scores and minimizes observed cost without retraining.
  **Class-Weighted Training Loss** remains a separate fitting intervention. Neither
  a finite validation minimum nor a chosen class weight proves an optimal future
  policy; prospective probability-based decisions require their stated assumptions.
- Hybrid fusion and candidate reranking are separate teaching units under one
  navigation card. Fusion combines lists; reranking rescores a fixed candidate
  pool and cannot retrieve an absent item. Their prerequisites do not imply that
  every reranker requires hybrid fusion.
- Forward-only RNN state and BPTT have separate cards and prerequisite sets.
  This prevents a forward-state introduction from inheriting all temporal-credit
  prerequisites through a grouped-card dependency union.
- LSTM and GRU retain independent unit IDs and transfer goals under one
  **Gated Recurrent Memory** card. Their chapters compare forward state retention;
  sequence-model study places the separate temporal-credit unit afterward.
- Cross-Validation adds an optional unseen-group case alongside the existing
  time-order counterexample. The target explicitly distinguishes unseen entities
  from new observations of known entities; row-wise splitting is not declared
  universally wrong.
- Mel filterbanks and log energies are the introductory feature unit. MFCC
  compression is optional depth after that primary experiment.

### Planned linked-chapter cards

These group navigation without discarding distinct teaching units or claiming a
shared implemented engine. The existing five published chapter groups are unchanged.

| Coming-soon card | Planned chapters |
| --- | --- |
| Object Detection: Boxes & Filtering | Object Detection: Boxes, Scores & IoU → Non-Maximum Suppression |
| External Memory: Address, Read & Write | Differentiable Memory Addressing → Neural Memory: Read, Erase & Write |
| Gated Recurrent Memory | LSTM Gates & Long-Term Memory → GRU Gates & State Updates |
| Hybrid Retrieval & Reranking | Hybrid Retrieval & Rank Fusion → Candidate Reranking & Recall Limits |

### Staged scope within planned units

A chapter here is a future outline inside its unit, not an extra registered route.
Optional comparisons follow the primary prediction–action–explanation journey.
SAC and TD3 remain separate advanced algorithm units. CTC explicitly includes
summing valid alignment probabilities and constructing its loss, rather than
promising training while teaching only path collapse.

| Planned unit | Core chapter outlines | Optional depth |
| --- | --- | --- |
| Cross-Validation & Fold Design | K-Fold & Stratified Folds | Time-Ordered Counterexample; Validation on Unseen Groups |
| Adaptive Optimizers: RMSprop & Adam | RMSprop: Track Squared Gradients → Adam: Combine Gradient Moments | — |
| Decision Trees & Information Gain | Choose One Split → Grow the Tree | Gini versus Entropy |
| Soft Clustering & Expectation-Maximization | Soft Memberships → One EM Cycle | Full Covariance |
| CTC: Learning Without Frame Alignments | Paths, Blanks & Collapse → Alignment Probability & Loss | — |
| VQ-VAE & Discrete Codebooks | Assign Latents to Codes → Train Across a Discrete Choice | Codebook Updates & Usage |
| Flash Attention & Tiled Softmax | Online Softmax Statistics → Tiles & Memory Traffic | — |
| Active Learning & Annotation Budgets | Focused primary experiment | Committee Disagreement; Batch Diversity |
| SAC & Entropy-Regularized Control | Entropy-Regularized Actor Objective → Soft Critic Targets | Temperature Tuning |
| TD3 & Delayed Policy Updates | Twin-Critic & Smoothed Targets → Delayed Actor Updates | — |
| Mel Filterbanks & Log Energies | From Spectrum to Log-Mel Energies | MFCC Compression |

### Teaching-unit inventory

The following sections list each planned unit once in its first path placement.
Units can be shared by other paths. A chapter group occupies one card even when
two units appear below. This inventory is one curriculum, not separate creation
backlogs. Source identifiers refer to active files at
`../aiml-notebooks/notebooks/<identifier>.ipynb`. A plan does not establish
implementation, deployment, mathematical validation or learner effectiveness.

### Data & probability

| Planned teaching unit | Notebook source |
| --- | --- |
| Bayesian Parameters & Posterior Uncertainty (`bayesian-parameter-estimation`) | `bayesian-ml-basics` |

### Statistical inference

| Planned teaching unit | Notebook source |
| --- | --- |
| Student-t Intervals & Estimated Spread (`student-t-intervals`) | `confidence-intervals` |

### Relationships & diagnostics

| Planned teaching unit | Notebook source |
| --- | --- |
| Regression Losses: MSE vs MAE (`mse-mae-regression-losses`) | `loss-functions` |
| Learning Curves & Data Budgets (`learning-curves-data-budgets`) | `bias-variance-overfitting` |

### Relationships · optional Bayesian regression

Optional branch of **Relationships & diagnostics**.

| Planned teaching unit | Notebook source |
| --- | --- |
| Bayesian Regression & Predictive Uncertainty (`bayesian-regression`) | `bayesian-ml-basics` |

### Evaluate a classifier

| Planned teaching unit | Notebook source |
| --- | --- |
| Cost-Sensitive Threshold Selection (`cost-sensitive-thresholds`) | `calibration-and-thresholding` |
| Multiclass Metrics & Averaging (`multiclass-metric-averaging`) | `metrics` |
| Fitting Probability Calibrators (`fitting-calibrators`) | `calibration-and-thresholding` |

### Model selection & experiments

| Planned teaching unit | Notebook source |
| --- | --- |
| Cross-Validation & Fold Design (`cross-validation`) | `cross-validation` |
| Reproducibility & Fair Experiment Comparison (`experiment-reproducibility`) | `reproducibility-and-experiment-tracking` |
| Hyperparameter Search & Validation Budgets (`hyperparameter-search`) | `hyperparameter-tuning` |
| Bayesian Hyperparameter Search (`bayesian-hyperparameter-search`) | `hyperparameter-tuning` |

### Training & optimization

| Planned teaching unit | Notebook source |
| --- | --- |
| From Regression Loss to Parameter Updates (`regression-gradient-updates`) | `linear-regression` |
| Network Capacity: Width & Depth (`network-capacity-width-depth`) | `neural-network-fundamentals` |
| Weight Initialization & Signal Scale (`weight-initialization`) | `z2h-04-optimization-pt1` |
| Batch Size & Gradient Noise (`stochastic-gradient-noise`) | `mini-batch-gradient-descent` |
| Adaptive Optimizers: RMSprop & Adam (`adaptive-optimizers`) | `optimizers` |
| Learning-Rate Schedules & Warmup (`learning-rate-schedules`) | `learning-rate-schedules` |
| Gradient Flow & Clipping (`gradient-flow-clipping`) | `gradient-flow-and-stabilization` |
| Dropout: Training With Missing Activations (`dropout`) | `regularization` |
| Early Stopping & Checkpoint Selection (`early-stopping`) | `regularization` |
| Debugging Neural Networks (`debugging-neural-networks`) | `debugging-neural-networks` |
| Transfer Learning & Frozen Features (`transfer-learning`) | `transfer-learning`, `transformer-fine-tuning-basics` |

### Data preparation

| Planned teaching unit | Notebook source |
| --- | --- |
| Categorical Features & Safe Pipelines (`categorical-feature-engineering`) | `feature-engineering` |
| Feature Binning & Boundary Effects (`feature-binning`) | `feature-engineering` |
| Class-Weighted Training Loss (`class-weighting`) | `imbalanced-data` |
| Over- & Undersampling Training Data (`resampling-imbalanced-data`) | `imbalanced-data` |
| SMOTE & Synthetic Minority Examples (`synthetic-minority-sampling`) | `imbalanced-data` |

### Classical machine learning

| Planned teaching unit | Notebook source |
| --- | --- |
| k-Nearest-Neighbor Classification (`knn-classification`) | `bias-variance-overfitting` |
| Decision Trees & Information Gain (`decision-trees`) | `decision-trees` |
| Bagging, Diversity & Random Forests (`bagging-random-forests`) | `ensemble-methods` |
| Boosting & Sequential Error Correction (`boosting`) | `ensemble-methods` |
| Stacking & Out-of-Fold Predictions (`stacking`) | `ensemble-methods` |

### Classical ML · optional Naive Bayes

Optional branch of **Classical machine learning**.

| Planned teaching unit | Notebook source |
| --- | --- |
| Naive Bayes & Smoothing (`naive-bayes-smoothing`) | `naive-bayes` |

### Classical ML · optional support vectors

Optional branch of **Classical machine learning**.

| Planned teaching unit | Notebook source |
| --- | --- |
| Support Vectors & Soft Margins (`svm-margins`) | `support-vector-machines` |
| Kernel SVMs & Nonlinear Boundaries (`svm-kernels`) | `support-vector-machines` |

### Build a retrieval pipeline

| Planned teaching unit | Notebook source |
| --- | --- |
| Evidence Sufficiency & Answer Guardrails (`evidence-sufficiency-guardrails`) | `llm-evaluation-and-guardrails` |
| Document Chunking & Evidence Boundaries (`document-chunking`) | `retrieval-fundamentals`, `rag-retrieval-augmented` |
| Tokenization Choices & Unknown Words (`tokenization-choices`) | `tokenization-methods` |
| Sparse Retrieval & BM25 Scores (`sparse-retrieval-bm25`) | `retrieval-fundamentals`, `rag-retrieval-augmented` |
| Hybrid Retrieval & Rank Fusion (`hybrid-retrieval-reranking`) | `hybrid-retrieval-and-reranking` |
| Candidate Reranking & Recall Limits (`candidate-reranking`) | `hybrid-retrieval-and-reranking` |
| Query Rewriting & Retrieval Failure (`query-rewriting-retrieval`) | `hybrid-retrieval-and-reranking` |

### Retrieval · optional search scaling

Optional branch of **Build a retrieval pipeline**.

| Planned teaching unit | Notebook source |
| --- | --- |
| Distance Concentration in High Dimensions (`distance-concentration`) | `dimensionality-reduction` |
| Approximate Nearest-Neighbor Search (`approximate-neighbor-search`) | `retrieval-fundamentals` |

### Projection & dimensionality reduction

| Planned teaching unit | Notebook source |
| --- | --- |
| Linear Transformations & Eigenvectors (`linear-transformations-eigenvectors`) | `linear-algebra` |
| SVD & Low-Rank Approximation (`svd-low-rank-approximation`) | `linear-algebra` |

### Projection · optional clustering

Optional branch of **Projection & dimensionality reduction**.

| Planned teaching unit | Notebook source |
| --- | --- |
| Soft Clustering & Expectation-Maximization (`gaussian-mixtures-em`) | `gaussian-mixture-models` |

### Math & implementation tools

| Planned teaching unit | Notebook source |
| --- | --- |
| Floating-Point Precision & Range (`floating-point-precision`) | `int8-fp16-quantization` |
| Stable Softmax & Log-Sum-Exp (`stable-softmax-logsumexp`) | `z2h-03-mlp-lm` |

### Vision

| Planned teaching unit | Notebook source |
| --- | --- |
| Pooling & Receptive Fields (`pooling-receptive-fields`) | `pooling-operations` |
| CNN Residual Connections & Gradient Paths (`cnn-residual-connections`) | `resnet-skip-connections` |
| Neural Style Transfer & Feature Losses (`neural-style-transfer`) | `neural-style-transfer` |

### Vision · optional efficient architectures

Optional branch of **Vision**.

| Planned teaching unit | Notebook source |
| --- | --- |
| Depthwise & Pointwise Convolutions (`depthwise-separable-convolutions`) | `mobilenet-efficient-cnns` |
| Multi-Scale Convolution Branches (`multiscale-convolution-branches`) | `inception-multiscale`, `vgg-depth-uniformity` |
| Channel Attention & Squeeze–Excitation (`channel-attention-gates`) | `efficientnet-compound-scaling` |
| Compound Network Scaling (`compound-network-scaling`) | `efficientnet-compound-scaling` |

### Vision · optional detection & OCR

Optional branch of **Vision**.

| Planned teaching unit | Notebook source |
| --- | --- |
| Object Detection: Boxes, Scores & IoU (`object-detection-boxes`) | `object-detection-yolo` |
| Non-Maximum Suppression (`non-maximum-suppression`) | `object-detection-yolo` |

### Vision · optional segmentation

Optional branch of **Vision**.

| Planned teaching unit | Notebook source |
| --- | --- |
| Transposed Convolution & Upsampling Geometry (`transposed-convolution-geometry`) | `tensors-convolution` |
| U-Net & Pixelwise Segmentation (`unet-segmentation`) | `unet-architecture` |

### Vision · optional image transformers

Optional branch of **Vision**.

| Planned teaching unit | Notebook source |
| --- | --- |
| Multi-Head Attention & Learned Projections (`multi-head-attention`) | `attention-mechanism`, `transformer-from-scratch` |
| Vision Transformers: From Patches to Tokens (`vision-transformer-patches`) | `vision-transformers` |

### Transformers · optional masked objectives

Optional branch of **Understand transformers**.

| Planned teaching unit | Notebook source |
| --- | --- |
| Self-Supervised Learning Objectives (`self-supervised-objectives`) | `self-supervised-learning` |
| Masked Language Modeling & Bidirectional Context (`masked-language-modeling`) | `bert-architecture`, `self-supervised-learning` |

### Generation · optional inference efficiency

Optional branch of **Understand text generation**.

| Planned teaching unit | Notebook source |
| --- | --- |
| KV Caching: Reuse Without Recomputing (`kv-caching`) | `kv-caching` |
| Multi-Query & Grouped-Query Attention (`grouped-query-attention`) | `kv-caching` |
| Speculative Decoding & Verification (`speculative-decoding`) | `speculative-decoding` |
| GPU Memory & Compute Tradeoffs (`gpu-memory-compute`) | `gpu-hardware-basics` |
| Flash Attention & Tiled Softmax (`flash-attention-tiling`) | `flash-attention` |

### Sequence & language models

| Planned teaching unit | Notebook source |
| --- | --- |
| Train a Tiny Bigram Language Model (`bigram-language-model`) | `z2h-02-bigram-lm` |
| Fixed-Window MLP Language Models (`fixed-window-language-model`) | `z2h-03-mlp-lm` |
| RNNs & Hidden-State Memory (`recurrent-hidden-state`) | `rnn-from-scratch` |
| LSTM Gates & Long-Term Memory (`lstm-gates`) | `lstm-from-scratch` |
| GRU Gates & State Updates (`gru-gates`) | `gru-from-scratch` |
| Backpropagation Through Time (`backpropagation-through-time`) | `rnn-from-scratch` |
| Encoder–Decoder Models & Cross-Attention (`seq2seq-cross-attention`) | `seq2seq-with-attention` |

### Learn representations

| Planned teaching unit | Notebook source |
| --- | --- |
| Word2Vec & Negative Sampling (`word2vec-negative-sampling`) | `word2vec-from-scratch` |
| Autoencoders & the Latent Bottleneck (`autoencoders-latent-bottleneck`) | `autoencoders` |
| Denoising Autoencoders & Corrupted Inputs (`denoising-autoencoders`) | `denoising-image`, `autoencoders` |
| Sparse Autoencoders & Feature Activity (`sparse-autoencoder-features`) | `sparse-autoencoders` |
| InfoNCE & Contrastive Representation Learning (`contrastive-infonce`) | `contrastive-learning` |
| CLIP: Aligning Images & Text (`clip-image-text-alignment`) | `clip-architecture` |

### Structured NLP · foundations

| Planned teaching unit | Notebook source |
| --- | --- |
| Edit Distance, CER & WER (`edit-distance-error-rates`) | `denoising-text`, `speech-recognition` |

### Structured NLP · optional entities

Optional branch of **Structured NLP · foundations**.

| Planned teaching unit | Notebook source |
| --- | --- |
| Token Classification & Entity-Level Evaluation (`token-classification-entities`) | `ner-token-classification` |
| CRFs & Constrained Sequence Decoding (`crf-sequence-decoding`) | `ner-token-classification` |

### Structured NLP · optional answer spans

Optional branch of **Structured NLP · foundations**.

| Planned teaching unit | Notebook source |
| --- | --- |
| Extractive QA & Span Decoding (`extractive-question-answering`) | `qa-extractive` |

### Adapt pretrained models

| Planned teaching unit | Notebook source |
| --- | --- |
| Instruction Tuning & Target Masking (`instruction-tuning`) | `instruction-tuning-and-alignment`, `unsloth-minimal-training` |
| LoRA & Low-Rank Adapters (`lora-low-rank-adapters`) | `lora-peft` |
| Soft Prompts & Prefix Tuning (`soft-prompts-prefix-tuning`) | `lora-peft` |
| Fine-Tuning Memory Budgets (`fine-tuning-memory-budgets`) | `lora-peft`, `unsloth-minimal-training` |
| Preference Optimization & DPO (`instruction-tuning-preferences`) | `instruction-tuning-and-alignment` |

### Audio & speech

| Planned teaching unit | Notebook source |
| --- | --- |
| Audio Waveforms & Sampling (`audio-waveforms-sampling`) | `audio-processing` |
| Spectrograms & Time–Frequency Resolution (`audio-spectrograms`) | `audio-processing` |
| Mel Filterbanks & Log Energies (`mel-frequency-features`) | `audio-processing` |
| CTC: Learning Without Frame Alignments (`ctc-alignment`) | `speech-recognition` |

### Generative models · optional latent models

Optional branch of **Generative models · foundations**.

| Planned teaching unit | Notebook source |
| --- | --- |
| VAEs & the Reparameterization Trick (`variational-autoencoders`) | `vae` |
| VQ-VAE & Discrete Codebooks (`vqvae-codebooks`) | `vqvae` |

### Generative models · optional adversarial training

Optional branch of **Generative models · foundations**.

| Planned teaching unit | Notebook source |
| --- | --- |
| GANs & Adversarial Training (`gan-adversarial-training`) | `gan-fundamentals` |

### Generative models · optional diffusion

Optional branch of **Generative models · foundations**.

| Planned teaching unit | Notebook source |
| --- | --- |
| Diffusion: Noise & Reverse Denoising (`diffusion-denoising`) | `diffusion-models` |
| Diffusion Samplers & Step Budgets (`diffusion-sampling-budgets`) | `diffusion-models` |
| Latent Diffusion & Conditioning (`latent-diffusion`) | `latent-diffusion` |

### Search & reinforcement learning

| Planned teaching unit | Notebook source |
| --- | --- |
| Sequential Decisions & Discounted Returns (`sequential-decisions-returns`) | `rl-q-learning` |
| Q-Learning & Delayed Rewards (`q-learning`) | `rl-q-learning` |
| n-Step Returns & Bootstrapping (`n-step-return-targets`) | `rl-advanced-policy-methods`, `rl-policy-gradients` |
| Model-Based RL & Dyna Planning (`model-based-rl`) | `rl-model-based` |
| Prioritized Planning Updates (`prioritized-planning`) | `rl-model-based` |
| DQN: Replay Buffers & Target Networks (`deep-q-networks`) | `rl-deep-q-networks` |
| Policy Gradients & REINFORCE (`policy-gradients`) | `rl-policy-gradients` |
| Actor–Critic & Advantage Estimates (`actor-critic`) | `rl-policy-gradients`, `rl-advanced-policy-methods` |
| PPO & Clipped Policy Updates (`ppo-policy-updates`) | `rl-policy-gradients` |

### Continuous control

| Planned teaching unit | Notebook source |
| --- | --- |
| Continuous-Control Policies (`continuous-control-policies`) | `rl-advanced-policy-methods` |
| SAC & Entropy-Regularized Control (`soft-actor-critic`) | `rl-advanced-policy-methods` |
| TD3 & Delayed Policy Updates (`td3-delayed-updates`) | `rl-advanced-policy-methods` |

### Model efficiency

| Planned teaching unit | Notebook source |
| --- | --- |
| Gradient Accumulation & Effective Batches (`gradient-accumulation`) | `mini-batch-gradient-descent` |
| Quantization-Aware Training (`quantization-aware-training`) | `int8-fp16-quantization` |
| Binary & Ternary Weight Training (`binary-ternary-training`) | `1bit-neural-networks` |
| Knowledge Distillation & Soft Targets (`knowledge-distillation`) | `knowledge-distillation` |
| Pruning & Sparse Parameters (`model-pruning`) | `model-pruning` |
| Mixture of Experts & Sparse Routing (`mixture-of-experts-routing`) | `mixture-of-experts` |

### Interpretability & input robustness

| Planned teaching unit | Notebook source |
| --- | --- |
| Integrated Gradients & Attribution Baselines (`integrated-gradients`) | `model-interpretability` |
| LIME & Local Surrogate Explanations (`lime-local-surrogates`) | `model-interpretability` |
| SHAP & Feature Coalitions (`shap-feature-attribution`) | `model-interpretability` |
| Grad-CAM & Spatial Attribution (`grad-cam`) | `grad-cam-visualization` |
| Adversarial Examples & Robustness (`adversarial-perturbations`) | `adversarial-robustness` |

### Advanced learning & phenomena

| Planned teaching unit | Notebook source |
| --- | --- |
| Continual Learning & Replay (`continual-learning`) | `continual-learning` |
| EWC & Parameter Protection (`continual-parameter-protection`) | `continual-learning` |
| Task-Specific Parameter Isolation (`task-parameter-isolation`) | `continual-learning` |
| Active Learning & Annotation Budgets (`active-learning`) | `active-learning` |
| Curriculum Learning & Example Order (`curriculum-training-order`) | `curriculum-learning` |
| Graph Neural Networks & Message Passing (`graph-message-passing`) | `graph-neural-networks` |
| Few-Shot Learning & Prototypes (`few-shot-meta-learning`) | `meta-learning-few-shot` |
| Meta-Learning: Inner & Outer Updates (`meta-learning-inner-outer-loops`) | `meta-learning-few-shot` |
| Multi-Task Learning & Loss Balancing (`multi-task-loss-balancing`) | `multi-task-learning` |
| Double Descent & Interpolation (`double-descent`) | `double-descent` |
| Grokking & Delayed Generalization (`grokking-delayed-generalization`) | `grokking` |

### Alternative architectures & learning

| Planned teaching unit | Notebook source |
| --- | --- |
| Hopfield Networks & Associative Memory (`hopfield-associative-memory`) | `energy-based-neural-networks` |
| RBMs & Alternating Gibbs Sampling (`rbm-gibbs-sampling`) | `energy-based-neural-networks` |
| Differentiable Memory Addressing (`differentiable-memory-addressing`) | `neural-turing-machines` |
| Neural Memory: Read, Erase & Write (`neural-memory-read-write`) | `neural-turing-machines` |
| Capsules & Routing by Agreement (`capsule-routing`) | `capsule-networks` |
| Neural ODEs & Continuous Depth (`neural-odes`) | `neural-odes` |
| Forward-Forward & Local Goodness (`forward-forward-learning`) | `forward-forward` |
| Neuroevolution: Selection & Mutation (`neuroevolution`) | `neuroevolution-tic-tac-toe` |

### Planned extensions within published lessons

These changes are planned even though their owners already have live routes.
They extend existing interactions rather than adding duplicate cards. The
k-means extension has separate optional chapters for initialization/k-means++
and choosing k/inertia. The other four extension contracts are unchanged.

| Existing workbench | Planned extension | Notebook source |
| --- | --- | --- |
| Feature Scaling Lab (`feature-scaling`) | Add a median/IQR scaling comparison to the existing raw/min–max/z-score workbench, including an extreme-value and zero-IQR case. | `data-normalization` |
| Activation Functions Lab (`activation-functions`) | Extend the existing function-and-gradient comparison with smooth and nonzero-negative variants; keep training diagnosis in Gradient Flow & Clipping. | `activation-functions` |
| Positional Encoding & Token Order (`positional-encoding-token-order`) | Add a relative-distance attention-score bias comparison to the existing additive and rotary position experiments. | `positional-encodings` |
| K-Means Clustering Studio (`k-means-clustering`) | Extend centroid initialization and cluster-count comparisons with seeded k-means++ and an inertia curve, without treating an elbow as a guaranteed correct k. | `kmeans-from-scratch` |
| Convolution Filter Lab (`convolution-filter-lab`) | Add dilation to the existing kernel/stride/padding sampling-grid experiment; transposed scatter-add geometry remains a separate planned lesson. | `tensors-convolution` |

### Unit boundaries and retained decisions

Each unit should support one manipulation, an observable consequence, a
counterexample and an independent transfer check. Grouping cards preserves
small units; larger algorithms use stages and optional depth rather than an
unbounded introductory journey. Final experiment design must validate these
sizes before implementation. The total card count is not a learning-quality measure.

The previous scope reconciliation remains in effect: generic and transformer
freeze/unfreeze share Transfer Learning; SFT and DPO are separate; prototypes
and meta-learning updates are separate; grid/random search precedes Bayesian
acquisition; row resampling precedes SMOTE; audio sampling, STFT and mel features
are separate; replay, EWC and parameter isolation are separate. Named historical
architectures, library setup and tracking recipes do not each become a lesson.

### Notebook audit and continuation

[`src/lib/notebook-coverage.json`](../src/lib/notebook-coverage.json) records
132 active notebook dispositions: 131 map major AI/ML outcomes to live or planned
units or extensions; CHIP-8 emulation is outside the course’s AI/ML scope. All
unit IDs and source mappings survive this consolidation. The 59 archived
notebooks remain excluded. Mapping identifies an owner and does not establish
that an outcome is implemented or every code recipe has been ported.

Run `pnpm check:curriculum` for catalog membership, live route registration,
creation priorities, unchanged core, groups, branch parents, chapter/path ordering,
outline placeholders and source mappings. It also runs before production builds.
With the notebook checkout available, run:

```bash
pnpm check:curriculum --notebooks ../aiml-notebooks/notebooks
```

The additional source check compares the active inventory and Markdown/code cell
hashes, ignoring outputs and incidental notebook metadata. Changed teaching
sources require another semantic review. Structural checks do not certify
pedagogical order, coverage or useful unit size; those require reviewing the
actual interaction and transfer task. Keep source ownership, paths and this
specification together when refining placeholders.

## Remaining learning work

The navigation refactor leaves existing teaching mechanics intact. The next
lesson-level work includes a regression-objective follow-up after scalar
gradient descent, short probability/weighted-sum refreshers at their points of
use, mixed milestone challenges and guidance that fades after prerequisite
success. Explain that fixed regularization examples do not prove improved
generalization and fixed MNIST inference is not network training. Further
workbench consolidation is warranted only if outcome and counterexample
coverage survives a smaller default journey.

Compare the old and proposed routes with prerequisite-qualified beginners and
intermediate learners on the same outcomes. Measure time to an independently
explained insight, unnecessary navigation, misconception recovery, near
transfer and delayed retention. Analyze skip-ahead separately. Fewer clicks
and completion alone do not establish better learning; no learner study has
yet validated the 20-step route.

The Vision path includes **OCR Line Detection** after the convolution and tensor-shape lessons. It applies dense prediction and stride-two geometry to real PDF pixels, with the activation lesson linked as a sigmoid refresher. The 20-step core is unchanged.
