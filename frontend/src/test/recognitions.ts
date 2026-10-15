import type { Recognition } from '@/lib/api/recognitions'

export function makeRecognition(overrides: Partial<Recognition> = {}): Recognition {
  return {
    id: 1,
    created_at: '2026-10-15T12:00:00Z',
    filename: 'folio-1r.png',
    model_version: 'KNN-100126',
    predictions: [
      { digit: 4, probabilities: { '4': 0.92 }, box: { x: 10, y: 20, w: 30, h: 40 } },
      { digit: 2, probabilities: { '2': 0.61 }, box: { x: 50, y: 20, w: 30, h: 40 } },
    ],
    ...overrides,
  }
}
