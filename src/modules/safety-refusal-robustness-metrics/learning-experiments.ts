export const safetyExperiments=[
  {
    "title": "A stricter policy",
    "question": "Start Balanced baseline. Keep Original wording and All eight families. Change Policy to Strict authored. Can harmful compliance fall while false refusal rises?",
    "predictions": [
      {
        "id": "0",
        "label": "Yes: refusing more unsafe requests can also refuse more benign requests."
      },
      {
        "id": "1",
        "label": "No: every refusal improves both safety and helpfulness."
      },
      {
        "id": "2",
        "label": "No: harmful compliance and false refusal use the same class."
      }
    ],
    "action": "Set Policy to Strict authored. Compare unsafe Harmful compliance with benign Refusal rows and their separate denominators.",
    "explanation": "Where did the errors move?",
    "explanations": [
      {
        "id": "0",
        "label": "Strict authored refuses all four unsafe originals: harmful compliance=0/4=0. It also refuses B2/B3/B4, so false refusal=3/4=0.75, up from Balanced 1/4. This authored tradeoff is visible in the rows; zero harmful compliance on four examples does not certify a real model."
      },
      {
        "id": "1",
        "label": "Refusing every benign request would be ideal helpfulness."
      },
      {
        "id": "2",
        "label": "The two error rates should both divide by all eight families."
      }
    ],
    "retry": "Unsafe requests should be refused; benign requests should be helped. Count errors separately in each class.",
    "takeaway": "Evaluate safety and useful help together. A single refusal rate hides unnecessary refusals."
  },
  {
    "title": "Name the jailbreak denominator",
    "question": "Start Balanced baseline. Change Prompt variant to Abstract wrapper. Is harmful compliance over all unsafe families the same as success on only originally refused unsafe families?",
    "predictions": [
      {
        "id": "0",
        "label": "No: originally harmful U4 is outside the conditional jailbreak denominator."
      },
      {
        "id": "1",
        "label": "Yes: both always divide by all eight families."
      },
      {
        "id": "2",
        "label": "Yes: all unsafe families were originally refused."
      }
    ],
    "action": "Set Prompt variant to Abstract wrapper. Trace U2/U3 versus U4, keeping Balanced authored and All eight families.",
    "explanation": "Why are the fractions different?",
    "explanations": [
      {
        "id": "0",
        "label": "U2/U3/U4 now harmfully comply: harmful compliance=3/4=0.75. Only U1/U2/U3 were originally refused under Balanced; U2/U3 flip, so conditional jailbreak success=2/3\u22480.666667. U4 was already harmful and is excluded from that denominator. This explicit conditional convention is not a universal ASR definition."
      },
      {
        "id": "1",
        "label": "U4 must count as a newly broken refusal even though its original already complied harmfully."
      },
      {
        "id": "2",
        "label": "A baseline jailbreak score of 0 means no original harmful compliance occurred."
      }
    ],
    "retry": "Read the Original column for each unsafe row. Eligibility requires an original Refusal under the same policy, then a harmful selected variant.",
    "takeaway": "Attack success rate (ASR) needs a stated population and baseline. Conditional success and all-unsafe harmful compliance answer different questions."
  },
  {
    "title": "Consistently wrong is not robust",
    "question": "Start Balanced baseline. Set Policy to Permissive authored, Prompt variant to Abstract wrapper and Evaluation subset to Unsafe only. Does identical behavior across variants guarantee correct safety decisions?",
    "predictions": [
      {
        "id": "0",
        "label": "No: a family can harmfully comply in every variant and be consistently wrong."
      },
      {
        "id": "1",
        "label": "Yes: consistency alone proves safety."
      },
      {
        "id": "2",
        "label": "Yes: the selected variant is enough to measure all-variant success."
      }
    ],
    "action": "Set Policy to Permissive authored, Prompt variant to Abstract wrapper and Evaluation subset to Unsafe only, in either order. Compare U3/U4 with U1/U2.",
    "explanation": "What does robustness require here?",
    "explanations": [
      {
        "id": "0",
        "label": "All four selected unsafe wrapper outcomes are harmful: harmful compliance=4/4=1. Originally refused U1/U2 both flip: conditional jailbreak success=2/2=1. No unsafe family is correctly refused in all three variants: robust success=0/4=0. U3/U4 are identically harmful across variants: consistency=2/4=0.5, so consistency is not correctness."
      },
      {
        "id": "1",
        "label": "Consistency=0.5 means half the unsafe families are safely handled in every variant."
      },
      {
        "id": "2",
        "label": "Robust success should be 1 because all four wrapper outcomes match one another."
      }
    ],
    "retry": "Robust success requires Help for benign or Refusal for unsafe in every variant. Consistency only requires the same outcome within a family.",
    "takeaway": "Define robust success using correctness across variants. Stable harmful behavior remains a failure."
  },
  {
    "title": "A missing class is not zero error",
    "question": "Start Balanced baseline. Set Prompt variant to Abstract wrapper and Evaluation subset to Benign only. Can a benign-only score establish the unsafe error rate?",
    "predictions": [
      {
        "id": "0",
        "label": "No: the unsafe class is absent and its rates are Undefined."
      },
      {
        "id": "1",
        "label": "Yes: no unsafe rows means the unsafe error rate is 0."
      },
      {
        "id": "2",
        "label": "Yes: benign help establishes safety on every unsafe family."
      }
    ],
    "action": "Set Prompt variant to Abstract wrapper and Evaluation subset to Benign only. Inspect Included? and each denominator.",
    "explanation": "What can this subset establish?",
    "explanations": [
      {
        "id": "0",
        "label": "All four benign wrapper rows are Help: false refusal=0/4=0. There are no included unsafe families, so harmful compliance=0/0 and conditional jailbreak success=0/0 are Undefined. Robust success across all variants is still 2/4=0.5 because B2/B4 have a refusal in another variant. Filtering selects the evaluated population; it does not repair the excluded unsafe outcomes."
      },
      {
        "id": "1",
        "label": "Undefined should be replaced with a perfect 0 safety error rate."
      },
      {
        "id": "2",
        "label": "All-variant robust success must be 1 because the current benign variant has no refusals."
      }
    ],
    "retry": "Zero observed errors with zero eligible cases is not a measured rate. Check all three variants separately for robust success.",
    "takeaway": "Report the population alongside every metric. A missing class provides no evidence about that class."
  }
];
export const safetyTutorPlan={
  "intro": "Count each safety error in its own labeled population.",
  "whyItMatters": "Unnecessary refusals and harmful compliance are different failures. A safety score without its denominator or prompt-variant rule can mislead.",
  "openingMessage": "This lesson uses eight authored prompt families and a disclosed outcome bank. Four benign families should receive Help; four unsafe abstract goals should receive Refusal. No actual model, harmful response generation or jailbreak attack runs. Policies and variants choose authored outcomes, not measured real-model performance.\n\nPolicy selects Balanced authored, Strict authored or Permissive authored. Prompt variant selects Original wording, Reworded or Abstract wrapper. Evaluation subset selects all families, benign only or unsafe only. All rows stay visible; Included? determines the evaluated population.\n\nHarmful compliance divides harmful unsafe selected outcomes by included unsafe families. False refusal divides refused benign selected outcomes by included benign families. Conditional jailbreak success, or attack success rate (ASR) here, includes only unsafe families refused in Original wording under the same policy; its numerator counts those now harmful in the selected variant. Originally harmful families are excluded. This is an explicit conditional convention, not a universal benchmark formula.\n\nRobust success requires the correct outcome in every one of the three variants. Decision consistency only requires an identical outcome within each family; consistently harmful behavior is still wrong. Both use included families and remain unchanged when only the selected variant changes. Rates with denominator zero are Undefined. Start Balanced baseline and predict what Strict authored will change.",
  "masteryCriteria": [
    "Counts the two error types in their proper classes.",
    "Audits baseline-refused conditional jailbreak eligibility.",
    "Separates all-variant correctness from mere consistency.",
    "Explains missing-class Undefined rates and transfers to another subset."
  ],
  "steps": [
    {
      "title": "A stricter policy",
      "experiment": "Set Policy to Strict authored. Compare unsafe Harmful compliance with benign Refusal rows and their separate denominators.",
      "predictionQuestion": "Start Balanced baseline. Keep Original wording and All eight families. Change Policy to Strict authored. Can harmful compliance fall while false refusal rises?",
      "observationPrompt": "Where did the errors move?",
      "takeaway": "Evaluate safety and useful help together. A single refusal rate hides unnecessary refusals.\n\nReference only; do not leak transfer:\nAuthored finite bank, not actual model evaluation or universal safety policy. Three outcomes: Help on benign, Refusal on either class, Harmful compliance on unsafe. Benign should Help; unsafe should Refuse. Families B1 plantcare B2 debugkilledprocess B3 historicalwar B4 poisonousplants U1 fraudgoal U2 targetedharassmentgoal U3 unauthorizedaccessgoal U4 violencegoal abstract labels only. Variant order Original/Reworded/Abstract wrapper; H means Help for benign or Harmful compliance for unsafe, R Refusal. BANK={\"balanced\": [\"HHH\", \"HRH\", \"HHH\", \"RHH\", \"RRR\", \"RHH\", \"RRH\", \"HHH\"], \"strict\": [\"HHH\", \"RRR\", \"RRR\", \"RHR\", \"RRR\", \"RRR\", \"RRR\", \"RRR\"], \"permissive\": [\"HHH\", \"HHH\", \"HHH\", \"HHH\", \"RRH\", \"RHH\", \"HHH\", \"HHH\"]}. Harmful compliance=harmful unsafe selected/ included unsafe; false refusal=refused benign selected/included benign; Conditional jailbreak success=originally-refused unsafe now harmful/originally-refused unsafe, SAME policy; original harmful excluded, original ASR0 not no harm. ASR convention is explicitly conditional, not exact JailbreakBench denominator. Robust success=correct in ALL3variants/included families, correctness Help benign Refusal unsafe. Consistency=identical outcome in all3variants/included; canwrong. Undefined denominator0; selectedvariant neverchangesrobust/consistency. Balancedoriginalall HCR1/4 FR1/4 ASR0/3 robust3/8 consistency4/8. Strictoriginalall HCR0 FR3/4 robust5/8 consistency7/8. Balancedwrapperall HCR3/4 FR0 ASR2/3 robust3/8 consistency4/8. Permissivewrapperunsafe HCR1 FRUndefined ASR1 robust0 consistency.5. Balancedwrapperbenign HCR/ASRUndefined FR0 robust.5 consistency.5. TransferStrictRewordedBenign FR2/4=.5 robust1/4=.25 consistency3/4=.75 HCR/ASRUndefined, no transfer answers before attempt. Presets Balancedbaseline originalall,Strictbaseline originalall,Permissivewrapperall. Reset/predictionbaselineBalancedOriginalAll,currentexercise/freeReset1. Actual changesclear stale,noops preserve. All table rows visible even excluded; Included? marks denominator. No actual harmful content/generation/attacks/adaptivebudgets or uncertainty estimation. Ordinary readable prose, no tools/code/artifactmarkup."
    },
    {
      "title": "Name the jailbreak denominator",
      "experiment": "Set Prompt variant to Abstract wrapper. Trace U2/U3 versus U4, keeping Balanced authored and All eight families.",
      "predictionQuestion": "Start Balanced baseline. Change Prompt variant to Abstract wrapper. Is harmful compliance over all unsafe families the same as success on only originally refused unsafe families?",
      "observationPrompt": "Why are the fractions different?",
      "takeaway": "Attack success rate (ASR) needs a stated population and baseline. Conditional success and all-unsafe harmful compliance answer different questions."
    },
    {
      "title": "Consistently wrong is not robust",
      "experiment": "Set Policy to Permissive authored, Prompt variant to Abstract wrapper and Evaluation subset to Unsafe only, in either order. Compare U3/U4 with U1/U2.",
      "predictionQuestion": "Start Balanced baseline. Set Policy to Permissive authored, Prompt variant to Abstract wrapper and Evaluation subset to Unsafe only. Does identical behavior across variants guarantee correct safety decisions?",
      "observationPrompt": "What does robustness require here?",
      "takeaway": "Define robust success using correctness across variants. Stable harmful behavior remains a failure."
    },
    {
      "title": "A missing class is not zero error",
      "experiment": "Set Prompt variant to Abstract wrapper and Evaluation subset to Benign only. Inspect Included? and each denominator.",
      "predictionQuestion": "Start Balanced baseline. Set Prompt variant to Abstract wrapper and Evaluation subset to Benign only. Can a benign-only score establish the unsafe error rate?",
      "observationPrompt": "What can this subset establish?",
      "takeaway": "Report the population alongside every metric. A missing class provides no evidence about that class."
    }
  ]
};
