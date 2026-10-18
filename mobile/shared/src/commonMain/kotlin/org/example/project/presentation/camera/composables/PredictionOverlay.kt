package org.example.project.presentation.camera.composables

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import org.example.project.common.presentation.ui.theme.ScriptLensSpacing
import org.example.project.presentation.camera.models.PredictionModel
import org.example.project.common.presentation.ui.theme.ScriptLensColors
import org.example.project.common.presentation.ui.theme.ScriptLensTypography

@Composable
fun PredictionOverlay(
    image: ImageBitmap,
    prediction: PredictionModel?,
    modifier: Modifier = Modifier,
) {
    BoxWithConstraints(modifier = modifier) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val scaleX = size.width / image.width
            val scaleY = size.height / image.height

            prediction?.predictions?.forEach { digitPrediction ->
                val box = digitPrediction.box
                val topLeft = Offset(
                    (box.x * scaleX).toFloat(),
                    (box.y * scaleY).toFloat(),
                )
                val boxSize = Size(
                    (box.w * scaleX).toFloat(),
                    (box.h * scaleY).toFloat(),
                )

                drawRect(
                    color = ScriptLensColors.Subtext,
                    topLeft = topLeft,
                    size = boxSize,
                    style = Stroke(width = 3.dp.toPx()),
                )
                drawRect(
                    color = ScriptLensColors.Accent,
                    topLeft = topLeft,
                    size = boxSize,
                    style = Stroke(width = 2.dp.toPx()),
                )
            }
        }

        val density = LocalDensity.current
        val scaleX = with(density) { maxWidth.toPx() } / image.width
        val scaleY = with(density) { maxHeight.toPx() } / image.height
        prediction?.predictions?.forEach { digitPrediction ->
            Text(
                text = digitPrediction.digit.toString(),
                color = ScriptLensColors.Text,
                style = ScriptLensTypography.Caption,
                modifier = Modifier
                    .offset(
                        x = with(density) {
                            (digitPrediction.box.x * scaleX).toFloat().toDp()
                        },
                        y = with(density) {
                            (digitPrediction.box.y * scaleY)
                                .toFloat()
                                .toDp() - 18.dp
                        },
                    )
                    .background(ScriptLensColors.Accent)
                    .padding(horizontal = ScriptLensSpacing.P8, vertical = ScriptLensSpacing.P4),
            )
        }
    }
}
