package org.example.project.feature.camera.presentation.helpers

import androidx.compose.ui.graphics.ImageBitmap

expect fun decodePhoto(bytes: ByteArray): ImageBitmap?

