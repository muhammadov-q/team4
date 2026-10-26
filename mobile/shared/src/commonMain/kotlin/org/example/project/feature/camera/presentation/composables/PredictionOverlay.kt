package org.example.project.feature.camera.presentation.composables

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import org.example.project.common.presentation.ui.theme.ScriptLensColors
import org.example.project.feature.camera.presentation.models.PredictionModel

@Composable
fun PredictionOverlay(
    image: ImageBitmap,
    prediction: PredictionModel?,
    selectedPredictionIndex: Int?,
    onPredictionSelected: (Int) -> Unit,
    zoomScale: Float,
    panOffset: Offset,
    modifier: Modifier = Modifier,
) {
    var containerSize by remember { mutableStateOf(IntSize.Zero) }
    val predictions = prediction?.predictions.orEmpty()

    Canvas(
        modifier = modifier
            .fillMaxSize()
            .onSizeChanged { containerSize = it }
            .pointerInput(predictions, zoomScale, panOffset, containerSize) {
                detectTapGestures { tap ->
                    if (containerSize.width == 0 || containerSize.height == 0 || predictions.isEmpty()) return@detectTapGestures

                    val center = Offset(containerSize.width / 2f, containerSize.height / 2f)
                    val untransformedTap = Offset(
                        x = ((tap.x - center.x - panOffset.x) / zoomScale) + center.x,
                        y = ((tap.y - center.y - panOffset.y) / zoomScale) + center.y,
                    )

                    val scaleX = containerSize.width.toFloat() / image.width
                    val scaleY = containerSize.height.toFloat() / image.height
                    val imageTapX = untransformedTap.x / scaleX
                    val imageTapY = untransformedTap.y / scaleY

                    val selected = predictions.withIndex()
                        .filter { (_, word) -> isValidBox(word.box.x, word.box.y, word.box.w, word.box.h) }
                        .filter { (_, word) ->
                            imageTapX >= word.box.x &&
                                imageTapX <= word.box.x + word.box.w &&
                                imageTapY >= word.box.y &&
                                imageTapY <= word.box.y + word.box.h
                        }
                        .minByOrNull { (_, word) -> word.box.w * word.box.h }

                    selected?.let { onPredictionSelected(it.index) }
                }
            },
    ) {
        val selectedWord = selectedPredictionIndex
            ?.takeIf { it in predictions.indices }
            ?.let { predictions[it] }

        selectedWord?.takeIf { isValidBox(it.box.x, it.box.y, it.box.w, it.box.h) }?.let { word ->
            val scaleX = size.width / image.width
            val scaleY = size.height / image.height

            val topLeft = Offset(
                (word.box.x * scaleX).toFloat(),
                (word.box.y * scaleY).toFloat(),
            )
            val boxSize = Size(
                (word.box.w * scaleX).toFloat(),
                (word.box.h * scaleY).toFloat(),
            )

            drawRect(
                color = ScriptLensColors.Accent,
                topLeft = topLeft,
                size = boxSize,
                style = Stroke(width = 1.5.dp.toPx()),
            )
        }
    }
}

private fun isValidBox(x: Double, y: Double, w: Double, h: Double): Boolean =
    x >= 0.0 && y >= 0.0 && w > 0.0 && h > 0.0

