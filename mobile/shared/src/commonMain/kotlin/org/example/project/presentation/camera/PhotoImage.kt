package org.example.project.presentation.camera

import androidx.compose.ui.graphics.ImageBitmap

expect fun decodePhoto(bytes: ByteArray): ImageBitmap?
