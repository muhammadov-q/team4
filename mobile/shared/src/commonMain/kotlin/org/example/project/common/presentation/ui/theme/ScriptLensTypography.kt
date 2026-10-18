package org.example.project.common.presentation.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

object ScriptLensTypography {
    val Title = TextStyle(fontSize = 32.sp, lineHeight = 40.sp, fontWeight = FontWeight.Bold)
    val Heading = TextStyle(fontSize = 24.sp, lineHeight = 32.sp, fontWeight = FontWeight.SemiBold)
    val Subtitle = TextStyle(fontSize = 16.sp, lineHeight = 24.sp, fontWeight = FontWeight.Medium)
    val Body = TextStyle(fontSize = 16.sp, lineHeight = 24.sp, fontWeight = FontWeight.Normal)
    val Label = TextStyle(fontSize = 14.sp, lineHeight = 20.sp, fontWeight = FontWeight.Medium)
    val Caption = TextStyle(fontSize = 10.sp, lineHeight = 14.sp, fontWeight = FontWeight.Normal)
}

internal val ScriptLensMaterialTypography = Typography(
    headlineLarge = ScriptLensTypography.Title,
    headlineMedium = ScriptLensTypography.Heading,
    titleMedium = ScriptLensTypography.Subtitle,
    bodyLarge = ScriptLensTypography.Body,
    bodyMedium = ScriptLensTypography.Body,
    labelLarge = ScriptLensTypography.Label,
    labelSmall = ScriptLensTypography.Caption,
)
