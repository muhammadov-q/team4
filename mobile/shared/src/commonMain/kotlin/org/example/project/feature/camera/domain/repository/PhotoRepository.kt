package org.example.project.feature.camera.domain.repository

import org.example.project.feature.camera.domain.model.Prediction

interface PhotoRepository {
    suspend fun uploadPhoto(photo: ByteArray): Prediction
}

