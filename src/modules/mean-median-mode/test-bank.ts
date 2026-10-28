import type { TestBank, TestQuestion } from "@/lib/lesson-test";

// Authored items, not random-number rewrites of the same prompt. Each objective
// has eight foundation and eight application items. Answers use the lesson's
// convention: unique values have no mode; ties at a repeated maximum all count.
type Base = Pick<TestQuestion, "id" | "objective" | "level" | "family" | "prompt" | "context" | "explanation">;
const base = (id: string, family: string, prompt: string, explanation: string, context?: string): Base => ({
  id, objective: id.split("-")[0], level: Number(id.split("-")[1]) <= 8 ? "foundation" : "application", family, prompt, explanation, context,
});
const number = (id: string, family: string, prompt: string, correct: number, explanation: string, context?: string): TestQuestion => ({ ...base(id, family, prompt, explanation, context), type: "number", correct });
const choice = (id: string, family: string, prompt: string, labels: readonly string[], correct: number, explanation: string, context?: string): TestQuestion => ({
  ...base(id, family, prompt, explanation, context), type: "choice", options: labels.map((label, i) => ({ id: String(i), label })), correct: String(correct),
});
const multiple = (id: string, family: string, prompt: string, labels: readonly string[], correct: readonly number[], explanation: string, context?: string): TestQuestion => ({
  ...base(id, family, prompt, explanation, context), type: "multiple", options: labels.map((label, i) => ({ id: String(i), label })), correct: correct.map(String),
});
const text = (id: string, family: string, prompt: string, correct: readonly string[], explanation: string, context?: string): TestQuestion => ({ ...base(id, family, prompt, explanation, context), type: "text", correct });
const slider = (id: string, family: string, prompt: string, correct: number, max: number, explanation: string, context?: string): TestQuestion => ({ ...base(id, family, prompt, explanation, context), type: "slider", min: 0, max, step: 1, correct });

export const meanMedianModeTestBank: TestBank = {
  slug: "mean-median-mode", version: 1, title: "Mean, Median & Mode",
  objectives: [{ id: "mean", label: "Mean and its response to changes" }, { id: "median", label: "Sorted position and resistance to extremes" }, { id: "mode", label: "Frequency, ties and no repeats" }],
  questions: [
    number("mean-01", "mean-direct", "What is the mean?", 4, "Add the three values, then divide by three: (2 + 4 + 6) ÷ 3 = 4.", "2, 4, 6"),
    choice("mean-02", "mean-definition", "Which calculation always gives the arithmetic mean?", ["Sum of the values ÷ number of values", "Largest value − smallest value", "Middle value after sorting"], 0, "The arithmetic mean uses the total of every value, divided by the count."),
    slider("mean-03", "mean-target", "Set x so the mean is 6.", 12, 20, "Three values with mean 6 need a total of 18. Since 2 + 4 = 6, x must be 12.", "2, 4, x"),
    choice("mean-04", "mean-balance", "Which summary is the balance point that uses every observation?", ["Mean", "Median", "Mode"], 0, "The mean is the balance point of all the observations. Median uses sorted position; mode uses occurrence count."),
    number("mean-05", "mean-direct", "What is the mean of these four values?", 15, "Repeated observations each count: (10 + 10 + 20 + 20) ÷ 4 = 15.", "10, 10, 20, 20"),
    number("mean-06", "mean-total-count", "Seven values have a total of 56. What is their mean?", 8, "Mean = total ÷ count = 56 ÷ 7 = 8."),
    choice("mean-07", "mean-shift", "You add 3 to every value. What happens to the mean?", ["It increases by 3", "It increases by 3 times the count", "It stays the same"], 0, "Adding 3 to each of n values adds 3n to the total; dividing by n increases the mean by 3."),
    number("mean-08", "mean-recover-total", "Five values have a mean of 12. What is their total?", 60, "Total = mean × count = 12 × 5 = 60."),
    choice("mean-09", "mean-outlier", "Replace 5 with 25. What happens?", ["Mean rises from 3 to 7; median stays 3", "Both mean and median rise to 7", "Mean stays 3; median rises to 7"], 0, "The total increases by 20, so the mean increases by 20 ÷ 5 = 4. The middle value remains 3.", "Before: 1, 2, 3, 4, 5\nAfter: 1, 2, 3, 4, 25"),
    number("mean-10", "mean-delta", "In a dataset of four values, replace an 8 with a 20. By how much does the mean increase?", 3, "The total rises by 12 while the count stays four, so the mean rises by 12 ÷ 4 = 3."),
    choice("mean-11", "mean-recover-total", "You know the mean salary and the number of employees. How do you recover the total salary budget?", ["Mean × employee count", "Mean ÷ employee count", "The mean alone is the total"], 0, "Multiplying the arithmetic mean by the count recovers the total. A median would not generally do this."),
    slider("mean-12", "mean-target", "Set x so these values have a mean of 8.", 15, 24, "The required total is 3 × 8 = 24. The known values total 9, so x = 15.", "3, 6, x"),
    choice("mean-13", "mean-weighted", "Which calculation respects the repeated observation?", ["(2 + 2 + 8) ÷ 3 = 4", "(2 + 8) ÷ 2 = 5", "8 − 2 = 6"], 0, "There are three observations, including both 2s. Removing a repeat changes the dataset.", "2, 2, 8"),
    number("mean-14", "mean-add-observation", "Add a fifth value, 9. What is the new mean?", 5, "The new total is 1 + 3 + 5 + 7 + 9 = 25, with five observations. The new mean is 5.", "Start: 1, 3, 5, 7"),
    choice("mean-15", "mean-not-observed", "The values are 0 and 10. Which statement is correct?", ["The mean is 5 even though 5 is not an observation", "There is no mean because 5 is absent", "The mean must be either 0 or 10"], 0, "An average need not be one of the observed values. Here (0 + 10) ÷ 2 = 5."),
    choice("mean-16", "mean-unbalanced-groups", "Two observations are 10 and three observations are 20. What is the combined mean?", ["16", "15", "30"], 0, "Weight the group values by their observation counts: (2 × 10 + 3 × 20) ÷ 5 = 16."),

    number("median-01", "median-sort", "What is the median?", 5, "Sort first: 1, 2, 5, 7, 9. The third, middle value is 5.", "9, 2, 5, 1, 7"),
    text("median-02", "median-definition", "Complete the sentence: the middle value after sorting is the ____.", ["median"], "The median is defined by the middle position in sorted data, rather than the total or the frequency."),
    number("median-03", "median-even", "What is the median of these four sorted values?", 6, "For an even count, average the two middle values: (4 + 8) ÷ 2 = 6.", "2, 4, 8, 10"),
    choice("median-04", "median-procedure", "What must you do before locating the middle value for a median?", ["Sort the values", "Remove repeated values", "Remove the largest value"], 0, "The median uses the middle of the sorted observations. Repeats and extremes remain in the dataset."),
    number("median-05", "median-sort", "Find the median, including the negative values.", 2, "There are five sorted observations. The third is 2; negative values do not change the median rule.", "−8, −1, 2, 4, 9"),
    choice("median-06", "median-even-rule", "For six sorted observations, which positions determine the median?", ["Average positions 3 and 4", "Use position 3 alone", "Average positions 1 and 6"], 0, "An even count has two central positions. For six observations, they are positions 3 and 4."),
    number("median-07", "median-even", "What is the median?", 16, "The two middle values are 12 and 20. Their average is (12 + 20) ÷ 2 = 16.", "10, 12, 20, 22"),
    choice("median-08", "median-not-observed", "Must the median always be one of the observed values?", ["No; an even count can put it between two observations", "Yes; it must always occur in the data", "Only if all observations are different"], 0, "For example, the median of 2 and 8 is 5. With an even count, the middle-pair average need not be an observed value."),
    number("median-09", "median-extreme", "Replace 9 with 99. What is the new median?", 5, "The sorted middle is still the third value, 5. Increasing the largest observation does not change that position here.", "Start: 1, 3, 5, 7, 9"),
    number("median-10", "median-sort", "A learner picks 11 because it is printed in the middle. What is the correct median?", 7, "Print order is not enough. Sorting gives 2, 4, 7, 11, 18, whose middle value is 7.", "18, 2, 11, 7, 4"),
    slider("median-11", "median-target", "Set x so the median is 8.", 8, 20, "Two fixed values are below 8 and two are above it. Setting x to 8 places it in the middle after sorting.", "2, 4, x, 10, 12"),
    number("median-12", "median-add-observation", "Add an observation of 8. What is the new median?", 5, "The four sorted observations are 2, 4, 6, 8. Average the two middle values: (4 + 6) ÷ 2 = 5.", "Start: 2, 4, 6"),
    choice("median-13", "median-context", "Most employees earn similar salaries, but one earns much more. Which summary best represents the middle employee?", ["Median", "Mean", "Maximum"], 0, "The median directly describes the middle employee's salary. One very high salary can pull the mean far above most employees' salaries."),
    number("median-14", "median-middle-moves", "Replace the 3 with 10. What is the new median?", 4, "The new sorted order is 1, 2, 4, 5, 10, so the middle value becomes 4. Medians can change when observations move.", "Start: 1, 2, 3, 4, 5"),
    choice("median-15", "median-resistance", "Which statement about the median is accurate?", ["Moving an extreme can leave it unchanged; moving other observations can change it", "It never changes when any observation moves", "It ignores every observation above the mean"], 0, "Resistance to extremes is not immunity to every edit. The median depends on which values occupy the central sorted positions."),
    number("median-16", "median-extreme", "Replace 100 with 1000. What is the new median?", 2.5, "The two central observations stay 2 and 3. Their average remains 2.5.", "Start: 1, 2, 3, 100"),

    number("mode-01", "mode-unique", "What is the mode?", 2, "2 occurs twice; every other value occurs once. The most frequent value is 2.", "1, 2, 2, 3, 4"),
    text("mode-02", "mode-definition", "Complete the sentence: the most frequent value is the ____.", ["mode"], "Mode follows occurrence count, rather than numeric size or sorted position."),
    multiple("mode-03", "mode-ties", "Select every mode.", ["2", "4", "6"], [0, 2], "Both 2 and 6 occur twice, sharing the highest frequency. 4 occurs only once.", "2, 2, 4, 6, 6"),
    choice("mode-04", "mode-none", "Under this lesson's no-repeats convention, which statement is correct?", ["There is no mode", "The mode is 7 because it is largest", "The mode is 4 because it is in the middle"], 0, "No observation repeats. This lesson calls that no mode, rather than picking the largest or middle value.", "1, 4, 7"),
    multiple("mode-05", "mode-ties", "Select every mode.", ["1", "2", "3", "4"], [0, 1, 2], "1, 2 and 3 each occur twice, the highest frequency. 4 occurs once.", "1, 1, 2, 2, 3, 3, 4"),
    number("mode-06", "mode-frequency", "How many times does the mode occur?", 3, "The mode is 5, and its frequency is three. The mode value and its frequency are different quantities.", "5, 5, 5, 8, 8"),
    choice("mode-07", "mode-unique", "Which value is the mode?", ["1", "9", "There is no mode"], 0, "1 occurs three times and 9 occurs once. Largest does not mean most frequent.", "1, 1, 1, 9"),
    number("mode-08", "mode-unique", "Find the mode without changing any occurrence counts.", 7, "7 occurs three times, 3 twice and 2 once. Sorting can help counting but is not part of the definition of mode.", "7, 3, 7, 2, 3, 7"),
    number("mode-09", "mode-add-observations", "Add two more observations of 3. What is the new mode?", 3, "3 now occurs three times, overtaking 1, which occurs twice.", "Start: 1, 1, 2, 3"),
    number("mode-10", "mode-break-tie", "Add one more observation of 2. What is the only mode now?", 2, "2 now occurs three times while 5 occurs twice, breaking the original tie.", "Start: 2, 2, 5, 5"),
    number("mode-11", "mode-outlier", "Replace 9 with 99. What is the mode now?", 2, "2 still occurs twice, more than any other value. Moving an observation that occurs once did not affect the leading frequency.", "Start: 2, 2, 3, 4, 9"),
    multiple("mode-12", "mode-ties", "Select every mode when both repeated values tie.", ["1", "2", "Neither value"], [0, 1], "Each value occurs twice. Under this lesson's convention, both tied repeated values are modes.", "1, 1, 2, 2"),
    text("mode-13", "mode-none", "Under this lesson's convention, what is the mode? Write “none” if there is no mode.", ["none", "no mode", "there is no mode"], "All five observations are different. Under the lesson's no-repeats convention, there is no mode.", "4, 8, 12, 16, 20"),
    slider("mode-14", "mode-target", "Set x so 3 shares the highest frequency with 2.", 3, 8, "Setting x to 3 gives two 2s and two 3s. Both share the highest occurrence count.", "1, 2, 2, 3, x"),
    multiple("mode-15", "mode-distinguish-centers", "Select every true statement about the mode.", ["The mode is 1", "There is exactly one mode", "The mode is 7 because it is largest", "The mode is 2 because it is in the middle"], [0, 1], "Only 1 repeats, so it is the unique mode. The median is 2, and the largest value is 7; neither determines the mode.", "1, 1, 2, 4, 7"),
    choice("mode-16", "mode-category", "Which color is the mode?", ["Red", "Blue", "Green"], 0, "Mode describes the most frequent category as well as the most frequent number. Red has the highest count.", "Red: 4 observations\nBlue: 2 observations\nGreen: 1 observation"),
  ],
};
