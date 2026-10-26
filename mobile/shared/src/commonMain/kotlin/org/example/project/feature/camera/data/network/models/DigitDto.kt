package org.example.project.feature.camera.data.network.models

import kotlinx.serialization.Serializable

@Serializable
data class DigitDto(
    val digit: Int,
    val probabilities: Map<String, Double>,
    val box: BoxDto,
)

