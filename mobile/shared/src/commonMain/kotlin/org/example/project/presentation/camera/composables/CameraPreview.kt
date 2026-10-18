package org.example.project.presentation.camera.composables

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import kotlinx.coroutines.flow.Flow
import io.github.ismoy.imagepickerkmp.extensions.loadBytes
import io.github.ismoy.imagepickerkmp.picker.ImagePickerResult
import io.github.ismoy.imagepickerkmp.picker.rememberImagePickerKMP
import org.example.project.presentation.camera.CameraEffect
import org.jetbrains.compose.resources.stringResource
import scriptlens.shared.generated.resources.Res
import scriptlens.shared.generated.resources.error_camera_open
import scriptlens.shared.generated.resources.error_gallery_open
import scriptlens.shared.generated.resources.error_photo_no_data
import scriptlens.shared.generated.resources.error_photo_select

@Composable
fun CameraPreview(
    cameraEffects: Flow<CameraEffect>,
    onPhotoCaptured: (ByteArray) -> Unit,
    onCaptureError: (String) -> Unit,
    onCaptureCancelled: () -> Unit,
) {
    val cameraOpenError = stringResource(Res.string.error_camera_open)
    val galleryOpenError = stringResource(Res.string.error_gallery_open)
    val noDataError = stringResource(Res.string.error_photo_no_data)
    val selectError = stringResource(Res.string.error_photo_select)
    val picker = rememberImagePickerKMP()
    val result = picker.result

    LaunchedEffect(cameraEffects, picker) {
        cameraEffects.collect { effect ->
            when (effect) {
                CameraEffect.CapturePhoto -> picker.launchCamera(
                    onError = { onCaptureError(it.message ?: cameraOpenError) },
                    onDismiss = onCaptureCancelled,
                )
                CameraEffect.SelectPhoto -> picker.launchGallery(
                    onError = { onCaptureError(it.message ?: galleryOpenError) },
                    onDismiss = onCaptureCancelled,
                )
            }
        }
    }

    LaunchedEffect(result) {
        if (result is ImagePickerResult.Success) {
            val photo = result.first?.loadBytes() ?: ByteArray(0)
            picker.reset()
            if (photo.isEmpty()) {
                onCaptureError(noDataError)
            } else {
                onPhotoCaptured(photo)
            }
        } else if (result is ImagePickerResult.Error) {
            picker.reset()
            onCaptureError(result.exception.message ?: selectError)
        }
    }
}
