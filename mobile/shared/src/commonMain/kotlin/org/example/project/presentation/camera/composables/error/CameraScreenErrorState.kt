package org.example.project.presentation.camera.composables.error

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.ui.tooling.preview.PreviewParameter
import androidx.compose.ui.unit.dp
import org.example.project.common.presentation.ui.asString
import org.example.project.common.presentation.ui.buttons.ScriptLensButton
import org.example.project.common.presentation.ui.buttons.ScriptLensButtonSize
import org.example.project.common.presentation.ui.buttons.ScriptLensButtonStyle
import org.example.project.common.presentation.ui.theme.ScriptLensColors
import org.example.project.common.presentation.ui.theme.ScriptLensSpacing
import org.example.project.common.presentation.ui.theme.ScriptLensTypography
import org.example.project.presentation.camera.models.CameraScreenErrorState
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import scriptlens.shared.generated.resources.Res
import scriptlens.shared.generated.resources.action_choose_another_photo
import scriptlens.shared.generated.resources.action_retry
import scriptlens.shared.generated.resources.action_take_new_photo

@Composable
fun ErrorState(
    errorState: CameraScreenErrorState,
    onTakeNewPhotoClicked: () -> Unit,
    onChooseFromPhotosClicked: () -> Unit,
    onRetryClicked: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(MaterialTheme.shapes.extraLarge)
            .background(ScriptLensColors.Surface)
            .padding(ScriptLensSpacing.padding_24),
        verticalArrangement = Arrangement.spacedBy(ScriptLensSpacing.padding_8),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            modifier = Modifier.size(64.dp),
            painter = painterResource(errorState.icon),
            contentDescription = null
        )

        Text(
            modifier = Modifier.padding(bottom = ScriptLensSpacing.padding_8),
            text = stringResource(errorState.title),
            style = ScriptLensTypography.Heading,
            color = ScriptLensColors.Text,
            textAlign = TextAlign.Center
        )

        Text(
            text = errorState.message.asString(),
            style = ScriptLensTypography.Body,
            color = ScriptLensColors.Subtext,
            textAlign = TextAlign.Center
        )

        if (errorState.canRetry) {
            ScriptLensButton(
                modifier = Modifier.padding(top = ScriptLensSpacing.padding_24),
                buttonStyle = ScriptLensButtonStyle.Primary,
                onClick = onRetryClicked,
                text = stringResource(Res.string.action_retry),
                buttonSize = ScriptLensButtonSize.Medium
            )
        }

        ScriptLensButton(
            text = stringResource(Res.string.action_take_new_photo),
            onClick = onTakeNewPhotoClicked,
            buttonStyle = ScriptLensButtonStyle.Secondary,
            buttonSize = ScriptLensButtonSize.Medium
        )

        ScriptLensButton(
            text = stringResource(Res.string.action_choose_another_photo),
            onClick = onChooseFromPhotosClicked,
            buttonStyle = ScriptLensButtonStyle.Secondary,
            buttonSize = ScriptLensButtonSize.Medium
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun ErrorStatePreview(
    @PreviewParameter(CameraScreenErrorStatePreviewProvider::class)
    errorState: CameraScreenErrorState,
) {
    MaterialTheme {
        ErrorState(
            errorState = errorState,
            onTakeNewPhotoClicked = {},
            onChooseFromPhotosClicked = {},
            onRetryClicked = {},
        )
    }
}
