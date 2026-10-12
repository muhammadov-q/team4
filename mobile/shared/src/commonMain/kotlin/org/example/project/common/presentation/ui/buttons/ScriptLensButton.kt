package org.example.project.common.presentation.ui.buttons

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

@Composable
fun ScriptLensButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    buttonStyle: ScriptLensButtonStyle = ScriptLensButtonStyle.Primary,
) {

    Button(
        modifier = modifier.fillMaxWidth(),
        onClick = onClick,
        shape = RoundedCornerShape(10.dp),
        colors = androidx.compose.material3.ButtonDefaults.buttonColors(
            containerColor = buttonStyle.containerColor,
            contentColor = buttonStyle.textColor
        ),
        border = buttonStyle.borderStroke

    ) {
        Text(
            modifier = Modifier.padding(vertical = 16.dp),
            text = text,
            color = buttonStyle.textColor
        )
    }
}


@Preview
@Composable
private fun ScriptLensButtonPreview() {
    ScriptLensButton(
        onClick = {},
        text = "Click Me",
        buttonStyle = ScriptLensButtonStyle.Primary
    )
}