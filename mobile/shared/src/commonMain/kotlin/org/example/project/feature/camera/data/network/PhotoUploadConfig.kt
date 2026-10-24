package org.example.project.feature.camera.data.network

data class PhotoUploadConfig(
    val baseUrl: String,
    val uploadPath: String,
    val multipartFieldName: String,
)

