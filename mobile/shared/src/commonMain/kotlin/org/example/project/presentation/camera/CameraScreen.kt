package org.example.project.presentation.camera

import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.draw.clip
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.example.project.domain.model.Prediction

@Composable
fun CameraScreen(viewModel: CameraViewModel) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var captureRequestId by remember { mutableIntStateOf(0) }

    LaunchedEffect(viewModel) {
        viewModel.effects.collect { effect ->
            when (effect) {
                CameraEffect.CapturePhoto -> captureRequestId += 1
            }
        }
    }

    CameraScreenContent(
        state = state,
        onCapture = { viewModel.onEvent(CameraEvent.CapturePhotoRequested) },
        cameraContent = { modifier ->
            CameraView(
                modifier = modifier,
                captureRequestId = captureRequestId,
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
    cameraContent: @Composable (Modifier) -> Unit,
) {
    Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        cameraContent(Modifier.fillMaxSize())

        val prediction = state.prediction
        val status = when {
            state.isUploading -> "Sending photo..."
            prediction != null -> "Prediction: ${prediction.value} (model ${prediction.modelVersion})"
            state.error != null -> state.error
            else -> null
        }

        Button(
            modifier = Modifier
                .align(Alignment.Center),
            enabled = !state.isUploading,
            onClick = onCapture,
        ) {
            Text(if (state.isUploading) "Please wait..." else "Take photo and send")
        }

        status?.let {
            Text(
                text = it,
                color = Color.White,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(24.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color.Black.copy(alpha = 0.65f))
                    .padding(horizontal = 16.dp, vertical = 10.dp),
            )
        }
    }
}

@Preview
@Composable
private fun CameraScreenPreview() {
    MaterialTheme {
        CameraScreenContent(
            state = CameraContract(
                prediction = Prediction(value = 0.87, modelVersion = "preview"),
            ),
            onCapture = {},
            cameraContent = { modifier ->
                Box(
                    modifier = modifier.background(Color.Black),
                    contentAlignment = Alignment.Center,
                ) {
                    Text("Camera preview", color = Color.White)
                }
            },
        )
    }
}
