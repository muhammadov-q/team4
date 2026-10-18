package org.example.project.common.presentation.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp

private val ScriptLensColorScheme = lightColorScheme(
    primary = ScriptLensColors.Accent,
    onPrimary = ScriptLensColors.OnAccent,
    background = ScriptLensColors.Background,
    onBackground = ScriptLensColors.Text,
    surface = ScriptLensColors.Surface,
    onSurface = ScriptLensColors.Text,
    surfaceVariant = ScriptLensColors.Muted,
    onSurfaceVariant = ScriptLensColors.Subtext,
    outline = ScriptLensColors.Border,
    scrim = ScriptLensColors.Scrim,
)

private val ScriptLensShapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(12.dp),
    large = RoundedCornerShape(16.dp),
    extraLarge = RoundedCornerShape(24.dp),
)

@Composable
fun ScriptLensTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = ScriptLensColorScheme,
        typography = ScriptLensMaterialTypography,
        shapes = ScriptLensShapes,
        content = content,
    )
}
