package org.example.project.presentation.camera

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.Image
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.tooling.preview.Preview
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
    Column(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
            if (state.photo != null) {
                AnnotatedPhoto(
                    photo = state.photo,
                    prediction = state.prediction,
                    modifier = Modifier.fillMaxSize(),
                )
            }
            cameraContent(Modifier.size(1.dp))
        }

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
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .verticalScroll(rememberScrollState())
                .background(Color.Black.copy(alpha = 0.9f))
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(8.dp),
            ) {
                Button(
                    modifier = Modifier.weight(1f),
                    enabled = !state.isUploading,
                    onClick = onCapture,
                ) {
                    Text(if (state.isUploading) "Please wait..." else "Take photo")
                }
                Button(
                    modifier = Modifier.weight(1f),
                    enabled = !state.isUploading,
                    onClick = onSelectPhoto,
                ) {
                    Text("Choose photo")
                }
            }

            status?.let {
                Text(
                    text = it,
                    color = Color.White,
                    modifier = Modifier
                        .padding(top = 12.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color.DarkGray.copy(alpha = 0.8f))
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                )
            }
        }
    }
}

@Composable
private fun AnnotatedPhoto(
    photo: ByteArray,
    prediction: Prediction?,
    modifier: Modifier,
) {
    val image = androidx.compose.runtime.remember(photo) { decodePhoto(photo) }
    if (image == null) return

    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        Image(
            bitmap = image,
            contentDescription = "Uploaded photo with predictions",
            contentScale = ContentScale.Fit,
            modifier = Modifier.fillMaxSize(),
        )
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
