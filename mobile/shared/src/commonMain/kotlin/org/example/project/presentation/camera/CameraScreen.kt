package org.example.project.presentation.camera

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.example.project.domain.model.DigitPrediction
import org.example.project.domain.model.PredictionBox
import org.example.project.domain.model.Prediction

@Composable
fun CameraScreen(viewModel: CameraViewModel) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    CameraScreenContent(
        state = state,
        onCapture = { viewModel.onEvent(CameraEvent.CapturePhotoRequested) },
        onSelectPhoto = { viewModel.onEvent(CameraEvent.SelectPhotoRequested) },
        cameraContent = { modifier ->
            CameraView(
                modifier = modifier,
                cameraEffects = viewModel.effects,
                onPhotoCaptured = { photo -> viewModel.onEvent(CameraEvent.OnPhotoCaptured(photo)) },
                onCaptureError = { message ->
                    viewModel.onEvent(CameraEvent.OnPhotoCaptureFailed(message))
                },
            )
        },
    )
}

@Composable
private fun CameraScreenContent(
    state: CameraContract,
    onCapture: () -> Unit,
    onSelectPhoto: () -> Unit,
    cameraContent: @Composable (Modifier) -> Unit,
) {
    Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        cameraContent(Modifier.fillMaxSize())

        val prediction = state.prediction
        val status = when {
            state.isUploading -> "Sending photo..."
            prediction != null -> {
                val digits = prediction.predictions.joinToString(separator = ", ") { it.digit.toString() }
                "Prediction: ${digits.ifEmpty { "none" }} (model ${prediction.modelVersion})"
            }
            state.error != null -> state.error
            else -> null
        }

        Column(
            modifier = Modifier.align(Alignment.Center),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Button(
                enabled = !state.isUploading,
                onClick = onCapture,
            ) {
                Text(if (state.isUploading) "Please wait..." else "Take photo and send")
            }
            Button(
                enabled = !state.isUploading,
                onClick = onSelectPhoto,
            ) {
                Text("Choose photo")
            }

            status?.let {
                Text(
                    text = it,
                    color = Color.White,
                    modifier = Modifier
                        .padding(24.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color.Black.copy(alpha = 0.65f))
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                )
            }
        }

    }
}

@Preview
@Composable
private fun CameraScreenPreview() {
    MaterialTheme {
        CameraScreenContent(
            state = CameraContract(
                prediction = Prediction(
                    predictions = listOf(
                        DigitPrediction(
                            digit = 7,
                            probabilities = mapOf("7" to 0.87),
                            box = PredictionBox(x = 0.0, y = 0.0, w = 0.0, h = 0.0),
                        ),
                    ),
                    modelVersion = "preview",
                ),
            ),
            onCapture = {},
            onSelectPhoto = {},
            cameraContent = { modifier -> }
        )
    }
}
