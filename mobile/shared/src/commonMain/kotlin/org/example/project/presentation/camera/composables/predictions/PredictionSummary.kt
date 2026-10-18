package org.example.project.presentation.camera.composables.predictions

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalGridApi
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import org.example.project.common.presentation.ui.theme.ScriptLensCorners
import org.example.project.common.presentation.ui.theme.ScriptLensSpacing
import org.example.project.presentation.camera.models.DigitPredictionModel
import org.example.project.presentation.camera.models.PredictionBoxModel
import org.example.project.presentation.camera.models.PredictionModel
import org.jetbrains.compose.resources.stringResource
import scriptlens.shared.generated.resources.Res
import scriptlens.shared.generated.resources.prediction_digits_read
import scriptlens.shared.generated.resources.prediction_confidence_label
import org.example.project.common.presentation.ui.theme.ScriptLensColors
import org.example.project.common.presentation.ui.theme.ScriptLensTypography

@OptIn(ExperimentalGridApi::class, ExperimentalLayoutApi::class)
@Composable
fun PredictionSummary(
    prediction: PredictionModel?,
    modifier: Modifier = Modifier
) {
    prediction?.let {
        Column(
            modifier = modifier
                .fillMaxWidth()
                .background(ScriptLensColors.Surface)
                .padding(ScriptLensSpacing.P16)
        ) {
            Text(
                modifier = Modifier.padding(bottom = ScriptLensSpacing.P8),
                text = stringResource(Res.string.prediction_digits_read),
                color = ScriptLensColors.Subtext
            )
            Text(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(ScriptLensCorners.R16))
                    .background(ScriptLensColors.Muted)
                    .padding(ScriptLensSpacing.P8),
                text = prediction.predictions.joinToString("") { it.digit.toString() },
                color = ScriptLensColors.Text,
                style = ScriptLensTypography.Title
            )

            Text(
                modifier = Modifier.padding(top = ScriptLensSpacing.P12),
                text = stringResource(Res.string.prediction_confidence_label),
                color = ScriptLensColors.Subtext
            )

            FlowRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalArrangement = Arrangement.spacedBy(ScriptLensSpacing.P8),
                maxItemsInEachRow = 4,
            ) {
                prediction.predictions.forEach { digitPrediction ->
                    DigitPredictionItem(
                        modifier = Modifier.fillMaxRowHeight(),
                        digitPrediction = digitPrediction
                    )
                }
            }

        }
    }
}

@Preview(showBackground = true)
@Composable
private fun PredictionInfoPreview() {
    MaterialTheme {
        PredictionSummary(
            prediction = PredictionModel(
                predictions = listOf(
                    DigitPredictionModel(
                        digit = 3,
                        probability = "92%",
                        box = PredictionBoxModel(80.0, 60.0, 120.0, 180.0),
                    ),
                    DigitPredictionModel(
                        digit = 7,
                        probability = "87%",
                        box = PredictionBoxModel(240.0, 60.0, 120.0, 180.0),
                    ),
                    DigitPredictionModel(
                        digit = 4,
                        probability = "95%",
                        box = PredictionBoxModel(400.0, 60.0, 120.0, 180.0),
                    ),
                ),
                modelVersion = "preview",
            ),
        )
    }
}
