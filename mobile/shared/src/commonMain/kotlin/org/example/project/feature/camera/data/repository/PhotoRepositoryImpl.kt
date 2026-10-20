package org.example.project.feature.camera.data.repository

import org.example.project.feature.camera.data.network.PhotoUploadApi
import org.example.project.feature.camera.domain.repository.PhotoRepository
import org.example.project.feature.camera.domain.model.DigitPrediction
import org.example.project.feature.camera.domain.model.PredictionBox
import org.example.project.feature.camera.domain.model.Prediction

class PhotoRepositoryImpl(
    private val api: PhotoUploadApi,
) : PhotoRepository {
    override suspend fun uploadPhoto(photo: ByteArray): Prediction {
        val response = api.upload(photo)
        return Prediction(
            predictions = response.predictions.map { prediction ->
                DigitPrediction(
                    digit = prediction.digit,
                    probabilities = prediction.probabilities,
                    box = PredictionBox(
                        x = prediction.box.x,
                        y = prediction.box.y,
                        w = prediction.box.w,
                        h = prediction.box.h,
                    ),
                )
            },
            modelVersion = response.modelVersion,
        )
    }
}

