package org.example.project.presentation.camera

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import kotlinx.coroutines.flow.Flow

@Composable
expect fun CameraView(
    modifier: Modifier,
    cameraEffects: Flow<CameraEffect>,
    onPhotoCaptured: (ByteArray) -> Unit,
    onCaptureError: (String) -> Unit,
)
