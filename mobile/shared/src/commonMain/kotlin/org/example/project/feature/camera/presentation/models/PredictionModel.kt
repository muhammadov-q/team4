package org.example.project.feature.camera.presentation.models

data class PredictionModel (
    val predictions: List<DigitPredictionModel>,
    val modelVersion: String,
)

data class DigitPredictionModel(
    val digit: Int,
    val probability: String,
    val box: PredictionBoxModel,
)

data class PredictionBoxModel(
    val x: Double,
    val y: Double,
    val w: Double,
    val h: Double,
)
