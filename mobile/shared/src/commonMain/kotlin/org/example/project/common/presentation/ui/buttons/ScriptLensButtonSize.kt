package org.example.project.common.presentation.ui.buttons

import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import org.example.project.common.presentation.ui.theme.ScriptLensSpacing

enum class ScriptLensButtonSize (val padding: Dp, val minHeight: Dp) {
    Small(padding = ScriptLensSpacing.P4, minHeight = 24.dp),
    Medium(padding = ScriptLensSpacing.P8, minHeight = 32.dp),
    Large(padding = ScriptLensSpacing.P16, minHeight = 40.dp)
}