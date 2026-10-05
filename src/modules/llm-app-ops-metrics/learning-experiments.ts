export const opsExperiments=[
  {
    "title": "Stream or buffer",
    "question": "Start Spaced requests. Keep 4 tokens, unique prefixes and cache Off. Change Delivery to Buffer until complete. Does the model generate its first token later, or does only the client see it later?",
    "predictions": [
      {
        "id": "0",
        "label": "Only client delivery changes; model generation timing stays fixed."
      },
      {
        "id": "1",
        "label": "Streaming makes the model generate its tokens faster."
      },
      {
        "id": "2",
        "label": "Buffering reduces the number of billed output tokens."
      }
    ],
    "action": "Set Delivery to Buffer until complete. Compare Model TTFT, Client first delay and full Latency, keeping other controls fixed.",
    "explanation": "Which clock moved?",
    "explanations": [
      {
        "id": "0",
        "label": "Model TTFT stays 450 ms: 0 queue + 400 prefill + 50 for the first token. Full latency stays 600 ms: 400 + 4\u00d750. Streaming exposes the first token at 450 ms; buffering withholds content until 600 ms. Mean cost stays 0.128 fictional credits. Delivery changes client first content, not model generation or completion in this toy."
      },
      {
        "id": "1",
        "label": "Buffering raises Model TTFT to 600 ms because no token has been generated before delivery."
      },
      {
        "id": "2",
        "label": "Streaming makes full completion 450 ms even though three more tokens remain."
      }
    ],
    "retry": "Separate token generation from client delivery. Buffering waits until all four output tokens exist; it does not change worker times.",
    "takeaway": "A quicker first visible response can improve perceived responsiveness without shortening full completion."
  },
  {
    "title": "Longer output, same first token",
    "question": "Start Spaced requests. Keep Stream tokens and cache Off. Increase Output tokens from 4 tokens to 8 tokens. Must first-token delay grow just because more tokens follow it?",
    "predictions": [
      {
        "id": "0",
        "label": "No: first-token generation stays fixed while completion time and output charge grow."
      },
      {
        "id": "1",
        "label": "Yes: all metrics must double with output length."
      },
      {
        "id": "2",
        "label": "No: all eight tokens are delivered when the first token appears."
      }
    ],
    "action": "Set Output tokens to 8 tokens. Compare the first marker, decode length, latency and output charge in the exact ledgers.",
    "explanation": "What work did you add?",
    "explanations": [
      {
        "id": "0",
        "label": "Model TTFT and client first delay stay 450 ms. Completion grows from 600 to 800 ms because decode grows from 4\u00d750=200 to 8\u00d750=400 ms. Input charge stays 0.12; output charge grows from 0.008 to 0.016, so mean cost becomes 0.136 fictional credits. This model holds first-token work fixed; real serving behavior can depend on many other factors."
      },
      {
        "id": "1",
        "label": "Model TTFT must become 800 ms because the complete response has eight tokens."
      },
      {
        "id": "2",
        "label": "Mean cost remains 0.128 because output tokens are free."
      }
    ],
    "retry": "The first token is generated after one 50 ms output step. All N output steps contribute to full completion and output charge.",
    "takeaway": "First-token timing and total output work are separate. Always report token counts with latency and cost."
  },
  {
    "title": "A burst builds a queue",
    "question": "Start Spaced requests with 4 tokens, Stream tokens and cache Off. Change Request pattern to Burst unique prefixes. Can mean latency increase while finite-window throughput also increases?",
    "predictions": [
      {
        "id": "0",
        "label": "Yes: later requests wait longer while the four-request window loses idle gaps."
      },
      {
        "id": "1",
        "label": "No: throughput is always exactly reciprocal mean latency."
      },
      {
        "id": "2",
        "label": "Yes: the burst makes each request use fewer output tokens."
      }
    ],
    "action": "Set Request pattern to Burst unique prefixes. Read all four Queue ms entries and the observation span used for throughput.",
    "explanation": "Why do both numbers rise?",
    "explanations": [
      {
        "id": "0",
        "label": "The single worker takes 600 ms per request. Burst queues are 0,600,1200,1800 ms; latencies are 600,1200,1800,2400, so mean latency=1500 ms and Model TTFT=1350 ms. All 16 output tokens finish in 2.4 seconds: output throughput=6.666667 tokens/s and requests=1.666667/s. Spaced requests used 3.6 seconds including idle gaps, yielding 4.444444 tokens/s. This finite window is not a steady-state capacity claim; each request still costs 0.128 credits."
      },
      {
        "id": "1",
        "label": "Throughput must equal 1/1.5 seconds, regardless of concurrent arrivals and the four-request window."
      },
      {
        "id": "2",
        "label": "Queueing changes the 400 ms prefill constant or makes output tokens cheaper."
      }
    ],
    "retry": "Latency is per request from its arrival. Throughput counts completed work over the whole first-arrival-to-last-completion window, including idle time.",
    "takeaway": "Queueing can hurt individual responsiveness while a busier finite observation window shows more completed work per second."
  },
  {
    "title": "Reuse a prefix, not an answer",
    "question": "Start Spaced requests. Set Request pattern to Spaced repeated prefix and Prefix cache to On \u00b7 Cold at start, keeping 4 tokens and Stream tokens. Does cache reuse remove output generation or make every request a hit?",
    "predictions": [
      {
        "id": "0",
        "label": "No: the first request misses; later prefixes hit, while every answer is decoded."
      },
      {
        "id": "1",
        "label": "Yes: all four requests hit because the toggle is On."
      },
      {
        "id": "2",
        "label": "Yes: a prefix-cache hit returns the entire stored answer without decoding."
      }
    ],
    "action": "Set Request pattern to Spaced repeated prefix and Prefix cache to On \u00b7 Cold at start, in either order. Inspect prefix IDs, Hit?, prefill and charges.",
    "explanation": "Which work was reused?",
    "explanations": [
      {
        "id": "0",
        "label": "R1 is a cold miss; R2/R3/R4 share prefix A and hit: request-hit rate=3/4=0.75. Prefill is 400,100,100,100 ms, so mean=175 ms; every answer still needs 4\u00d750=200 ms decode. Mean Model TTFT=225 ms, mean latency=375 ms. Miss cost=0.128, hit cost=0.053; mean cost=0.07175 credits. Cache reuses the 100-token prefix, not the output; unique prefixes produce no hits even with cache On."
      },
      {
        "id": "1",
        "label": "All four requests hit, so cache-hit rate is 1 and prefill is 0."
      },
      {
        "id": "2",
        "label": "Prefix caching eliminates all output-token time and output-token charges."
      }
    ],
    "retry": "Every recalculation starts with an empty cache. Count which prefix appeared earlier; a hit still processes the suffix and generates all output tokens.",
    "takeaway": "Cache benefits depend on reusable prefixes and the observed population. Prompt reuse and answer caching are different mechanisms."
  }
];
export const opsTutorPlan={
  "intro": "Trace first response, full completion and completed work through one request timeline.",
  "whyItMatters": "Streaming, queueing, output length and cache reuse affect different clocks and costs. A useful operations metric needs units, a population and an observation window.",
  "openingMessage": "This is a deterministic four-request teaching model with one worker. No actual inference, provider billing or network benchmark runs. Each request has 120 input tokens: a reusable 100-token prefix and a 20-token suffix. Uncached prefill, or input processing, takes 400 ms; a prefix-cache hit takes 100 ms. Each generated output token takes 50 ms, including the first. The worker completes a request before starting the next, in first-come-first-served order.\n\nRequest pattern chooses arrival times and prefix IDs. Output tokens chooses 1, 4 or 8 tokens. Delivery streams each generated token or buffers until completion. Prefix cache starts empty on every recomputation and reuses only an identical previously completed prefix; it never stores the answer.\n\nModel time to first token (TTFT) is queue + prefill + one 50 ms token step from request arrival. Client first delay equals that in streaming mode, but equals full completion delay when buffered. Full latency is queue + prefill + all output steps. The timeline uses absolute ms; table delays are relative to each arrival.\n\nOutput throughput is total generated output tokens divided by elapsed seconds from first arrival to last completion, including idle time. Request throughput uses four completed requests over that same window. Cost uses fictional credits: 0.001 per uncached input token, 0.00025 per cached prefix token and 0.002 per output token. Request-hit rate is requests reusing a prefix divided by four; this is not a cache block or token hit fraction.\n\nFor one output token there is no pair of consecutive tokens, so generation inter-token gap is Undefined; TTFT and completion coincide. Start Spaced requests and predict what changes when only Delivery buffers content.",
  "masteryCriteria": [
    "Separates model first-token generation and client first content from completion.",
    "Counts output work in latency and toy cost.",
    "Explains queueing and finite-window throughput units.",
    "Traces cold prefix reuse and transfers timing/cost to a longer buffered answer."
  ],
  "steps": [
    {
      "title": "Stream or buffer",
      "experiment": "Set Delivery to Buffer until complete. Compare Model TTFT, Client first delay and full Latency, keeping other controls fixed.",
      "predictionQuestion": "Start Spaced requests. Keep 4 tokens, unique prefixes and cache Off. Change Delivery to Buffer until complete. Does the model generate its first token later, or does only the client see it later?",
      "observationPrompt": "Which clock moved?",
      "takeaway": "A quicker first visible response can improve perceived responsiveness without shortening full completion.\n\nReference only; no transfer leakage:\nFinite toy one worker FCFS entire request before next; ties R1-R4 order. Four requests120input(100prefix+20suffix), allsuccess, coldcache at start each recomputation, no eviction/batching/network/retries/realtiming/prices. Spreadarrivals0,1000,2000,3000 prefixesABCD; Burstarrivalsall0ABCD; RepeatedspacedAAA A. N1/4/8; prefilleverymiss400ms,hit100ms(fixedsuffixwork+overhead); decode50ms eachtoken inclfirst. Cachehit iffOnandprefixpreviouslycompleted; fullworkerexecutionensuresseenprior beforestart. start=max(arrival,previousfinish);queue=start-arrival;first=start+prefill+50;finish=start+prefill+50N;ttft=first-arrival; clientstream=first/buffer=finish; latency=finish-arrival. Generation inter-token gap50whenN>1,UndefinedN1;bufferingdoesnotclaimclientintereventgap. Spanfirstarrival0tofinalfinishincludesidle;reqthroughput4*1000/span;outputthroughput4N*1000/span. Hitrequestfractionhits/4 nottokenhitfraction;prefixcacheNOTanswercache. Toycredits uncachedinput.001/token,cachedprefix.00025/token,output.002/token. Missinput.12/hitinput.045,output.002N. BaselinemissSpread4streamoff modelTTFT450client450lat600meanqueue0span3600output16throughput4.444444 req1.111111 cost.128 hit0. Bufferedclient600unchangedmodel/finish/cost. Spread8streamoffmodel450lat800cost.136span3800outTP8.421053. Burst4offqueue0/600/1200/1800 latency600/1200/1800/2400 mean1500 TTFT1350span2400outTP6.666667 req1.666667 cost.128. Repeated4onhits0/1/1/1 prefills400/100/100/100 mean175 modelTTFT225 latency375 cost.07175span3300 outputTP4.848485. TransferRepeated8BufferedOn: firstmodeldelays450/150/150/150 mean225;full/clientdelays800/500/500/500 mean575;cache3/4=.75;cost.136/.061/.061/.061 mean.07975 total.319;span3500ms output32 throughput9.142857 req1.142857;gap50. No exacttransferbeforeattempt. N1modelTTFT=latency/clientboth, gapUndefined(notfake0). PresetsSpread4streamoff,Burst4streamoff,Repeated4streamon. Reset/predictionSpread4streamoffcurrentexercise/freeReset1. Actualchangesclearstale/noops preserve. Clocklabelsabsolutevsarrivalrelativeexplicit. TimelineeachrowqueuefromarrivaltoStart,prefillStarttoprefillend,decodeN50,modeldotfirst,clientdiamondfirstdelivery,andendstroke. Dataequivalenttables. Ordinary readable prose only no tools/code/artifact markup."
    },
    {
      "title": "Longer output, same first token",
      "experiment": "Set Output tokens to 8 tokens. Compare the first marker, decode length, latency and output charge in the exact ledgers.",
      "predictionQuestion": "Start Spaced requests. Keep Stream tokens and cache Off. Increase Output tokens from 4 tokens to 8 tokens. Must first-token delay grow just because more tokens follow it?",
      "observationPrompt": "What work did you add?",
      "takeaway": "First-token timing and total output work are separate. Always report token counts with latency and cost."
    },
    {
      "title": "A burst builds a queue",
      "experiment": "Set Request pattern to Burst unique prefixes. Read all four Queue ms entries and the observation span used for throughput.",
      "predictionQuestion": "Start Spaced requests with 4 tokens, Stream tokens and cache Off. Change Request pattern to Burst unique prefixes. Can mean latency increase while finite-window throughput also increases?",
      "observationPrompt": "Why do both numbers rise?",
      "takeaway": "Queueing can hurt individual responsiveness while a busier finite observation window shows more completed work per second."
    },
    {
      "title": "Reuse a prefix, not an answer",
      "experiment": "Set Request pattern to Spaced repeated prefix and Prefix cache to On \u00b7 Cold at start, in either order. Inspect prefix IDs, Hit?, prefill and charges.",
      "predictionQuestion": "Start Spaced requests. Set Request pattern to Spaced repeated prefix and Prefix cache to On \u00b7 Cold at start, keeping 4 tokens and Stream tokens. Does cache reuse remove output generation or make every request a hit?",
      "observationPrompt": "Which work was reused?",
      "takeaway": "Cache benefits depend on reusable prefixes and the observed population. Prompt reuse and answer caching are different mechanisms."
    }
  ]
};
