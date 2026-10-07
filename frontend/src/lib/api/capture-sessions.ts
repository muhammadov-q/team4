import { apiBlob, apiRequest } from './client'
import type { paths } from './schema'

type ImagePath = paths['/capture-sessions/{session_id}/image']
type UploadForm = NonNullable<ImagePath['put']['requestBody']>['content']['multipart/form-data']
export type CaptureSession =
  paths['/capture-sessions']['post']['responses'][201]['content']['application/json']

const IMAGE_FIELD: keyof UploadForm = 'image'

const sessionPath = (id: string) => `/capture-sessions/${encodeURIComponent(id)}`

export function createCaptureSession(): Promise<CaptureSession> {
  return apiRequest<CaptureSession>('/capture-sessions', { method: 'POST' })
}

export function getCaptureSession(id: string, signal?: AbortSignal): Promise<CaptureSession> {
  return apiRequest<CaptureSession>(sessionPath(id), { signal })
}

export function uploadCaptureImage(id: string, file: File): Promise<CaptureSession> {
  const body = new FormData()
  body.append(IMAGE_FIELD, file)
  return apiRequest<CaptureSession>(`${sessionPath(id)}/image`, {
    method: 'PUT',
    body,
    fallback: 'The photo could not be sent.',
  })
}

export async function downloadCaptureImage(
  id: string,
  uploadCount: number,
  signal?: AbortSignal
): Promise<File> {
  const blob = await apiBlob(`${sessionPath(id)}/image`, { signal })
  const extension = blob.type.replace(/^image\//, '').replace('jpeg', 'jpg') || 'jpg'
  return new File([blob], `Phone photo ${uploadCount}.${extension}`, { type: blob.type })
}

export function deleteCaptureSession(id: string): Promise<void> {
  return apiRequest<void>(sessionPath(id), { method: 'DELETE' })
}
