package org.example.project.di

import org.example.project.data.network.PhotoUploadApi
import org.example.project.data.network.PhotoUploadConfig
import org.example.project.data.platform.createPlatformHttpClient
import org.example.project.data.platform.localBackendBaseUrl
import org.example.project.data.repository.PhotoRepositoryImpl
import org.example.project.domain.repository.PhotoRepository
import org.example.project.domain.usecase.UploadPhotoUseCase
import org.example.project.presentation.camera.CameraViewModel
import org.koin.core.module.dsl.viewModelOf
import org.koin.dsl.module

val appModule = module {
    single { createPlatformHttpClient() }
    single {
        PhotoUploadConfig(
            baseUrl = localBackendBaseUrl(),
            uploadPath = "/predict",
            multipartFieldName = "image",
        )
    }
    single { PhotoUploadApi(get(), get()) }
    single<PhotoRepository> { PhotoRepositoryImpl(api = get()) }
    factory { UploadPhotoUseCase(get()) }
    viewModelOf(::CameraViewModel)
}
