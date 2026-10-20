package org.example.project.common.presentation.ui.webview

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
expect fun WebView(url: String, modifier: Modifier = Modifier)
