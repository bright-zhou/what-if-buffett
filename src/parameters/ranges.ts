export const FRICTION_RANGE = {
  min: 0,
  max: 0.10,
  step: 0.001,
  default: 0,
  snapPoints: [0, 0.01, 0.02, 0.05, 0.10] as const,
} as const;

export const LEVERAGE_RANGE = {
  min: 1,
  max: 3,
  step: 0.1,
  default: 1,
  snapPoints: [1, 1.5, 2, 2.5, 3] as const,
} as const;
