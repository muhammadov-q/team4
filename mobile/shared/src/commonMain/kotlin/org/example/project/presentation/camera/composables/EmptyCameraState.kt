package org.example.project.presentation.camera.composables

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.material3.MaterialTheme
import org.example.project.common.presentation.ui.buttons.ScriptLensButton
import org.example.project.common.presentation.ui.buttons.ScriptLensButtonStyle
import org.jetbrains.compose.resources.painterResource
import scriptlens.shared.generated.resources.Res
import scriptlens.shared.generated.resources.ic_camera


@Composable
fun EmptyCameraState(
    modifier: Modifier = Modifier,
    onTakePhotoClicked: () -> Unit,
    onChooseFromPhotosClicked: () -> Unit
) {
    Column(
        modifier = modifier.background(Color.White).padding(22.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {

        Icon(
            modifier = Modifier.padding(bottom = 12.dp).size(28.dp),
            painter = painterResource(Res.drawable.ic_camera),
            contentDescription = null,
        )

        Text(
            modifier = Modifier.padding(bottom = 55.dp),
            text = "Lay the page flat in good light JPG, PNG or TIFF",
            color = Color.Gray,
            textAlign = TextAlign.Center,
        )

        ScriptLensButton(
            modifier = Modifier.padding(bottom = 8.dp),
            text = "Take a photo",
            onClick = onTakePhotoClicked,
            buttonStyle = ScriptLensButtonStyle.Primary
        )

        ScriptLensButton(
            modifier = Modifier.padding(bottom = 4.dp),
            text = "Choose from photos",
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
