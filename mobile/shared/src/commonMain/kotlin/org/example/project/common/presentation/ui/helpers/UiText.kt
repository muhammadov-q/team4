package org.example.project.common.presentation.ui.helpers

import androidx.compose.runtime.Composable
import org.jetbrains.compose.resources.StringResource
import org.jetbrains.compose.resources.stringResource

sealed interface UiText {
    data class Resource(val resource: StringResource) : UiText
    data class Plain(val value: String) : UiText
}

@Composable
fun UiText.asString(): String = when (this) {
    is UiText.Resource -> stringResource(resource)
    is UiText.Plain -> value
}
