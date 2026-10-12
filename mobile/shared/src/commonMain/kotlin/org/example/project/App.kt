package org.example.project

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import org.example.project.navigation.Screen
import org.example.project.presentation.camera.CameraScreen
import org.example.project.presentation.camera.CameraViewModel
import org.example.project.presentation.documents.DocumentsScreen
import org.example.project.presentation.source.SourceScreen

@Composable
fun App() {
    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route
    val destinations = listOf(Screen.CameraView, Screen.Docs, Screen.Source)

    Scaffold(
       containerColor = Color(0xFFF4F4F4),
        bottomBar = {
            NavigationBottomBar(
                onClick = { selectedScreen ->
                    navController.navigate(selectedScreen.route) {
                        popUpTo(Screen.CameraView.route) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                currentRoute = currentRoute,
                destinations = destinations,
            )
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = Screen.CameraView.route,
            modifier = Modifier.padding(paddingValues),
        ) {
            composable(Screen.CameraView.route) {
                val cameraViewModel: CameraViewModel = viewModel {
                    AppContainer.createCameraViewModel()
                }
                CameraScreen(cameraViewModel)
            }
            composable(Screen.Docs.route) {
                DocumentsScreen()
            }
            composable(Screen.Source.route) {
                SourceScreen()
            }
        }
    }
}