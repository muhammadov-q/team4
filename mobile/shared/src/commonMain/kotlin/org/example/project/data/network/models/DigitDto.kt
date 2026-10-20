package org.example.project.data.network.models

import kotlinx.serialization.Serializable

@Serializable
data class DigitDto(
    val digit: Int,
    val probabilities: Map<String, Double>,
    val box: BoxDto,
)
