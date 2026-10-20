package org.example.project.feature.camera.presentation.composables

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import org.example.project.common.presentation.ui.theme.ScriptLensSpacing
import org.example.project.common.presentation.ui.composables.buttons.ScriptLensButton
import org.example.project.common.presentation.ui.composables.buttons.ScriptLensButtonStyle
import org.jetbrains.compose.resources.painterResource
import scriptlens.shared.generated.resources.Res
import scriptlens.shared.generated.resources.ic_camera
import org.jetbrains.compose.resources.stringResource
import scriptlens.shared.generated.resources.camera_empty_hint
import scriptlens.shared.generated.resources.action_take_photo
import scriptlens.shared.generated.resources.action_choose_photo
import org.example.project.common.presentation.ui.theme.ScriptLensColors


@Composable
fun EmptyCameraState(
    modifier: Modifier = Modifier,
    onTakePhotoClicked: () -> Unit,
    onChooseFromPhotosClicked: () -> Unit
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(MaterialTheme.shapes.extraLarge)
            .background(ScriptLensColors.Surface)
            .padding(ScriptLensSpacing.padding_24),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {

        Icon(
            modifier = Modifier.padding(bottom = ScriptLensSpacing.padding_12).size(28.dp),
            painter = painterResource(Res.drawable.ic_camera),
            contentDescription = null,
        )

        Text(
            modifier = Modifier.padding(bottom = ScriptLensSpacing.padding_56),
            text = stringResource(Res.string.camera_empty_hint),
            color = ScriptLensColors.Subtext,
            textAlign = TextAlign.Center,
        )

        ScriptLensButton(
            modifier = Modifier.padding(bottom = ScriptLensSpacing.padding_8),
            text = stringResource(Res.string.action_take_photo),
            onClick = onTakePhotoClicked,
            buttonStyle = ScriptLensButtonStyle.Primary
        )

        ScriptLensButton(
            modifier = Modifier.padding(bottom = ScriptLensSpacing.padding_4),
            text = stringResource(Res.string.action_choose_photo),
            onClick = onChooseFromPhotosClicked,
            buttonStyle = ScriptLensButtonStyle.Secondary
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun EmptyCameraStatePreview() {
    MaterialTheme {
        EmptyCameraState(
            onTakePhotoClicked = {},
            onChooseFromPhotosClicked = {},
        )
    }
}

