package org.example.project

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import org.example.project.common.presentation.ui.theme.ScriptLensColors
import org.example.project.common.presentation.ui.theme.ScriptLensTheme
import org.example.project.core.navigation.NavigationBottomBar
import org.example.project.core.navigation.Screen
import org.example.project.di.appModule
import org.example.project.feature.camera.presentation.CameraScreen
import org.example.project.feature.camera.presentation.CameraViewModel
import org.example.project.feature.documents.presentation.DocumentsScreen
import org.example.project.feature.source.presentation.SourceScreen
import org.koin.compose.KoinApplication
import org.koin.compose.viewmodel.koinViewModel

@Composable
fun App() {
    KoinApplication(application = { modules(appModule) }) {
        ScriptLensTheme {
            AppContent()
        }
    }
}

@Composable
private fun AppContent() {
    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route
    val destinations = listOf(Screen.CameraView, Screen.Docs, Screen.Source)

    Scaffold(
        containerColor = ScriptLensColors.Background,
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
                val cameraViewModel: CameraViewModel = koinViewModel()
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