package org.example.project.presentation.camera.composables.error

import androidx.compose.ui.tooling.preview.PreviewParameterProvider
import org.example.project.common.presentation.ui.UiText
import org.example.project.presentation.camera.models.CameraScreenErrorState

class CameraScreenErrorStatePreviewProvider : PreviewParameterProvider<CameraScreenErrorState> {
    override val values = sequenceOf(
        CameraScreenErrorState.ServiceOffline,
        CameraScreenErrorState.ImageTooLarge,
        CameraScreenErrorState.ImageRejected,
        CameraScreenErrorState.RecognitionFailed,
        CameraScreenErrorState.PhotoUnavailable(
            UiText.Plain("The camera could not capture a photo.")
        ),
    )
}
