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
import androidx.compose.ui.tooling.preview.Preview
import org.example.project.common.presentation.ui.theme.ScriptLensSpacing
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.example.project.common.presentation.ui.loading.OverlayLoadingState
import org.example.project.presentation.camera.composables.CameraPreview
import org.example.project.presentation.camera.composables.CapturedPhotoContent
import org.example.project.presentation.camera.composables.EmptyCameraState
import org.example.project.presentation.camera.composables.error.ErrorState
import org.example.project.presentation.camera.models.CameraScreenState
import org.example.project.presentation.camera.models.DigitPredictionModel
import org.example.project.presentation.camera.models.PredictionBoxModel
import org.example.project.presentation.camera.models.PredictionModel
import org.jetbrains.compose.resources.stringResource
import scriptlens.shared.generated.resources.Res
import scriptlens.shared.generated.resources.camera_title
import scriptlens.shared.generated.resources.camera_subtitle
import org.example.project.common.presentation.ui.theme.ScriptLensColors
import org.example.project.common.presentation.ui.theme.ScriptLensTypography

@Composable
fun CameraScreen(viewModel: CameraViewModel) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    CameraScreenContent(
        state = state,
        onTakePhotoClicked = { viewModel.onEvent(CameraEvent.CapturePhotoRequested) },
        onChooseFromPhotosClicked = { viewModel.onEvent(CameraEvent.SelectPhotoRequested) },
        onRetryClicked = { viewModel.onEvent(CameraEvent.RetryUploadRequested) },
    )

    CameraPreview(
        cameraEffects = viewModel.effects,
        onPhotoCaptured = { photo -> viewModel.onEvent(CameraEvent.OnPhotoCaptured(photo)) },
        onCaptureError = { message ->
            viewModel.onEvent(CameraEvent.OnPhotoCaptureFailed(message))
        }
    )

    if (state.isLoading) OverlayLoadingState()

}

@Composable
private fun CameraScreenContent(
    state: CameraContract,
    onTakePhotoClicked: () -> Unit,
    onChooseFromPhotosClicked: () -> Unit,
    onRetryClicked: () -> Unit = {},
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(ScriptLensSpacing.P24)
            .verticalScroll(rememberScrollState())
    ) {

        Text(
            text = stringResource(Res.string.camera_title),
            style = ScriptLensTypography.Title
        )

        Text(
            text = stringResource(Res.string.camera_subtitle),
            style = ScriptLensTypography.Body,
            color = ScriptLensColors.Subtext
        )

        Spacer(Modifier.weight(1f))


        val cameraScreenState = state.cameraScreenState
        when (cameraScreenState) {
            is CameraScreenState.NoPhotoCaptured ->
                EmptyCameraState(
                    onTakePhotoClicked = onTakePhotoClicked,
                    onChooseFromPhotosClicked = onChooseFromPhotosClicked
                )

            is CameraScreenState.PhotoCaptured ->
                CapturedPhotoContent(
                    modifier = Modifier.padding(top = ScriptLensSpacing.P16),
                    photo = state.photo,
                    prediction = state.prediction,
                    onTakeNewPhotoClicked = onTakePhotoClicked,
                    onChooseFromPhotosClicked = onChooseFromPhotosClicked
                )

            is CameraScreenState.Error ->
                ErrorState(
                    errorState = cameraScreenState.error,
                    onTakeNewPhotoClicked = onTakePhotoClicked,
                    onChooseFromPhotosClicked = onChooseFromPhotosClicked,
                    onRetryClicked = onRetryClicked
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
        predictions = listOf(7, 8, 3, 6, 2, 6, 5, 0).map { digit ->
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
