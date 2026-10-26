package org.example.project.feature.camera.presentation.models

sealed class CameraScreenState {
    object NoPhotoCaptured : CameraScreenState()
    object PhotoCaptured : CameraScreenState()
    data class Error(val error: CameraScreenErrorState) : CameraScreenState()
}

