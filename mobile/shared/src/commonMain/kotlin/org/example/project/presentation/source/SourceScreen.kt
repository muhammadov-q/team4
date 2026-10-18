package org.example.project.presentation.source

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import org.jetbrains.compose.resources.stringResource
import scriptlens.shared.generated.resources.Res
import scriptlens.shared.generated.resources.nav_source
import org.example.project.common.presentation.ui.theme.ScriptLensTypography

@Composable
fun SourceScreen() {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(stringResource(Res.string.nav_source), style = ScriptLensTypography.Heading)
    }
}
