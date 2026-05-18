Design an AI Grounds interactive learning playground page for Autograd Graphs.

Reference style: no logo, no nav, no sidebar, huge black title "Autograd Graphs", dark-blue subtitle, one pale help button, centered dense numbered panels with pale blue borders, compact controls, electric indigo headings, mono formulas, and no decorative background.

Formula shown in the accepted design: `f(a,b)=a*b+b^2` at `a=2`, `b=3`.

Exact visible math:

- `mul=6`
- `square=9`
- `output=15`
- `df/da=3`
- `df/db=2+6=8`

Trace graph requirements:

- `a` and `b` input nodes at left, `mul` upper middle, `square` lower middle, `add` center right, `out` far right.
- Blue forward arrows: `a->mul`, `b->mul`, `b->square`, `mul->add`, `square->add`, `add->out`.
- `b` must visibly branch to both `mul` and `square`.
- Red return arrows are thin and secondary; exact gradient values are in badges beside receiving nodes, not on lanes.
- Badges near `a`: `from mul 3.000`, `df/da 3.000`.
- Badges near `b`: `from mul 2.000`, `from square 6.000`, `df/db = 2 + 6 = 8`.
- Badges near `mul` and `square`: `incoming grad 1.000`.
- Badge near `add`: `output grad 1.000`.

Chart panel requirements:

- Three charts with curves and value callouts.
- Function chart: line `f(a,b)=3a+9`, callout `a=2 -> f=15`.
- `df/da` chart: flat line `df/da=b=3`, callout `current df/da=3`.
- `df/db` chart: rising line `df/db=a+2b`, callout `b=3 -> df/db=8`.

Other panels:

- Formula selector with selected `f(a,b)=a*b+b^2`, plus `sigmoid(w*x)` and squared-error formulas.
- Inputs `a=2.000`, `b=3.000`, output `15.000`.
- Sliders, value cards, gradient cards, and update preview `a_new=1.700`, `b_new=2.200` at `lr=0.1`.
- Chain-rule ledger: `Gradient for a = 1 x local add->mul 1 x local mul->a b=3 = df/da 3`; `Gradient for b = via multiply contribution 2 + via square contribution 6 = df/db 8`.

Avoid chart marker mismatch, swapped gradients, missing `b->square` edge, wrong arrow direction, confusing lane labels, clipped text, malformed math, nested decorative cards, and long prose.
