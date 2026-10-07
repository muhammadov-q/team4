package org.example.project.domain.model

data class Prediction(
    val predictions: List<DigitPrediction>,
    val modelVersion: String,
)

data class DigitPrediction(
    val digit: Int,
    val probabilities: Map<String, Double>,
    val box: PredictionBox,
)

data class PredictionBox(
    val x: Double,
    val y: Double,
    val w: Double,
    val h: Double,
)
