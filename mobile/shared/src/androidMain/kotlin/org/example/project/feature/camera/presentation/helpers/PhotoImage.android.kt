package org.example.project.feature.camera.presentation.helpers

import android.graphics.BitmapFactory
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap

private const val MAX_DISPLAY_SIDE = 2048

// Full-size camera photos can exceed Android's canvas bitmap limit, so decode a downsampled copy for display.
actual fun decodePhoto(bytes: ByteArray): ImageBitmap? {
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    BitmapFactory.decodeByteArray(bytes, 0, bytes.size, bounds)

    val options = BitmapFactory.Options().apply {
        inSampleSize = calculateSampleSize(bounds.outWidth, bounds.outHeight)
    }
    return BitmapFactory.decodeByteArray(bytes, 0, bytes.size, options)?.asImageBitmap()
}

internal fun calculateSampleSize(width: Int, height: Int, maxDisplaySide: Int = MAX_DISPLAY_SIDE): Int {
    val longSide = maxOf(width, height)
    var sampleSize = 1
    while (longSide / sampleSize > maxDisplaySide) {
        sampleSize *= 2
    }
    return sampleSize
}

