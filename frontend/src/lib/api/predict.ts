import { apiRequest } from './client'
import type { paths } from './schema'

type PredictOperation = paths['/predict']['post']
type PredictForm = NonNullable<PredictOperation['requestBody']>['content']['multipart/form-data']

export type Prediction = PredictOperation['responses'][200]['content']['application/json']

const IMAGE_FIELD: keyof PredictForm = 'image'

export function predictPage(file: File, signal?: AbortSignal): Promise<Prediction> {
  const body = new FormData()
  body.append(IMAGE_FIELD, file)

  return apiRequest<Prediction>('/predict', {
    method: 'POST',
    body,
    signal,
    fallback: 'The model could not read this image.',
  })
}
