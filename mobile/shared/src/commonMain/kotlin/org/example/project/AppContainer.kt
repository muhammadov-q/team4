package org.example.project

import org.example.project.data.platform.createPlatformHttpClient
import org.example.project.data.platform.localBackendBaseUrl
import org.example.project.data.network.PhotoUploadApi
import org.example.project.data.network.PhotoUploadConfig
import org.example.project.data.repository.PhotoRepositoryImpl
import org.example.project.domain.usecase.UploadPhotoUseCase
import org.example.project.presentation.camera.CameraViewModel

object AppContainer {
    private val httpClient by lazy { createPlatformHttpClient() }
    private val photoUploadConfig = PhotoUploadConfig(
        baseUrl = localBackendBaseUrl(),
        uploadPath = "/predict",
        multipartFieldName = "image",
    )
    private val photoRepository by lazy {
        PhotoRepositoryImpl(
            api = PhotoUploadApi(httpClient, photoUploadConfig),
        )
    }

    fun createCameraViewModel(): CameraViewModel =
        CameraViewModel(UploadPhotoUseCase(photoRepository))
}
