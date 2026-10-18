package org.example.project.presentation.mappers

import org.example.project.domain.model.ApiException
import org.example.project.presentation.camera.models.CameraScreenErrorState
import kotlin.test.Test
import kotlin.test.assertEquals

class CameraScreenErrorStateMapperTest {
    @Test
    fun noResponseMapsToServiceOffline() {
        assertEquals(CameraScreenErrorState.ServiceOffline, mapUploadErrorToUiModel(ApiException(0)))
    }

    @Test
    fun tooLargeMapsToImageTooLarge() {
        assertEquals(CameraScreenErrorState.ImageTooLarge, mapUploadErrorToUiModel(ApiException(413)))
    }

    @Test
    fun rejectedStatusesMapToImageRejected() {
        listOf(400, 415, 422).forEach { status ->
            assertEquals(CameraScreenErrorState.ImageRejected, mapUploadErrorToUiModel(ApiException(status)), "status $status")
        }
    }

    @Test
    fun otherStatusesMapToRecognitionFailed() {
        listOf(401, 404, 500, 502, 503).forEach { status ->
            assertEquals(CameraScreenErrorState.RecognitionFailed, mapUploadErrorToUiModel(ApiException(status)), "status $status")
        }
    }

    @Test
    fun nonApiExceptionMapsToRecognitionFailed() {
        assertEquals(CameraScreenErrorState.RecognitionFailed, mapUploadErrorToUiModel(IllegalStateException("boom")))
    }
}
