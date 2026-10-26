package org.example.project.feature.camera.data.network.models

import kotlinx.serialization.Serializable

@Serializable
data class GlossDto(
    val lemma: String,
    val translation: String,
    val definition: String,
)

