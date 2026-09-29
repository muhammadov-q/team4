package org.example.project

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import org.example.project.presentation.camera.CameraScreen

@Composable
fun App() {
    MaterialTheme {
        val cameraViewModel = viewModel {
            AppContainer.createCameraViewModel()
        }
        CameraScreen(viewModel = cameraViewModel)
    }
}
