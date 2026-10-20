package org.example.project.presentation.camera.helpers

import io.github.ismoy.imagepickerkmp.extensions.loadBytes
import io.github.ismoy.imagepickerkmp.picker.PhotoResult
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

suspend fun loadPhotoBytes(photo: PhotoResult?): ByteArray? =
    try {
        withContext(Dispatchers.Default) { photo?.loadBytes() }
    } catch (cancellation: CancellationException) {
        throw cancellation
    } catch (_: Exception) {
        null
    }

