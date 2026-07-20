export type AtlasDifficulty = "beginner" | "intermediate" | "advanced";

export type AtlasConceptKind = "root" | "domain" | "group" | "concept";

export type AtlasDomainId =
  | "foundations"
  | "machine-learning"
  | "deep-learning"
  | "generative-ai"
  | "reinforcement-learning"
  | "perception-language-robotics"
  | "evaluation-safety"
  | "ai-systems";

export type AtlasDomainDefinition = {
  id: AtlasDomainId;
  label: string;
  shortLabel: string;
  color: string;
  softColor: string;
  summary: string;
  groups: {
    id: string;
    label: string;
    difficulty: AtlasDifficulty;
    concepts: string[];
  }[];
};

export type AtlasConcept = {
  id: string;
  label: string;
  kind: AtlasConceptKind;
  domainId: AtlasDomainId | "root";
  groupId?: string;
  parentId?: string;
  difficulty: AtlasDifficulty;
  description: string;
  whyItMatters: string;
  prerequisiteIds: string[];
  relatedIds: string[];
  playgroundSlug?: string;
};

export const atlasDomains: AtlasDomainDefinition[] = [
  {
    id: "foundations",
    label: "Math & Foundations",
    shortLabel: "Foundations",
    color: "#7c3aed",
    softColor: "#f3efff",
    summary:
      "The mathematical, statistical, computational, and symbolic ideas that support AI systems.",
    groups: [
      {
        id: "linear-algebra",
        label: "Linear Algebra Foundations",
        difficulty: "beginner",
        concepts: [
          "Linear algebra",
          "Scalars",
          "Vectors",
          "Matrices",
          "Tensors",
          "Dot product",
          "Matrix multiplication",
          "Vector norms",
          "Matrix rank",
          "Linear independence",
          "Basis vectors",
          "Orthogonality",
          "Projections",
          "Eigenvalues",
          "Eigenvectors",
          "Singular value decomposition",
          "Low-rank approximation",
          "Positive semidefinite matrices",
        ],
      },
      {
        id: "calculus-optimization",
        label: "Calculus & Optimization",
        difficulty: "intermediate",
        concepts: [
          "Functions",
          "Limits",
          "Derivatives",
          "Partial derivatives",
          "Gradients",
          "Directional derivatives",
          "Jacobians",
          "Hessians",
          "Chain rule",
          "Taylor approximation",
          "Optimization",
          "Convexity",
          "Constrained optimization",
          "Lagrange multipliers",
          "Gradient descent",
          "Stochastic optimization",
          "Saddle points",
          "Numerical optimization",
        ],
      },
      {
        id: "probability",
        label: "Probability",
        difficulty: "beginner",
        concepts: [
          "Probability",
          "Sample spaces",
          "Events",
          "Random variables",
          "Probability distributions",
          "Joint probability",
          "Marginal probability",
          "Conditional probability",
          "Independence",
          "Bayes rule",
          "Expectation",
          "Variance",
          "Covariance",
          "Correlation",
          "Law of large numbers",
          "Central limit theorem",
          "Monte Carlo estimation",
          "Markov chains",
        ],
      },
      {
        id: "statistics",
        label: "Statistics & Inference",
        difficulty: "intermediate",
        concepts: [
          "Descriptive statistics",
          "Statistical inference",
          "Sampling",
          "Sampling bias",
          "Point estimation",
          "Maximum likelihood estimation",
          "Maximum a posteriori estimation",
          "Bayesian inference",
          "Frequentist inference",
          "Confidence intervals",
          "Hypothesis testing",
          "P-values",
          "Statistical power",
          "Effect size",
          "Bootstrap",
          "Causal inference",
          "Confounding",
          "Experimental design",
        ],
      },
      {
        id: "information-theory",
        label: "Information Theory",
        difficulty: "intermediate",
        concepts: [
          "Information theory",
          "Self-information",
          "Entropy",
          "Cross entropy",
          "KL divergence",
          "Mutual information",
          "Conditional entropy",
          "Information gain",
          "Coding theory",
          "Source coding",
          "Channel capacity",
          "Minimum description length",
          "Rate-distortion theory",
          "Perplexity",
          "Bits and nats",
          "Data compression",
        ],
      },
      {
        id: "computer-science",
        label: "Computer Science & Search",
        difficulty: "beginner",
        concepts: [
          "Algorithms",
          "Data structures",
          "Computational complexity",
          "Big O notation",
          "Graphs",
          "Trees",
          "Graph traversal",
          "Breadth-first search",
          "Depth-first search",
          "A-star search",
          "Heuristics",
          "Dynamic programming",
          "Minimax",
          "Alpha-beta pruning",
          "Constraint satisfaction",
          "Knowledge representation",
          "Logic programming",
          "Automated theorem proving",
        ],
      },
    ],
  },
  {
    id: "machine-learning",
    label: "Machine Learning",
    shortLabel: "Machine Learning",
    color: "#16803c",
    softColor: "#edf9f0",
    summary:
      "Methods that learn patterns from data to predict, describe, rank, or decide.",
    groups: [
      {
        id: "learning-paradigms",
        label: "Learning Paradigms",
        difficulty: "beginner",
        concepts: [
          "Supervised learning",
          "Unsupervised learning",
          "Semi-supervised learning",
          "Self-supervised learning",
          "Weak supervision",
          "Active learning",
          "Online learning",
          "Batch learning",
          "Transfer learning",
          "Multi-task learning",
          "Meta-learning",
          "Continual learning",
          "Federated learning",
          "Curriculum learning",
          "Few-shot learning",
          "Zero-shot learning",
        ],
      },
      {
        id: "linear-models",
        label: "Linear & Probabilistic Models",
        difficulty: "beginner",
        concepts: [
          "Linear regression",
          "Least squares",
          "Logistic regression",
          "Multinomial logistic regression",
          "Generalized linear models",
          "Naive Bayes",
          "Linear discriminant analysis",
          "Quadratic discriminant analysis",
          "Perceptron",
          "Ridge regression",
          "Lasso regression",
          "Elastic net",
          "Polynomial regression",
          "Robust regression",
          "Bayesian linear regression",
          "Isotonic regression",
        ],
      },
      {
        id: "trees-kernels-instances",
        label: "Trees, Kernels & Instances",
        difficulty: "intermediate",
        concepts: [
          "Decision trees",
          "Classification and regression trees",
          "Random forests",
          "Bagging",
          "Boosting",
          "Gradient-boosted trees",
          "AdaBoost",
          "XGBoost",
          "LightGBM",
          "k-nearest neighbors",
          "Support vector machines",
          "Kernel trick",
          "Radial basis function kernel",
          "Gaussian processes",
          "Prototype methods",
          "Ensemble learning",
        ],
      },
      {
        id: "unsupervised-models",
        label: "Clustering & Latent Structure",
        difficulty: "intermediate",
        concepts: [
          "Clustering",
          "K-means clustering",
          "Hierarchical clustering",
          "DBSCAN",
          "Gaussian mixture models",
          "Expectation-maximization",
          "Latent variable models",
          "Principal component analysis",
          "Independent component analysis",
          "Non-negative matrix factorization",
          "t-SNE",
          "UMAP",
          "Spectral clustering",
          "Topic modeling",
          "Anomaly detection",
          "Density estimation",
        ],
      },
      {
        id: "data-features",
        label: "Data & Features",
        difficulty: "beginner",
        concepts: [
          "Datasets",
          "Examples and labels",
          "Features",
          "Feature engineering",
          "Feature selection",
          "Feature scaling",
          "Standardization",
          "Normalization",
          "Categorical encoding",
          "One-hot encoding",
          "Missing data",
          "Imputation",
          "Class imbalance",
          "Resampling",
          "Data augmentation",
          "Data leakage",
          "Dataset shift",
          "Concept drift",
        ],
      },
      {
        id: "training-generalization",
        label: "Training & Generalization",
        difficulty: "intermediate",
        concepts: [
          "Empirical risk minimization",
          "Loss functions",
          "Objective functions",
          "Training sets",
          "Validation sets",
          "Test sets",
          "Cross-validation",
          "Hyperparameters",
          "Hyperparameter optimization",
          "Grid search",
          "Random search",
          "Bayesian optimization",
          "Overfitting",
          "Underfitting",
          "Bias-variance tradeoff",
          "Regularization",
          "Early stopping",
          "Generalization bounds",
        ],
      },
      {
        id: "prediction-tasks",
        label: "Prediction Tasks",
        difficulty: "beginner",
        concepts: [
          "Classification",
          "Binary classification",
          "Multiclass classification",
          "Multi-label classification",
          "Regression",
          "Ranking",
          "Learning to rank",
          "Forecasting",
          "Time-series analysis",
          "Survival analysis",
          "Recommendation systems",
          "Collaborative filtering",
          "Content-based filtering",
          "Structured prediction",
          "Sequence labeling",
          "Out-of-distribution detection",
        ],
      },
    ],
  },
  {
    id: "deep-learning",
    label: "Deep Learning",
    shortLabel: "Deep Learning",
    color: "#2563eb",
    softColor: "#eef5ff",
    summary:
      "Neural architectures, representations, and training methods built from layered differentiable computation.",
    groups: [
      {
        id: "neural-networks",
        label: "Neural Networks",
        difficulty: "beginner",
        concepts: [
          "Neurons",
          "Weights and biases",
          "Linear layers",
          "Multi-layer perceptrons",
          "Forward propagation",
          "Backpropagation",
          "Computational graphs",
          "Automatic differentiation",
          "Activation functions",
          "Sigmoid activation",
          "Tanh activation",
          "ReLU",
          "GELU",
          "Softmax",
          "Universal approximation",
          "Depth and width",
        ],
      },
      {
        id: "neural-training",
        label: "Neural Training",
        difficulty: "intermediate",
        concepts: [
          "Mini-batch training",
          "Stochastic gradient descent",
          "Momentum",
          "Nesterov momentum",
          "AdaGrad",
          "RMSProp",
          "Adam",
          "AdamW",
          "Learning-rate schedules",
          "Warmup",
          "Gradient clipping",
          "Weight initialization",
          "Xavier initialization",
          "He initialization",
          "Vanishing gradients",
          "Exploding gradients",
          "Mixed-precision training",
          "Gradient accumulation",
        ],
      },
      {
        id: "regularization-normalization",
        label: "Regularization & Normalization",
        difficulty: "intermediate",
        concepts: [
          "Weight decay",
          "Dropout",
          "Stochastic depth",
          "Label smoothing",
          "Batch normalization",
          "Layer normalization",
          "RMS normalization",
          "Group normalization",
          "Instance normalization",
          "Residual connections",
          "Highway networks",
          "Skip connections",
          "Gradient checkpointing",
          "Parameter sharing",
          "Sparsity",
          "Lottery ticket hypothesis",
        ],
      },
      {
        id: "vision-architectures",
        label: "Convolutional Architectures",
        difficulty: "intermediate",
        concepts: [
          "Convolutional neural networks",
          "Convolution",
          "Kernels and filters",
          "Feature maps",
          "Padding",
          "Stride",
          "Pooling",
          "Receptive fields",
          "Dilated convolution",
          "Depthwise separable convolution",
          "ResNet",
          "DenseNet",
          "U-Net",
          "Object detection heads",
          "Spatial pyramids",
          "Neural style transfer",
        ],
      },
      {
        id: "sequence-architectures",
        label: "Sequence Architectures",
        difficulty: "intermediate",
        concepts: [
          "Recurrent neural networks",
          "Hidden state",
          "Backpropagation through time",
          "Long short-term memory",
          "Gated recurrent units",
          "Bidirectional RNNs",
          "Sequence-to-sequence models",
          "Encoder-decoder models",
          "Teacher forcing",
          "Beam search",
          "Connectionist temporal classification",
          "Temporal convolutional networks",
          "State-space models",
          "Neural ordinary differential equations",
          "Memory networks",
          "Pointer networks",
        ],
      },
      {
        id: "transformers",
        label: "Attention & Transformers",
        difficulty: "intermediate",
        concepts: [
          "Attention",
          "Self-attention",
          "Cross-attention",
          "Scaled dot-product attention",
          "Multi-head attention",
          "Queries keys and values",
          "Attention masks",
          "Causal masking",
          "Transformer",
          "Transformer encoder",
          "Transformer decoder",
          "Positional encoding",
          "Rotary position embeddings",
          "Relative position bias",
          "Vision transformers",
          "Sparse attention",
          "Linear attention",
          "Mixture of experts",
        ],
      },
      {
        id: "representation-learning",
        label: "Representation Learning",
        difficulty: "advanced",
        concepts: [
          "Representation learning",
          "Embeddings",
          "Embedding spaces",
          "Metric learning",
          "Contrastive learning",
          "Triplet loss",
          "Siamese networks",
          "Autoencoders",
          "Denoising autoencoders",
          "Masked modeling",
          "Predictive coding",
          "Disentangled representations",
          "Manifold learning",
          "Neural collapse",
          "Probing classifiers",
          "Mechanistic interpretability",
        ],
      },
    ],
  },
  {
    id: "generative-ai",
    label: "Generative AI",
    shortLabel: "Generative AI",
    color: "#ea580c",
    softColor: "#fff3e9",
    summary:
      "Models and applications that generate, transform, retrieve, and reason over text, images, audio, video, and code.",
    groups: [
      {
        id: "generative-models",
        label: "Generative Model Families",
        difficulty: "intermediate",
        concepts: [
          "Generative modeling",
          "Autoregressive models",
          "Latent variable generative models",
          "Variational autoencoders",
          "Evidence lower bound",
          "Generative adversarial networks",
          "GAN discriminator",
          "GAN generator",
          "Normalizing flows",
          "Energy-based models",
          "Diffusion models",
          "Score matching",
          "Denoising diffusion",
          "Flow matching",
          "Consistency models",
          "Neural radiance fields",
        ],
      },
      {
        id: "language-models",
        label: "Language Models",
        difficulty: "intermediate",
        concepts: [
          "Language modeling",
          "Large language models",
          "Foundation models",
          "Autoregressive language models",
          "Masked language models",
          "Next-token prediction",
          "Tokenization",
          "Byte-pair encoding",
          "Unigram tokenization",
          "Vocabulary",
          "Context windows",
          "In-context learning",
          "Emergent capabilities",
          "Scaling laws",
          "Compute-optimal training",
          "Synthetic data",
        ],
      },
      {
        id: "alignment-posttraining",
        label: "Post-training & Alignment",
        difficulty: "advanced",
        concepts: [
          "Supervised fine-tuning",
          "Instruction tuning",
          "Reinforcement learning from human feedback",
          "Reward modeling",
          "Preference learning",
          "Direct preference optimization",
          "Constitutional AI",
          "AI feedback",
          "Parameter-efficient fine-tuning",
          "Low-rank adaptation",
          "Prompt tuning",
          "Adapters",
          "Model merging",
          "Knowledge distillation",
          "Catastrophic forgetting",
          "Behavioral alignment",
        ],
      },
      {
        id: "prompting-reasoning",
        label: "Prompting & Reasoning",
        difficulty: "beginner",
        concepts: [
          "Prompt engineering",
          "System prompts",
          "Few-shot prompting",
          "Chain-of-thought prompting",
          "Self-consistency",
          "Tree of thoughts",
          "ReAct prompting",
          "Tool use",
          "Function calling",
          "Structured outputs",
          "Constrained decoding",
          "Reasoning models",
          "Test-time compute",
          "Prompt injection",
          "Jailbreaking",
          "Context engineering",
        ],
      },
      {
        id: "retrieval-agents",
        label: "Retrieval & Agents",
        difficulty: "intermediate",
        concepts: [
          "Retrieval-augmented generation",
          "Dense retrieval",
          "Sparse retrieval",
          "BM25",
          "Vector databases",
          "Semantic search",
          "Hybrid search",
          "Reranking",
          "Chunking",
          "Grounding",
          "AI agents",
          "Agent planning",
          "Agent memory",
          "Multi-agent systems",
          "Computer use agents",
          "Agent orchestration",
        ],
      },
      {
        id: "multimodal-generation",
        label: "Multimodal Generation",
        difficulty: "advanced",
        concepts: [
          "Multimodal models",
          "Vision-language models",
          "Text-to-image generation",
          "Image-to-image generation",
          "Text-to-video generation",
          "Text-to-speech generation",
          "Speech-to-speech models",
          "Audio generation",
          "Code generation",
          "Visual question answering",
          "Image captioning",
          "Multimodal embeddings",
          "Cross-modal alignment",
          "Latent diffusion",
          "Classifier-free guidance",
          "Controllable generation",
        ],
      },
    ],
  },
  {
    id: "reinforcement-learning",
    label: "Reinforcement Learning",
    shortLabel: "Reinforcement Learning",
    color: "#d97706",
    softColor: "#fff8e8",
    summary:
      "Learning to choose actions through reward, interaction, planning, and long-term credit assignment.",
    groups: [
      {
        id: "rl-formalism",
        label: "RL Foundations",
        difficulty: "beginner",
        concepts: [
          "Reinforcement learning",
          "Agent",
          "Environment",
          "State",
          "Observation",
          "Action",
          "Reward",
          "Trajectory",
          "Episode",
          "Return",
          "Discount factor",
          "Policy",
          "Markov property",
          "Markov decision processes",
          "Partially observable MDPs",
          "Credit assignment",
        ],
      },
      {
        id: "value-learning",
        label: "Value Learning",
        difficulty: "intermediate",
        concepts: [
          "State-value functions",
          "Action-value functions",
          "Bellman equations",
          "Bellman optimality",
          "Dynamic programming for RL",
          "Policy evaluation",
          "Policy iteration",
          "Value iteration",
          "Monte Carlo control",
          "Temporal-difference learning",
          "TD error",
          "TD lambda",
          "Eligibility traces",
          "SARSA",
          "Q-learning",
          "Double Q-learning",
        ],
      },
      {
        id: "deep-rl",
        label: "Deep Reinforcement Learning",
        difficulty: "advanced",
        concepts: [
          "Deep Q-networks",
          "Experience replay",
          "Target networks",
          "Double DQN",
          "Dueling DQN",
          "Prioritized replay",
          "Distributional RL",
          "Noisy networks",
          "Rainbow DQN",
          "Representation learning for RL",
          "Recurrent RL agents",
          "Intrinsic motivation",
          "Deep exploration",
          "Sample efficiency",
          "Stability in deep RL",
          "Sim-to-real transfer",
        ],
      },
      {
        id: "policy-optimization",
        label: "Policy Optimization",
        difficulty: "advanced",
        concepts: [
          "Policy gradients",
          "REINFORCE",
          "Baseline functions",
          "Advantage functions",
          "Actor-critic methods",
          "Advantage actor-critic",
          "Asynchronous advantage actor-critic",
          "Trust region policy optimization",
          "Proximal policy optimization",
          "Deterministic policy gradients",
          "Deep deterministic policy gradients",
          "Twin delayed DDPG",
          "Soft actor-critic",
          "Entropy regularization in RL",
          "Natural policy gradients",
          "Generalized advantage estimation",
        ],
      },
      {
        id: "planning-model-based",
        label: "Planning & Model-based RL",
        difficulty: "advanced",
        concepts: [
          "RL planning",
          "Model-based reinforcement learning",
          "Environment models",
          "World models",
          "Dyna architecture",
          "Monte Carlo tree search",
          "Upper confidence trees",
          "AlphaZero",
          "MuZero",
          "Model predictive control",
          "Trajectory optimization",
          "Imagination rollouts",
          "Latent dynamics models",
          "Planning horizon",
          "Search-policy improvement",
          "Decision-time planning",
        ],
      },
      {
        id: "rl-frontiers",
        label: "RL Frontiers",
        difficulty: "advanced",
        concepts: [
          "Multi-armed bandits",
          "Contextual bandits",
          "Exploration-exploitation tradeoff",
          "Epsilon-greedy exploration",
          "Upper confidence bounds",
          "Thompson sampling",
          "Offline reinforcement learning",
          "Imitation learning",
          "Behavior cloning",
          "Inverse reinforcement learning",
          "Multi-agent reinforcement learning",
          "Cooperative RL",
          "Competitive RL",
          "Hierarchical reinforcement learning",
          "Safe reinforcement learning",
          "Reward hacking",
        ],
      },
    ],
  },
  {
    id: "perception-language-robotics",
    label: "Perception, Language & Robotics",
    shortLabel: "Applied AI",
    color: "#0891b2",
    softColor: "#eafaff",
    summary:
      "AI capabilities for language, vision, speech, physical interaction, and structured environments.",
    groups: [
      {
        id: "natural-language-processing",
        label: "Natural Language Processing",
        difficulty: "beginner",
        concepts: [
          "Natural language processing",
          "Text normalization",
          "Stemming",
          "Lemmatization",
          "Part-of-speech tagging",
          "Named entity recognition",
          "Dependency parsing",
          "Constituency parsing",
          "Coreference resolution",
          "Semantic role labeling",
          "Sentiment analysis",
          "Machine translation",
          "Text summarization",
          "Question answering",
          "Information extraction",
          "Natural language inference",
        ],
      },
      {
        id: "computer-vision",
        label: "Computer Vision",
        difficulty: "intermediate",
        concepts: [
          "Computer vision",
          "Image classification",
          "Object detection",
          "Semantic segmentation",
          "Instance segmentation",
          "Panoptic segmentation",
          "Keypoint detection",
          "Pose estimation",
          "Optical flow",
          "Image registration",
          "Depth estimation",
          "Stereo vision",
          "Visual tracking",
          "Scene understanding",
          "OCR",
          "3D vision",
        ],
      },
      {
        id: "speech-audio",
        label: "Speech & Audio",
        difficulty: "intermediate",
        concepts: [
          "Speech recognition",
          "Automatic speech recognition",
          "Speech synthesis",
          "Speaker recognition",
          "Speaker diarization",
          "Keyword spotting",
          "Audio classification",
          "Source separation",
          "Music information retrieval",
          "Waveforms",
          "Spectrograms",
          "Mel-frequency cepstral coefficients",
          "Acoustic models",
          "Language models for speech",
          "Voice activity detection",
          "Neural vocoders",
        ],
      },
      {
        id: "robotics",
        label: "Robotics",
        difficulty: "advanced",
        concepts: [
          "Robotics",
          "Robot perception",
          "Robot localization",
          "Mapping",
          "SLAM",
          "Motion planning",
          "Path planning",
          "Robot control",
          "Kinematics",
          "Inverse kinematics",
          "Dynamics",
          "Grasping",
          "Manipulation",
          "Navigation",
          "Human-robot interaction",
          "Embodied AI",
        ],
      },
      {
        id: "knowledge-reasoning",
        label: "Knowledge & Reasoning",
        difficulty: "intermediate",
        concepts: [
          "Knowledge graphs",
          "Ontologies",
          "Semantic networks",
          "Expert systems",
          "Rule-based systems",
          "Fuzzy logic",
          "Probabilistic graphical models",
          "Bayesian networks",
          "Hidden Markov models",
          "Conditional random fields",
          "Factor graphs",
          "Message passing",
          "Belief propagation",
          "Classical planning",
          "Case-based reasoning",
          "Neuro-symbolic AI",
        ],
      },
      {
        id: "graph-learning",
        label: "Graph Machine Learning",
        difficulty: "advanced",
        concepts: [
          "Graph machine learning",
          "Graph neural networks",
          "Graph convolutions",
          "Message-passing neural networks",
          "Graph attention networks",
          "Node classification",
          "Link prediction",
          "Graph classification",
          "Graph embeddings",
          "Knowledge graph embeddings",
          "Graph transformers",
          "Geometric deep learning",
          "Equivariant neural networks",
          "Molecular property prediction",
          "Recommender graphs",
          "Temporal graphs",
        ],
      },
    ],
  },
  {
    id: "evaluation-safety",
    label: "Evaluation & Safety",
    shortLabel: "Evaluation & Safety",
    color: "#db2777",
    softColor: "#fff0f7",
    summary:
      "Ways to measure behavior, understand failures, reduce harm, and align systems with human goals.",
    groups: [
      {
        id: "predictive-metrics",
        label: "Predictive Metrics",
        difficulty: "beginner",
        concepts: [
          "Evaluation metrics",
          "Accuracy",
          "Precision",
          "Recall",
          "Specificity",
          "F1 score",
          "Confusion matrices",
          "Decision thresholds",
          "ROC curves",
          "ROC AUC",
          "Precision-recall curves",
          "PR AUC",
          "Mean squared error",
          "Mean absolute error",
          "R-squared",
          "Log loss",
        ],
      },
      {
        id: "evaluation-methods",
        label: "Evaluation Methods",
        difficulty: "intermediate",
        concepts: [
          "Calibration",
          "Reliability diagrams",
          "Brier score",
          "Ranking metrics",
          "Mean reciprocal rank",
          "Normalized discounted cumulative gain",
          "Recall at k",
          "Human evaluation",
          "Pairwise comparison",
          "A-B testing",
          "Benchmarking",
          "Ablation studies",
          "Error analysis",
          "Inter-rater reliability",
          "Statistical significance testing",
          "Evaluation leakage",
        ],
      },
      {
        id: "llm-evaluation",
        label: "Generative AI Evaluation",
        difficulty: "intermediate",
        concepts: [
          "LLM evaluation",
          "Exact match",
          "BLEU",
          "ROUGE",
          "BERTScore",
          "Pass at k",
          "LLM-as-a-judge",
          "Reference-free evaluation",
          "Groundedness evaluation",
          "Factuality evaluation",
          "Hallucination detection",
          "Retrieval evaluation",
          "Agent evaluation",
          "Tool-use evaluation",
          "Safety evaluation",
          "Adversarial evaluation",
        ],
      },
      {
        id: "interpretability",
        label: "Interpretability",
        difficulty: "advanced",
        concepts: [
          "Interpretability",
          "Explainable AI",
          "Feature importance",
          "Permutation importance",
          "Partial dependence plots",
          "SHAP values",
          "LIME",
          "Saliency maps",
          "Integrated gradients",
          "Activation maximization",
          "Concept activation vectors",
          "Feature visualization",
          "Circuit analysis",
          "Sparse autoencoders",
          "Model editing",
          "Counterfactual explanations",
        ],
      },
      {
        id: "responsible-ai",
        label: "Responsible AI",
        difficulty: "intermediate",
        concepts: [
          "Responsible AI",
          "Fairness",
          "Algorithmic bias",
          "Demographic parity",
          "Equalized odds",
          "Equal opportunity",
          "Fairness through unawareness",
          "Bias mitigation",
          "Transparency",
          "Accountability",
          "Privacy",
          "Differential privacy",
          "Data governance",
          "Model cards",
          "Dataset documentation",
          "AI governance",
        ],
      },
      {
        id: "robustness-alignment",
        label: "Robustness & Alignment",
        difficulty: "advanced",
        concepts: [
          "Robustness",
          "Adversarial examples",
          "Adversarial training",
          "Distributional robustness",
          "Red teaming",
          "Alignment",
          "Outer alignment",
          "Inner alignment",
          "Scalable oversight",
          "Interpretability for safety",
          "Goal misgeneralization",
          "Specification gaming",
          "Reward misspecification",
          "Uncertainty estimation",
          "Selective prediction",
          "AI incident response",
        ],
      },
    ],
  },
  {
    id: "ai-systems",
    label: "AI Systems & MLOps",
    shortLabel: "AI Systems",
    color: "#0f766e",
    softColor: "#ebfaf7",
    summary:
      "Data, compute, deployment, optimization, monitoring, and operations for reliable AI products.",
    groups: [
      {
        id: "data-engineering",
        label: "Data Engineering",
        difficulty: "intermediate",
        concepts: [
          "Data pipelines",
          "ETL",
          "ELT",
          "Data lakes",
          "Data warehouses",
          "Feature stores",
          "Data versioning",
          "Dataset curation",
          "Data validation",
          "Data lineage",
          "Streaming data",
          "Batch data processing",
          "Labeling pipelines",
          "Human-in-the-loop labeling",
          "Synthetic data pipelines",
          "Data quality monitoring",
        ],
      },
      {
        id: "training-infrastructure",
        label: "Training Infrastructure",
        difficulty: "advanced",
        concepts: [
          "Accelerators",
          "GPUs",
          "TPUs",
          "Distributed training",
          "Data parallelism",
          "Model parallelism",
          "Tensor parallelism",
          "Pipeline parallelism",
          "Fully sharded data parallelism",
          "ZeRO optimization",
          "All-reduce",
          "Checkpointing",
          "Fault-tolerant training",
          "Experiment tracking",
          "Reproducibility",
          "Training orchestration",
        ],
      },
      {
        id: "inference-serving",
        label: "Inference & Serving",
        difficulty: "intermediate",
        concepts: [
          "Model inference",
          "Online inference",
          "Batch inference",
          "Model serving",
          "Autoscaling",
          "Dynamic batching",
          "Continuous batching",
          "KV cache",
          "Speculative decoding",
          "Prefix caching",
          "Streaming responses",
          "Time to first token",
          "Throughput",
          "Tail latency",
          "Load shedding",
          "Graceful degradation",
        ],
      },
      {
        id: "model-optimization",
        label: "Model Optimization",
        difficulty: "advanced",
        concepts: [
          "Quantization",
          "Post-training quantization",
          "Quantization-aware training",
          "Integer quantization",
          "4-bit quantization",
          "Weight-only quantization",
          "Pruning",
          "Structured pruning",
          "Unstructured pruning",
          "Distillation for deployment",
          "Operator fusion",
          "Kernel optimization",
          "Compilation",
          "ONNX",
          "TensorRT",
          "Memory optimization",
        ],
      },
      {
        id: "mlops",
        label: "MLOps",
        difficulty: "intermediate",
        concepts: [
          "MLOps",
          "Model registries",
          "Model versioning",
          "CI-CD for ML",
          "Continuous training",
          "Canary deployments",
          "Shadow deployments",
          "A-B model deployments",
          "Rollback strategies",
          "Model monitoring",
          "Drift monitoring",
          "Performance monitoring",
          "Cost monitoring",
          "Observability",
          "Service-level objectives",
          "Incident management",
        ],
      },
      {
        id: "llm-systems",
        label: "LLM & Agent Systems",
        difficulty: "advanced",
        concepts: [
          "LLM application architecture",
          "Model gateways",
          "Model routing",
          "Model fallbacks",
          "Prompt management",
          "Semantic caching",
          "Guardrails",
          "Content moderation",
          "Rate limiting",
          "Token budgets",
          "Cost per request",
          "Agent runtimes",
          "Tool sandboxes",
          "Durable workflows",
          "Human approval gates",
          "LLM observability",
        ],
      },
    ],
  },
];

const coreDetails: Record<
  string,
  Partial<Pick<AtlasConcept, "description" | "whyItMatters" | "playgroundSlug">>
> = {
  "Artificial Intelligence": {
    description:
      "The broad field of building machines that perceive, reason, learn, communicate, or act toward goals.",
    whyItMatters:
      "It connects many different traditions: symbolic reasoning, statistical learning, neural computation, and decision-making.",
  },
  "Linear algebra": {
    description:
      "The mathematics of vectors, matrices, linear transformations, and geometric structure.",
    whyItMatters:
      "Most modern models represent data and parameters as vectors, matrices, or tensors.",
  },
  "Matrix multiplication": {
    description:
      "An operation that combines rows and columns to compose linear transformations.",
    whyItMatters:
      "Dense layers, attention projections, and batched tensor programs all rely on it.",
    playgroundSlug: "matrix-multiplication",
  },
  "Conditional probability": {
    playgroundSlug: "conditional-probability",
  },
  "Bayes rule": {
    playgroundSlug: "bayes-rule",
  },
  "Cross entropy": {
    playgroundSlug: "categorical-cross-entropy",
  },
  "KL divergence": {
    playgroundSlug: "kl-divergence",
  },
  "Gradient descent": {
    playgroundSlug: "gradient-descent",
  },
  "Overfitting": {
    playgroundSlug: "overfitting",
  },
  "K-means clustering": {
    description:
      "An iterative clustering method that assigns points to the nearest centroid and then updates each centroid.",
    whyItMatters:
      "It is a simple, influential example of unsupervised learning and alternating optimization.",
  },
  "Neural Networks": {
    description:
      "Layered differentiable models that learn representations by adjusting connected weights.",
    whyItMatters:
      "They are the foundation of most deep-learning architectures.",
  },
  "Backpropagation": {
    playgroundSlug: "backpropagation-inspector",
  },
  "Automatic differentiation": {
    playgroundSlug: "autograd-graphs",
  },
  "Batch normalization": {
    playgroundSlug: "batch-normalization",
  },
  "Layer normalization": {
    playgroundSlug: "layer-normalization",
  },
  "Attention": {
    description:
      "A mechanism that computes weighted combinations so a model can focus on the most relevant information.",
    whyItMatters:
      "Attention lets models connect distant or context-dependent pieces of an input.",
    playgroundSlug: "transformer-attention",
  },
  "Transformer": {
    description:
      "A neural architecture that uses attention to mix information across a sequence in parallel.",
    whyItMatters:
      "Transformers power many modern language, vision, audio, and multimodal systems.",
    playgroundSlug: "transformer-attention",
  },
  "Large language models": {
    description:
      "Large neural language models trained on broad text or multimodal corpora to predict and generate sequences.",
    whyItMatters:
      "They provide a general interface for language, code, tool use, retrieval, and reasoning tasks.",
  },
  "Byte-pair encoding": {
    playgroundSlug: "byte-pair-encoding",
  },
  "Diffusion models": {
    description:
      "Generative models that learn to reverse a gradual noising process.",
    whyItMatters:
      "They are a leading approach for high-quality image, audio, video, and multimodal generation.",
  },
  "Retrieval-augmented generation": {
    description:
      "A pattern that retrieves external evidence and supplies it to a generative model at request time.",
    whyItMatters:
      "Retrieval can add current or private knowledge and make answers easier to ground in sources.",
  },
  "Reinforcement learning": {
    description:
      "Learning how to act through interaction so expected long-term reward improves.",
    whyItMatters:
      "It formalizes sequential decisions where actions change future states and consequences.",
  },
  "Q-learning": {
    description:
      "An off-policy temporal-difference algorithm that learns the value of taking an action in a state.",
    whyItMatters:
      "It shows how an agent can learn toward an optimal policy without a model of the environment.",
  },
  "Monte Carlo tree search": {
    playgroundSlug: "monte-carlo-tree-search",
  },
  "Calibration": {
    description:
      "Agreement between predicted confidence and observed outcome frequency.",
    whyItMatters:
      "A calibrated 70% prediction should be correct about 70% of the time, making uncertainty more actionable.",
  },
  "Confusion matrices": {
    playgroundSlug: "confusion-matrix-thresholds",
  },
  "Fairness": {
    description:
      "The study and practice of measuring and reducing unjust performance or treatment differences.",
    whyItMatters:
      "Models can reproduce or amplify inequities even when aggregate performance looks strong.",
  },
  "Alignment": {
    description:
      "The challenge of making an AI system's behavior reliably match intended goals, constraints, and human values.",
    whyItMatters:
      "Capability alone does not guarantee that a system pursues the right objective or behaves safely under pressure.",
  },
  "Quantization": {
    description:
      "Representing model values with fewer or lower-precision numeric levels.",
    whyItMatters:
      "Quantization can reduce memory, bandwidth, energy use, and inference latency at a possible accuracy cost.",
    playgroundSlug: "linear-quantization-int4",
  },
};

const relationshipLabels: Record<
  string,
  { prerequisites?: string[]; related?: string[] }
> = {
  "Matrix multiplication": { prerequisites: ["Vectors", "Matrices", "Dot product"] },
  "Gradient descent": { prerequisites: ["Gradients", "Optimization"] },
  "Maximum likelihood estimation": {
    prerequisites: ["Probability distributions", "Likelihood"],
  },
  "Cross entropy": { prerequisites: ["Probability distributions", "Entropy"] },
  "KL divergence": { prerequisites: ["Entropy", "Probability distributions"] },
  "Linear regression": { prerequisites: ["Linear algebra", "Least squares"] },
  "Logistic regression": {
    prerequisites: ["Linear regression", "Sigmoid activation"],
  },
  "K-means clustering": {
    prerequisites: ["Vectors", "Vector norms"],
    related: ["Gaussian mixture models", "Hierarchical clustering"],
  },
  "Principal component analysis": {
    prerequisites: ["Linear algebra", "Eigenvectors"],
    related: ["Singular value decomposition", "Low-rank approximation"],
  },
  "Neural Networks": { prerequisites: ["Linear algebra"] },
  "Backpropagation": { prerequisites: ["Chain rule", "Computational graphs"] },
  "Automatic differentiation": { prerequisites: ["Chain rule", "Computational graphs"] },
  "Convolutional neural networks": {
    prerequisites: ["Neural Networks", "Convolution"],
  },
  "Attention": {
    prerequisites: ["Neural Networks"],
    related: ["Dot product", "Softmax"],
  },
  "Self-attention": { prerequisites: ["Attention"] },
  "Multi-head attention": { prerequisites: ["Self-attention"] },
  "Transformer": { prerequisites: ["Attention"] },
  "Vision transformers": {
    prerequisites: ["Transformer", "Computer vision"],
    related: ["Convolutional neural networks"],
  },
  "Large language models": {
    prerequisites: ["Transformer", "Language modeling", "Tokenization"],
  },
  "Byte-pair encoding": { prerequisites: ["Tokenization", "Data compression"] },
  "Retrieval-augmented generation": {
    prerequisites: ["Large language models", "Dense retrieval"],
    related: ["Grounding", "Vector databases"],
  },
  "AI agents": {
    prerequisites: ["Large language models", "Tool use", "Agent planning"],
  },
  "Diffusion models": {
    prerequisites: ["Probability distributions", "Neural Networks"],
  },
  "Markov decision processes": {
    prerequisites: ["Markov chains", "Conditional probability"],
  },
  "State-value functions": { prerequisites: ["Markov decision processes", "Return"] },
  "Action-value functions": { prerequisites: ["State-value functions", "Action"] },
  "Q-learning": {
    prerequisites: ["Action-value functions", "Temporal-difference learning"],
    related: ["SARSA", "Deep Q-networks"],
  },
  "Double Q-learning": { prerequisites: ["Q-learning"] },
  "Deep Q-networks": {
    prerequisites: ["Q-learning", "Neural Networks"],
  },
  "Policy gradients": {
    prerequisites: ["Policy", "Gradients", "Return"],
  },
  "Actor-critic methods": {
    prerequisites: ["Policy gradients", "State-value functions"],
  },
  "Proximal policy optimization": {
    prerequisites: ["Actor-critic methods", "Advantage functions"],
  },
  "Monte Carlo tree search": {
    prerequisites: ["Trees", "Monte Carlo estimation", "RL planning"],
  },
  "Calibration": {
    prerequisites: ["Probability", "Decision thresholds"],
    related: ["Brier score", "Uncertainty estimation"],
  },
  "SHAP values": {
    prerequisites: ["Feature importance", "Cooperative game theory"],
  },
  "Quantization": {
    prerequisites: ["Floating-point arithmetic", "Model inference"],
  },
};

const virtualFoundationLabels = [
  "Likelihood",
  "Floating-point arithmetic",
  "Cooperative game theory",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const baseConcepts: AtlasConcept[] = [
  {
    id: "artificial-intelligence",
    label: "Artificial Intelligence",
    kind: "root",
    domainId: "root",
    difficulty: "beginner",
    description: coreDetails["Artificial Intelligence"].description ?? "",
    whyItMatters: coreDetails["Artificial Intelligence"].whyItMatters ?? "",
    prerequisiteIds: [],
    relatedIds: [],
  },
];

for (const domain of atlasDomains) {
  baseConcepts.push({
    id: domain.id,
    label: domain.label,
    kind: "domain",
    domainId: domain.id,
    parentId: "artificial-intelligence",
    difficulty: "beginner",
    description: domain.summary,
    whyItMatters: `This domain organizes ${domain.groups.length} connected areas of study so learners can move from broad ideas to specific methods.`,
    prerequisiteIds: [],
    relatedIds: [],
  });

  for (const group of domain.groups) {
    const groupId = `${domain.id}-${group.id}`;
    baseConcepts.push({
      id: groupId,
      label: group.label,
      kind: "group",
      domainId: domain.id,
      groupId: group.id,
      parentId: domain.id,
      difficulty: group.difficulty,
      description: `${group.label} groups ${group.concepts.length} closely related ideas inside ${domain.label}.`,
      whyItMatters:
        "This branch provides a manageable entry point into a larger part of the atlas.",
      prerequisiteIds: [],
      relatedIds: [],
    });

    for (const label of group.concepts) {
      const detail = coreDetails[label] ?? {};
      baseConcepts.push({
        id: `${groupId}-${slugify(label)}`,
        label,
        kind: "concept",
        domainId: domain.id,
        groupId: group.id,
        parentId: groupId,
        difficulty: group.difficulty,
        description:
          detail.description ??
          `${label} is a concept in ${group.label}, within ${domain.label}.`,
        whyItMatters:
          detail.whyItMatters ??
          `Understanding ${label} helps connect neighboring ideas in ${group.label}.`,
        prerequisiteIds: [],
        relatedIds: [],
        playgroundSlug: detail.playgroundSlug,
      });
    }
  }
}

const foundationsGroup = baseConcepts.find(
  (concept) => concept.id === "foundations-computer-science",
);

for (const label of virtualFoundationLabels) {
  baseConcepts.push({
    id: `foundations-computer-science-${slugify(label)}`,
    label,
    kind: "concept",
    domainId: "foundations",
    groupId: "computer-science",
    parentId: foundationsGroup?.id ?? "foundations",
    difficulty: "intermediate",
    description: `${label} is a supporting mathematical or computational idea used elsewhere in the atlas.`,
    whyItMatters: `It supplies prerequisite vocabulary for connected AI and machine-learning methods.`,
    prerequisiteIds: [],
    relatedIds: [],
  });
}

const idByLabel = new Map<string, string>();
for (const concept of baseConcepts) {
  if (!idByLabel.has(concept.label)) {
    idByLabel.set(concept.label, concept.id);
  }
}

function idsForLabels(labels: string[] | undefined) {
  return (labels ?? []).flatMap((label) => {
    const id = idByLabel.get(label);
    return id ? [id] : [];
  });
}

export const atlasConcepts: AtlasConcept[] = baseConcepts.map((concept) => {
  const relationships = relationshipLabels[concept.label];
  return {
    ...concept,
    prerequisiteIds: idsForLabels(relationships?.prerequisites),
    relatedIds: idsForLabels(relationships?.related),
  };
});

export const atlasConceptById = new Map(
  atlasConcepts.map((concept) => [concept.id, concept]),
);

export const atlasDomainById = new Map(
  atlasDomains.map((domain) => [domain.id, domain]),
);

export const defaultAtlasConceptId =
  idByLabel.get("Transformer") ?? "artificial-intelligence";

export const atlasSources = [
  {
    label: "ACM Computing Classification System",
    href: "https://dl.acm.org/ccs",
  },
  {
    label: "Google Machine Learning Glossary",
    href: "https://developers.google.com/machine-learning/glossary",
  },
  {
    label: "Reinforcement Learning: An Introduction",
    href: "https://mitpress.mit.edu/9780262039246/reinforcement-learning/",
  },
  {
    label: "Stanford AI Index",
    href: "https://hai.stanford.edu/ai-index",
  },
];
