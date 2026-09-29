package org.example.project.domain.usecase

import org.example.project.domain.repository.PhotoRepository
import org.example.project.domain.model.Prediction

class UploadPhotoUseCase(
    private val photoRepository: PhotoRepository,
) {
    suspend operator fun invoke(photo: ByteArray): Prediction =
        photoRepository.uploadPhoto(photo)
}
