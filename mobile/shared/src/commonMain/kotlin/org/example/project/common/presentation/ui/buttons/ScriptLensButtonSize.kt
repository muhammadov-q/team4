package org.example.project.common.presentation.ui.buttons

import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

enum class ScriptLensButtonSize (val padding: Dp, val minHeight: Dp) {
    Small(padding = 4.dp, minHeight = 24.dp),
    Medium(padding = 8.dp, minHeight = 32.dp),
    Large(padding = 16.dp, minHeight = 40.dp)
}