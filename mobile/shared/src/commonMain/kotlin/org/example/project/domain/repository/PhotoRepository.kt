package org.example.project.domain.repository

import org.example.project.domain.model.Prediction

interface PhotoRepository {
    suspend fun uploadPhoto(photo: ByteArray): Prediction
}
