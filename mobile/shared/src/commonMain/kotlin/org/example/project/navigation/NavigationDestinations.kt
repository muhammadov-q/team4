package org.example.project.navigation

import org.jetbrains.compose.resources.DrawableResource
import scriptlens.shared.generated.resources.Res
import scriptlens.shared.generated.resources.ic_camera
import scriptlens.shared.generated.resources.ic_docs
import scriptlens.shared.generated.resources.ic_source

enum class Screen(
    val route: String,
    val title: String,
    val icon : DrawableResource
) {
    CameraView("camera", "Camera", Res.drawable.ic_camera),
    Docs("docs", "Documents",Res.drawable.ic_docs),
    Source("source", "Source",Res.drawable.ic_source),
}
