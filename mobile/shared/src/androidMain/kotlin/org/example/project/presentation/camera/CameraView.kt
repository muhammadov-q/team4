package org.example.project.presentation.camera

import android.content.ActivityNotFoundException
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.FileProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.IOException

@Composable
actual fun CameraView(
    modifier: Modifier,
    cameraEffects: Flow<CameraEffect>,
    onPhotoCaptured: (ByteArray) -> Unit,
    onCaptureError: (String) -> Unit,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val captureFile = remember { mutableStateOf<File?>(null) }
    val galleryLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.GetContent(),
    ) { uri ->
        if (uri == null) {
            onCaptureError("Photo selection was cancelled.")
            return@rememberLauncherForActivityResult
        }
        scope.launch {
            try {
                val photo = withContext(Dispatchers.IO) {
                    context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
                        ?: throw IOException("Could not read the selected photo.")
                }
                if (photo.isEmpty()) onCaptureError("The selected photo contained no data.")
                else onPhotoCaptured(photo)
            } catch (exception: IOException) {
                onCaptureError(exception.message ?: "Could not read the selected photo.")
            } catch (exception: SecurityException) {
                onCaptureError(exception.message ?: "Could not read the selected photo.")
            }
        }
    }
    val cameraLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.TakePicture(),
    ) { success ->
        val photoFile = captureFile.value ?: return@rememberLauncherForActivityResult
        captureFile.value = null

        if (!success) {
            photoFile.delete()
            onCaptureError("Photo capture was cancelled.")
            return@rememberLauncherForActivityResult
        }

        scope.launch {
            try {
                val photo = withContext(Dispatchers.IO) {
                    photoFile.inputStream().use { it.readBytes() }
                }
                if (photo.isEmpty()) {
                    onCaptureError("The captured photo contained no image data.")
                } else {
                    onPhotoCaptured(photo)
                }
            } catch (exception: IOException) {
                onCaptureError(exception.message ?: "Could not read the captured photo.")
            } finally {
                photoFile.delete()
            }
        }
    }

    LaunchedEffect(cameraEffects) {
        cameraEffects.collect { effect ->
            when (effect) {
                CameraEffect.SelectPhoto -> galleryLauncher.launch("image/*")
                CameraEffect.CapturePhoto -> try {
                    val cameraDirectory = File(context.cacheDir, "camera").apply { mkdirs() }
                    val photoFile = File.createTempFile("captured-", ".jpg", cameraDirectory)
                    val photoUri = FileProvider.getUriForFile(
                        context,
                        "${context.packageName}.fileprovider",
                        photoFile,
                    )
                    captureFile.value = photoFile
                    cameraLauncher.launch(photoUri)
                } catch (exception: IOException) {
                    onCaptureError(exception.message ?: "Could not prepare a photo for the camera.")
                } catch (exception: ActivityNotFoundException) {
                    captureFile.value?.delete()
                    captureFile.value = null
                    onCaptureError("No camera app is available on this device.")
                }
            }
        }
    }
}
