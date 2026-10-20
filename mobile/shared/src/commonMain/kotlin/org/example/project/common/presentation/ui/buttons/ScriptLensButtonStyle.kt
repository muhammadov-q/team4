package org.example.project.common.presentation.ui.buttons

import androidx.compose.foundation.BorderStroke
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import org.example.project.common.presentation.ui.theme.ScriptLensColors

enum class ScriptLensButtonStyle(
    val containerColor: Color,
    val textColor: Color,
    val borderStroke: BorderStroke
) {
    Primary(
        containerColor = ScriptLensColors.Accent,
        textColor = ScriptLensColors.OnAccent,
        borderStroke = BorderStroke(0.dp, Color.Transparent)
    ),
    Secondary(
        containerColor = ScriptLensColors.Surface,
        textColor = ScriptLensColors.Subtext,
        borderStroke = BorderStroke(1.dp, ScriptLensColors.Border)
    ),
}