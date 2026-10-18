package org.example.project.data.network.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class PredictionDto(
    val predictions: List<DigitDto>,
    @SerialName("model_version")
    val modelVersion: String,
)
