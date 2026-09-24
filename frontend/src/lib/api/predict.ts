import { apiRequest } from './client'
import type { paths } from './schema'

// Everything below is derived from the generated schema, so a backend change to the
// route, the form field or the response shape fails `npm run type-check`.
type PredictOperation = paths['/predict']['post']
type PredictForm = NonNullable<PredictOperation['requestBody']>['content']['multipart/form-data']

export type PredictResponse = PredictOperation['responses'][200]['content']['application/json']

const IMAGE_FIELD: keyof PredictForm = 'image'

export function predictImage(file: File, signal?: AbortSignal): Promise<PredictResponse> {
  const body = new FormData()
  body.append(IMAGE_FIELD, file)
  return apiRequest<PredictResponse>('/predict', {
    method: 'POST',
    body,
    signal,
    fallback: 'The model could not read this image.',
  })
}
