package org.example.project.presentation.camera

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
expect fun CameraView(
    modifier: Modifier,
    captureRequestId: Int,
    onPhotoCaptured: (ByteArray) -> Unit,
    onCaptureError: (String) -> Unit,
)
