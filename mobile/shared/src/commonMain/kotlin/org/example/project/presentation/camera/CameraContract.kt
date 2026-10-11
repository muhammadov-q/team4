package org.example.project.presentation.camera

import org.example.project.presentation.camera.models.CameraScreenState
import org.example.project.presentation.camera.models.PredictionModel

data class CameraContract(
    val cameraScreenState: CameraScreenState = CameraScreenState.NoPhotoCaptured,
    val photo: ByteArray? = null,
    val prediction: PredictionModel? = null,
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