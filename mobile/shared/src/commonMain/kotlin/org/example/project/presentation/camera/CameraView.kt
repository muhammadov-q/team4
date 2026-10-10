package org.example.project.presentation.camera

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import kotlinx.coroutines.flow.Flow
import io.github.ismoy.imagepickerkmp.extensions.loadBytes
import io.github.ismoy.imagepickerkmp.picker.ImagePickerResult
import io.github.ismoy.imagepickerkmp.picker.rememberImagePickerKMP

@Composable
fun CameraView(
    modifier: Modifier,
    cameraEffects: Flow<CameraEffect>,
    onPhotoCaptured: (ByteArray) -> Unit,
    onCaptureError: (String) -> Unit,
) {
    val picker = rememberImagePickerKMP()
    val result = picker.result

    LaunchedEffect(cameraEffects, picker) {
        cameraEffects.collect { effect ->
            when (effect) {
                CameraEffect.CapturePhoto -> picker.launchCamera(
                    onError = { onCaptureError(it.message ?: "Could not open the camera.") },
                    onDismiss = { onCaptureError("Photo operation was cancelled.") },
                )
                CameraEffect.SelectPhoto -> picker.launchGallery(
                    onError = { onCaptureError(it.message ?: "Could not open the photo library.") },
                    onDismiss = { onCaptureError("Photo operation was cancelled.") },
                )
            }
        }
    }

    LaunchedEffect(result) {
        if (result is ImagePickerResult.Success) {
            val photo = result.first?.loadBytes() ?: ByteArray(0)
            picker.reset()
            if (photo.isEmpty()) {
                onCaptureError("The photo contained no image data.")
            } else {
                onPhotoCaptured(photo)
            }
        } else if (result is ImagePickerResult.Error) {
            picker.reset()
            onCaptureError(result.exception.message ?: "Could not select a photo.")
        }
    }
}
