package org.example.project.feature.camera.data.network.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class PredictionDto(
    val predictions: List<DigitDto>,
    @SerialName("model_version")
    val modelVersion: String,
)

