package org.example.project.navigation

import org.jetbrains.compose.resources.DrawableResource
import scriptlens.shared.generated.resources.Res
import scriptlens.shared.generated.resources.ic_camera
import scriptlens.shared.generated.resources.ic_docs
import scriptlens.shared.generated.resources.ic_source
import org.jetbrains.compose.resources.StringResource
import scriptlens.shared.generated.resources.nav_camera
import scriptlens.shared.generated.resources.nav_documents
import scriptlens.shared.generated.resources.nav_source

enum class Screen(
    val route: String,
    val title: StringResource,
    val icon : DrawableResource
) {
    CameraView("camera", Res.string.nav_camera, Res.drawable.ic_camera),
    Docs("docs", Res.string.nav_documents, Res.drawable.ic_docs),
    Source("source", Res.string.nav_source, Res.drawable.ic_source),
}
