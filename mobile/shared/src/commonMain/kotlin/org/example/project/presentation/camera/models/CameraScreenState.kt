package org.example.project.presentation.camera.models

sealed class CameraScreenState {
    object NoPhotoCaptured : CameraScreenState()
    object PhotoCaptured : CameraScreenState()
    class Error(val error: CameraScreenErrorState) : CameraScreenState()
}
