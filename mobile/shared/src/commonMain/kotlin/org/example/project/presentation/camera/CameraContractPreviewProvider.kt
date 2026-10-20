package org.example.project.presentation.camera

import androidx.compose.ui.tooling.preview.PreviewParameterProvider
import org.example.project.presentation.camera.models.CameraScreenErrorState
import org.example.project.presentation.camera.models.CameraScreenState
import org.example.project.presentation.camera.models.DigitPredictionModel
import org.example.project.presentation.camera.models.PredictionBoxModel
import org.example.project.presentation.camera.models.PredictionModel

class CameraContractPreviewProvider : PreviewParameterProvider<CameraContract> {
    private val prediction = PredictionModel(
        predictions = listOf(7, 8, 3, 6, 2, 6, 5, 0).map { digit ->
            DigitPredictionModel(
                digit = digit,
                probability = "87%",
                box = PredictionBoxModel(x = 0.0, y = 0.0, w = 0.0, h = 0.0),
            )
        },
        modelVersion = "preview",
    )

    override val values = sequenceOf(
        CameraContract(cameraScreenState = CameraScreenState.NoPhotoCaptured),
        CameraContract(
            cameraScreenState = CameraScreenState.PhotoCaptured,
            prediction = prediction,
        ),
        CameraContract(
            cameraScreenState = CameraScreenState.Error(CameraScreenErrorState.ServiceOffline),
        ),
    )
}
