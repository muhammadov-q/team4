import { ApiError } from '@/lib/api/client'

export function describeRecognitionError(error: unknown): { title: string; message: string } {
  if (!(error instanceof ApiError)) {
    return { title: 'Recognition failed', message: 'Something went wrong. Try again.' }
  }
  switch (error.status) {
    case 0:
      return { title: 'No connection', message: error.message }
    case 502:
    case 503:
    case 504:
      return { title: 'Recognition service offline', message: error.message }
    case 413:
      return { title: 'Image too large', message: error.message }
    case 400:
    case 415:
    case 422:
      return { title: 'Image rejected', message: error.message }
    default:
      return { title: 'Recognition failed', message: error.message }
  }
}
