package org.example.project.common.presentation.ui

import androidx.compose.runtime.Composable
import org.jetbrains.compose.resources.StringResource
import org.jetbrains.compose.resources.stringResource

/** Text that is either a string resource or a runtime message (e.g. from the camera or gallery). */
sealed interface UiText {
    data class Resource(val resource: StringResource) : UiText
    data class Plain(val value: String) : UiText
}

@Composable
fun UiText.asString(): String = when (this) {
    is UiText.Resource -> stringResource(resource)
    is UiText.Plain -> value
}
