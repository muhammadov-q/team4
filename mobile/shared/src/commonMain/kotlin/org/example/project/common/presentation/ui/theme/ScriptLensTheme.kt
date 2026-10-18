package org.example.project.common.presentation.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

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

@Composable
fun ScriptLensTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = ScriptLensColorScheme,
        typography = ScriptLensMaterialTypography,
        content = content,
    )
}
