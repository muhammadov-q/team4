package org.example.project.presentation.camera

import org.example.project.presentation.camera.models.CameraScreenState
import org.example.project.presentation.camera.models.PredictionModel

data class CameraContract(
    val cameraScreenState: CameraScreenState = CameraScreenState.NoPhotoCaptured,
    val photo: ByteArray? = null,
    val prediction: PredictionModel? = null,
    val isLoading: Boolean = false
)

sealed interface CameraEvent {
    data object CapturePhotoRequested : CameraEvent
    data object SelectPhotoRequested : CameraEvent
    class OnPhotoPicked(val photoBytes: ByteArray?) : CameraEvent
    data object OnPhotoCaptureCancelled : CameraEvent
    data class OnPhotoCaptureFailed(val message: String) : CameraEvent
    data object RetryUploadRequested : CameraEvent

    data object OnImagePickerProcessingStarted : CameraEvent

}

sealed interface CameraEffect {
    data object CapturePhoto : CameraEffect
    data object SelectPhoto : CameraEffect
}