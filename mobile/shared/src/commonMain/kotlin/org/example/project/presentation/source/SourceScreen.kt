package org.example.project.presentation.source

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import org.example.project.common.presentation.ui.webview.WebView

private const val SOURCE_URL = "https://github.com/muhammadov-q/team4"

@Composable
fun SourceScreen() {
    WebView(url = SOURCE_URL, modifier = Modifier.fillMaxSize())
}
