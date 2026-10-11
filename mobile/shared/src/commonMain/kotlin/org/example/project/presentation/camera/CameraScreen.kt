package org.example.project.presentation.camera

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.example.project.presentation.camera.models.DigitPredictionModel
import org.example.project.presentation.camera.models.PredictionBoxModel
import org.example.project.presentation.camera.models.PredictionModel
import org.example.project.presentation.camera.composables.CameraPreview
import org.example.project.presentation.camera.composables.CapturedPhotoContent
import org.example.project.presentation.camera.composables.EmptyCameraState
import org.example.project.presentation.camera.models.CameraScreenState

@Composable
fun CameraScreen(viewModel: CameraViewModel) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    CameraScreenContent(
        state = state,
        onTakePhotoClicked = { viewModel.onEvent(CameraEvent.CapturePhotoRequested) },
        onChooseFromPhotosClicked = { viewModel.onEvent(CameraEvent.SelectPhotoRequested) },
    )

    CameraPreview(
        cameraEffects = viewModel.effects,
        onPhotoCaptured = { photo -> viewModel.onEvent(CameraEvent.OnPhotoCaptured(photo)) },
        onCaptureError = { message ->
            viewModel.onEvent(CameraEvent.OnPhotoCaptureFailed(message))
        }
    )

}

@Composable
private fun CameraScreenContent(
    state: CameraContract,
    onTakePhotoClicked: () -> Unit,
    onChooseFromPhotosClicked: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
            .verticalScroll(rememberScrollState())
    ) {

        Text(
            text = "Read handwritten digits",
            style = MaterialTheme.typography.headlineLargeEmphasized
        )

        Text(
            text = "Photograph a page and the model finds each digit and reads it.",
            style = MaterialTheme.typography.bodyLarge,
            color = Color.Gray
        )

        Spacer(Modifier.weight(1f))

        when (state.cameraScreenState) {
            CameraScreenState.NoPhotoCaptured ->
                EmptyCameraState(
                    onTakePhotoClicked = onTakePhotoClicked,
                    onChooseFromPhotosClicked = onChooseFromPhotosClicked
                )

            CameraScreenState.PhotoCaptured ->
                CapturedPhotoContent(
                    modifier = Modifier.padding(top = 16.dp),
                    photo = state.photo,
                    prediction = state.prediction,
                    onTakeNewPhotoClicked = onTakePhotoClicked,
                    onChooseFromPhotosClicked = onChooseFromPhotosClicked
                )
        }
        Spacer(Modifier.weight(1f))
    }
}

@Preview(name = "No photo captured", showBackground = true)
@Composable
private fun CameraScreenNoPhotoPreview() {
    MaterialTheme {
        CameraScreenPreviewContent(CameraScreenState.NoPhotoCaptured)
    }
}

@Preview(name = "Photo captured", showBackground = true)
@Composable
private fun CameraScreenPhotoCapturedPreview() {
    MaterialTheme {
        CameraScreenPreviewContent(CameraScreenState.PhotoCaptured)
    }
}

@Composable
private fun CameraScreenPreviewContent(cameraScreenState: CameraScreenState) {
    val prediction = PredictionModel(
        predictions = listOf(7, 8, 3,6,2,6,5,0).map { digit ->
            DigitPredictionModel(
                digit = digit,
                probability = "87%",
                box = PredictionBoxModel(x = 0.0, y = 0.0, w = 0.0, h = 0.0),
            )
        },
        modelVersion = "preview",
    )
    CameraScreenContent(
        state = CameraContract(
            cameraScreenState = cameraScreenState,
            prediction = prediction,
        ),
        onTakePhotoClicked = {},
        onChooseFromPhotosClicked = {}
    )
}
