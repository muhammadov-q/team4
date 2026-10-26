package org.example.project.feature.camera.presentation.composables

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.tooling.preview.Preview
import org.example.project.common.presentation.ui.theme.ScriptLensSpacing
import org.example.project.common.presentation.ui.composables.buttons.ScriptLensButton
import org.example.project.common.presentation.ui.composables.buttons.ScriptLensButtonStyle
import org.example.project.feature.camera.presentation.models.DigitPredictionModel
import org.example.project.feature.camera.presentation.models.PredictionBoxModel
import org.example.project.feature.camera.presentation.models.PredictionModel
import androidx.compose.material3.MaterialTheme
import org.example.project.feature.camera.presentation.composables.predictions.PredictionSummary
import org.example.project.feature.camera.presentation.helpers.decodePhoto
import org.jetbrains.compose.resources.stringResource
import scriptlens.shared.generated.resources.Res
import scriptlens.shared.generated.resources.captured_photo_description
import scriptlens.shared.generated.resources.action_take_new_photo
import scriptlens.shared.generated.resources.action_choose_another_photo
import org.example.project.common.presentation.ui.theme.ScriptLensColors

@Composable
fun CapturedPhotoContent(
    photo: ByteArray?,
    prediction: PredictionModel?,
    onTakeNewPhotoClicked: () -> Unit,
    onChooseFromPhotosClicked: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val imageBitMap =
        photo?.let { remember(photo) { decodePhoto(photo) } }

    Column(modifier = modifier) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(MaterialTheme.shapes.extraLarge)
                .background(ScriptLensColors.Surface),
            contentAlignment = Alignment.Center
        ) {
            imageBitMap?.let {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(ScriptLensSpacing.padding_8)
                        .clip(MaterialTheme.shapes.extraLarge)
                        .aspectRatio(imageBitMap.width.toFloat() / imageBitMap.height.toFloat())
                ) {
                    Image(
                        bitmap = imageBitMap,
                        contentDescription = stringResource(Res.string.captured_photo_description),
                        contentScale = ContentScale.FillBounds,
                        modifier = Modifier.matchParentSize(),
                    )
                    PredictionOverlay(
                        image = imageBitMap,
                        prediction = prediction,
                        modifier = Modifier.matchParentSize(),
                    )
                }
            }
        }

        PredictionSummary(
            modifier = Modifier.padding(top = ScriptLensSpacing.padding_16),
            prediction = prediction
        )

        ScriptLensButton(
            modifier = Modifier.padding(vertical = ScriptLensSpacing.padding_8),
            text = stringResource(Res.string.action_take_new_photo),
            onClick = onTakeNewPhotoClicked,
            buttonStyle = ScriptLensButtonStyle.Primary
        )

        ScriptLensButton(
            modifier = Modifier.padding(bottom = ScriptLensSpacing.padding_4),
            text = stringResource(Res.string.action_choose_another_photo),
            onClick = onChooseFromPhotosClicked,
            buttonStyle = ScriptLensButtonStyle.Secondary
        )

    }
}

@Preview(showBackground = true)
@Composable
private fun CapturedPhotoPreview() {
    MaterialTheme {
        CapturedPhotoContent(
            photo = null,
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
                ),
                modelVersion = "preview",
            ),
            onTakeNewPhotoClicked = {},
            onChooseFromPhotosClicked = {},
        )
    }
}
