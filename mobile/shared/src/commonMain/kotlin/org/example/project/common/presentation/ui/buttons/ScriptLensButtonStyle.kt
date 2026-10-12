package org.example.project.common.presentation.ui.buttons

import androidx.compose.foundation.BorderStroke
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

enum class ScriptLensButtonStyle(
    val containerColor: Color,
    val textColor: Color,
    val borderStroke: BorderStroke
) {
    Primary(
        containerColor = Color(0xFFE6FF66),
        textColor = Color(0xFF50582A),
        borderStroke = BorderStroke(0.dp, Color.Transparent)
    ),
    Secondary(
        containerColor = Color.White,
        textColor = Color.Gray,
        borderStroke = BorderStroke(1.dp, Color.LightGray)
    ),
}