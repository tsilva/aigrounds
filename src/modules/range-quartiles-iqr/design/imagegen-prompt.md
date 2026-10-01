Use case: ui-mockup
Create a high-fidelity desktop screenshot mockup of the AI Grounds interactive statistics lesson redesigned for minimal fluff and maximum learning. Landscape 1536x1024, sharp readable typography, no browser chrome. Modern restrained learning lab, off-white background #f8f9fc, white panels, dark navy text, indigo #4f46e5 interactive accent, rust/orange #b45309 range accent. Space Grotesk-style headings, clean sans text, IBM Plex Mono-style numeric labels. Subtle borders, no gradients, no decoration, no unnecessary badges. Generous legible type but compact single-screen interface.

This is the AFTER-ACTION state of exercise 1, a reviewable concept not the initial page. Exact data [18,24,28,32,36,40,44,48,92], nine points A through I in that order. Before action I was 58. Correct current five-number summary: min18 Q1=26 median36 Q3=46 max92. Range74 IQR20. No incorrect arithmetic.

Top navigation horizontal at x70 y40: small AI Grounds logo/name left with '← All lessons'; small outlined 'AI Guide' button right.
Headline x70 y102: 'Range, quartiles & IQR'. Subtitle 'What changes when you move one value?'

Content from y175 to y865 with wide main left column (about 950px) and narrow right exercise column (about 345px), gap24. On left, one white learning workspace. Toolbar heading 'Explore the spread'; concise preset segmented buttons 'Compact' 'Wide Middle' 'Outlier'; simple 'Reset' at far right. Below one line: 'Drag a dot, or select it and use ← / →.'

The workspace uses a COMMON horizontal numeric scale from 0 to100, domain x170..985. Three stacked lanes all align to that exact shared scale:
first lane 'Values' y315 shows nine draggable circles at x corresponding to18,24,28,32,36,40,44,48,92 with point letters A through I visible in circles. Neighbouring small circle hit areas must not overlap. Label numeric values above circles in staggered positions as needed. I at92 is selected with strong indigo outline. A faint hollow ghost circle at58 with tiny 'before' label indicates original I value. All other points are navy outlined, restrained.
second lane 'Range' y407 orange horizontal span18..92 with endpoint caps; directly label 'min 18' and 'max 92'.
third lane 'Box plot' y491 a standard MIN/MAX whisker box plot: thin navy line from18 to26, pale indigo filled box26..46, black median vertical line at36, thin navy line46..92. Box boundaries/median labeled 'Q1 26', 'Median 36', 'Q3 46' above box, stagger vertically for readability. Small 'IQR' label under box. Do not draw a second axis with a different scale. Axis ticks0,25,50,75,100 at y555. Small honest convention note 'Whiskers show min and max.'

Below chart y600 two equal compact calculation tiles: left orange-accent title 'Range · full span', large '74', monospace '92 − 18 = 74', small 'Before 40 → now 74'. Right indigo-accent title 'IQR · middle 50%', large '20', monospace '46 − 26 = 20', small 'Before 20 → now 20'. These are the only large metrics.

Below workspace, a distinct compact white panel y735..925 titled 'How the quartiles are found'. Show ONE row of sorted values split into three labeled groups:
'Lower half' four pills18,24,28,32 (24 and28 visibly outlined in indigo);
'Median' singleton36 dark navy;
'Upper half' four pills40,44,48,92 (44 and48 outlined in indigo).
Use enough space to fit all nine values without overlap. Under lower half exact 'Q1 = (24 + 28) / 2 = 26'. Under upper half exact 'Q3 = (44 + 48) / 2 = 46'. Footer 'Sort first. Exclude the median, then average the middle two of each half.' Small secondary line 'This lesson uses the median-of-halves rule.'

Right column exercise panel y175..925: small caption 'EXPERIMENT 1 OF 3', main heading 'Move an edge'. Compact progress line 'Predict → Move → Explain' with Explain emphasized. Small visible recorded prediction 'Your prediction: only range changes'. Instruction 'Move I from 58 to 92.' Labeled numeric input 'Point I value' with current92; small check status 'Target reached'. Divider. Main reasoning prompt 'Why did the range change while IQR stayed at 20?' Three unselected radio choices on separate lines:
'Only the maximum changed.'
'Every sorted position changed.'
'Q1 and Q3 moved outward.'
None selected; button 'Check explanation' outlined subdued beneath. Footer narrow subtle helper 'Use the sorted halves as evidence.' This reasoning choice is not completed. Future exercises shown only as a tiny footer 'Next: move a quartile · try new data', no extra panels. No stars, points, celebratory decoration, no boilerplate paragraphs, no percentile rank panel, no duplicate sorted list, no giant takeaway block, no tables of duplicate metrics. Need all textual labels and data consistent and correctly drawn, no invented elements.

Edit this desktop learning-page mockup. Keep the overall layout, typography, text, two-column structure, cards, exercise reasoning choices, all correct arithmetic, and lower sorted-half panel. Correct only the chart's quantitative geometry and selected-dataset toolbar.

CRITICAL: every chart mark must align to ONE linear scale with numeric0 at x190 and100 at x1018 on this 1536x1024 image. The actual scale is x=190+8.28*value.
Place Values dot centers at these exact x positions: A18 x339, B24 x389, C28 x422, D32 x455, E36 x488, F40 x521, G44 x554, H48 x587, I92 x952. Keep y302 for dots. Numeric labels18,24,28,32,36,40,44,48,92 above corresponding dots. Hollow ghost dot labeled before58 must be at x670, NOT x754; y302.
Orange Range segment18..92 from x339 to952 with caps and labels min18 max92 at y355.
Box plot min18 at x339, Q126 at x405, median36 at x488, Q346 at x571, max92 at x952. Filled indigo box x405..571. Whiskers x339..405 and x571..952, min/max caps. Put Q1 26 above x405, Median36 above x488, Q3 46 above x571. The median36 must vertically align with Values point E36. All plotted geometry must be proportional to actual numeric differences. Axis ticks x190=0 x397=25 x604=50 x811=75 x1018=100. Keep room around each label.

Replace toolbar's currently selected 'Compact' button with selected 'Experiment' button; retain 'Wide Middle' and 'Outlier' buttons. This dataset is the experiment base with I moved from58 to92. Do not add anything else. IQR remains20; range remains74; sorted lower18,24,28,32 upper40,44,48,92 and median36 unchanged. No new panels, no added words except Experiment replacing Compact. Preserve rest of screenshot exactly.

Approved implementation: shared scale with exact computed geometry, compact sorted-half calculations, numeric input and draggable slider equivalents. The generated reference has imprecise graphical positions; application code must use exact numeric mapping.
