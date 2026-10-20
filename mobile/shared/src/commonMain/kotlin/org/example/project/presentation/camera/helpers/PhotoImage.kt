package org.example.project.presentation.camera.helpers

import androidx.compose.ui.graphics.ImageBitmap

expect fun decodePhoto(bytes: ByteArray): ImageBitmap?
