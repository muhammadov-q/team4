package org.example.project.presentation.camera.composables.error

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import org.example.project.common.presentation.ui.buttons.ScriptLensButton
import org.example.project.common.presentation.ui.buttons.ScriptLensButtonSize
import org.example.project.common.presentation.ui.buttons.ScriptLensButtonStyle
import org.example.project.presentation.camera.models.CameraScreenErrorState
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import org.example.project.common.presentation.ui.asString
import scriptlens.shared.generated.resources.Res
import scriptlens.shared.generated.resources.action_retry
import scriptlens.shared.generated.resources.action_take_new_photo
import scriptlens.shared.generated.resources.action_choose_another_photo

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
            .clip(RoundedCornerShape(22.dp))
            .background(Color.White)
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            modifier = Modifier.size(64.dp),
            painter = painterResource(errorState.icon),
            contentDescription = null
        )

        Text(
            text = stringResource(errorState.title),
            style = MaterialTheme.typography.titleMedium,
            color = Color.Gray,
        )
        Text(
            text = errorState.message.asString(),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onErrorContainer,
        )

        if (errorState.canRetry) {
            ScriptLensButton(
                modifier = Modifier.padding(top = 24.dp),
                buttonStyle = ScriptLensButtonStyle.Primary,
                onClick = onRetryClicked,
                text = stringResource(Res.string.action_retry),
                buttonSize = ScriptLensButtonSize.Small
            )
        }

        ScriptLensButton(
            text = stringResource(Res.string.action_take_new_photo),
            onClick = onTakeNewPhotoClicked,
            buttonStyle = ScriptLensButtonStyle.Secondary,
            buttonSize = ScriptLensButtonSize.Small
        )

        ScriptLensButton(
            text = stringResource(Res.string.action_choose_another_photo),
            onClick = onChooseFromPhotosClicked,
            buttonStyle = ScriptLensButtonStyle.Secondary,
            buttonSize = ScriptLensButtonSize.Small
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun ErrorStatePreview() {
    MaterialTheme {
        ErrorState(
            errorState = CameraScreenErrorState.ServiceOffline,
            onTakeNewPhotoClicked = {},
            onChooseFromPhotosClicked = {},
            onRetryClicked = {}
        )
    }
}
