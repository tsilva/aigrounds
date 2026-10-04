import { confidencePresets, type CalibrationState, type GroupId } from "./calibration-engine";
export const calibrationBaseline = (): CalibrationState => ({ confidence: confidencePresets.mixed, bins: 10, threshold: 50 });
export const calibrationBaselineGroup = (): GroupId => "D";
export const sameCalibration = (a: CalibrationState, b: CalibrationState) => a.bins === b.bins && a.threshold === b.threshold && a.confidence.every((v, i) => v === b.confidence[i]);
export function reachedCalibration(index: number, state: CalibrationState) {
  const targets: CalibrationState[] = [
    { confidence: [65, 75, 85, 60], bins: 10, threshold: 50 },
    { confidence: confidencePresets.mixed, bins: 5, threshold: 50 },
    { confidence: confidencePresets.mixed, bins: 10, threshold: 90 },
    { confidence: confidencePresets.mixed, bins: 5, threshold: 100 },
  ];
  return !!targets[index] && sameCalibration(state, targets[index]);
}
