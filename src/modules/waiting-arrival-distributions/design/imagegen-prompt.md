# Accepted Imagegen Prompt

Design a ninth-pass high-fidelity desktop app screenshot for an AI Grounds interactive learning playground page titled "Waiting & Arrival Distributions Lab". Preserve the eighth-pass AI Grounds/cross-entropy structure: no logo, no brand mark, no global nav, no sidebar, no marketing hero. Huge black title at upper left, short dark-blue subtitle, one pale outlined help button at upper right. Centered dense lesson page, bright white/cool-gray background, stacked compact lesson panels with pale blue borders, white/near-white surfaces, 8-14px radius, subtle cool shadow, electric indigo section titles and controls, mono numeric/formula details. No decorative orbs, no nested decorative cards, no clipped text.

Keep these values:
- p = 0.020 per second, lambda = 1.20/min, T = 5 min, lambda T = 6.0, mean wait = 50.0s.
- Waiting histogram buckets and labels must be exactly: 0-10s 18.3%, 10-20s 14.9%, 20-30s 12.2%, 30-40s 10.0%, 40-50s 8.2%, 50-60s 6.7%, 60s+ 29.8%. Do not write 40-40s. Do not duplicate bucket labels.
- Metric pills: P(wait <= 20s)=33.2%, median wait about 35s, P(wait > 60s)=29.8%.
- Poisson chart mean 6.0, mode 6, P(0)=0.25%, P(at least 1)=99.75%.
- Rare event example lambda=0.01/min, T=5min, lambda T=0.05, exact P(at least one)=4.9%, approximation 5.0%.

Fix these exact defects from pass 8:
1. The bottom "5. RUN ARRIVALS" timeline must visibly show exactly six event marks, not five. Use six green/orange dots at 0.42, 1.17, 1.98, 2.73, 3.61, and 4.46 minutes. Make the final 4.46-minute dot clearly visible before the 5-minute endpoint, not hidden on the axis end or under text. Put small labels below each dot.
2. The bottom run timeline axis labels must be clean: 0, 1, 2, 3, 4, 5 minutes. No duplicate ticks and no truncation.
3. The main timeline should also visibly show the same six event marks and clean 0-5 minute ticks.
4. The waiting histogram bucket labels must be clean and correct, especially 40-50s.

Keep the conceptual wording:
- Bridge: "Tick model for waits; rate model for counts" and "small p over many ticks behaves like a Poisson rate".
- Assumption: independent arrivals, steady rate.
- Poisson chart subtitle: rate-model count distribution with mean lambda T = 6.0.

Page sections:
1. CHOOSE THE ARRIVAL STORY
2. WATCH THE TWO QUESTIONS SPLIT
3. THE INTUITION: ONE RATE, TWO LINKED VIEWS
4. SET THE CHANCE
5. RUN ARRIVALS
6. RARE EVENT TAKEAWAY

Make it look like a real Next.js educational app screenshot in the existing AI Grounds design system. Every widget must have a teaching purpose. Every control should visibly affect at least two surfaces. Use indigo controls/headings, green likely outcomes, amber long waits, red only for rare/extreme emphasis, neutral text.
