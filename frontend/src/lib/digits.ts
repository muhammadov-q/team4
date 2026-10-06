import type { PredictResponse } from '@/lib/api/predict'

export type DigitPrediction = PredictResponse['predictions'][number]
export type DigitBox = DigitPrediction['box']

export interface ImageSize {
  width: number
  height: number
}

export interface BoxPercent {
  left: number
  top: number
  width: number
  height: number
}

export function readDigits(predictions: DigitPrediction[]): string {
  return predictions.map((p) => p.digit).join('')
}

export function confidenceOf(prediction: DigitPrediction): number {
  return prediction.probabilities[String(prediction.digit)] ?? 0
}

export function hasBox(box: DigitBox): boolean {
  return box.w > 0 && box.h > 0
}

export function boxToPercent(box: DigitBox, image: ImageSize): BoxPercent {
  return {
    left: (box.x / image.width) * 100,
    top: (box.y / image.height) * 100,
    width: (box.w / image.width) * 100,
    height: (box.h / image.height) * 100,
  }
}
