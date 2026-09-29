import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api/client'
import { describeRecognitionError } from './describe-error'

describe('describeRecognitionError', () => {
  it.each([
    [0, 'No connection'],
    [502, 'Recognition service offline'],
    [413, 'Image too large'],
    [415, 'Image rejected'],
    [400, 'Image rejected'],
    [500, 'Recognition failed'],
  ])('titles status %d as "%s" and keeps the backend message', (status, title) => {
    expect(describeRecognitionError(new ApiError('from the backend', status))).toEqual({
      title,
      message: 'from the backend',
    })
  })

  it('has a generic message for errors that are not ApiError', () => {
    expect(describeRecognitionError(new Error('boom'))).toEqual({
      title: 'Recognition failed',
      message: 'Something went wrong. Try again.',
    })
  })
})
