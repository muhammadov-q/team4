package org.example.project.data.repository

import org.example.project.data.network.PhotoUploadApi
import org.example.project.domain.repository.PhotoRepository
import org.example.project.domain.model.Prediction

class PhotoRepositoryImpl(
    private val api: PhotoUploadApi,
) : PhotoRepository {
    override suspend fun uploadPhoto(photo: ByteArray): Prediction {
        val response = api.upload(photo)
        return Prediction(
            value = response.prediction,
            modelVersion = response.modelVersion,
        )
    }
}
