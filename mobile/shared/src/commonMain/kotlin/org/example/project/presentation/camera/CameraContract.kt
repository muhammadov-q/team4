package org.example.project.presentation.camera

import org.example.project.domain.model.Prediction

data class CameraContract(
    val isUploading: Boolean = false,
    val photo: ByteArray? = null,
    val prediction: Prediction? = null,
    val error: String? = null,
)

sealed interface CameraEvent {
    data object CapturePhotoRequested : CameraEvent
    data object SelectPhotoRequested : CameraEvent
    class OnPhotoCaptured(val photo: ByteArray) : CameraEvent
    data class OnPhotoCaptureFailed(val message: String) : CameraEvent
}

sealed interface CameraEffect {
    data object CapturePhoto : CameraEffect
    data object SelectPhoto : CameraEffect
}
