package org.example.project.presentation.mappers

import org.example.project.domain.model.DigitPrediction
import org.example.project.domain.model.Prediction
import org.example.project.domain.model.PredictionBox
import org.example.project.presentation.camera.models.DigitPredictionModel
import org.example.project.presentation.camera.models.PredictionBoxModel
import org.example.project.presentation.camera.models.PredictionModel
import kotlin.math.roundToInt

fun mapPredictionToUiModel(prediction: Prediction): PredictionModel =
    PredictionModel(
        predictions = prediction.predictions.map(::mapDigitPredictionToUiModel),
        modelVersion = prediction.modelVersion,
    )

private fun mapDigitPredictionToUiModel(
    prediction: DigitPrediction,
): DigitPredictionModel {
    val highestProbability = prediction.probabilities.maxByOrNull { it.value }

    return DigitPredictionModel(
        digit = highestProbability?.key?.toIntOrNull() ?: prediction.digit,
        probability = highestProbability?.value
            ?.let { "${(it * 100).roundToInt()}%" }
            ?: "0%",
        box = mapPredictionBoxToUiModel(prediction.box),
    )
}

private fun mapPredictionBoxToUiModel(box: PredictionBox): PredictionBoxModel =
    PredictionBoxModel(
        x = box.x,
        y = box.y,
        w = box.w,
        h = box.h,
    )
