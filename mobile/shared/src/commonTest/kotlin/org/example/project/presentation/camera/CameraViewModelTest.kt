package org.example.project.presentation.camera

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.example.project.common.presentation.ui.UiText
import org.example.project.domain.model.Prediction
import org.example.project.domain.repository.PhotoRepository
import org.example.project.domain.usecase.UploadPhotoUseCase
import org.example.project.presentation.camera.models.CameraScreenErrorState
import org.example.project.presentation.camera.models.CameraScreenState
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertIs
import kotlin.test.assertNull
import kotlin.test.assertTrue

@OptIn(ExperimentalCoroutinesApi::class)
class CameraViewModelTest {
    @Test
    fun capturePhotoRequestedEmitsEffectWithoutChangingState() = runCameraTest {
        val viewModel = createViewModel()

        viewModel.onEvent(CameraEvent.CapturePhotoRequested)

        assertEquals(CameraEffect.CapturePhoto, viewModel.effects.first())
        assertEquals(CameraScreenState.NoPhotoCaptured, viewModel.state.value.cameraScreenState)
        assertNull(viewModel.state.value.prediction)
        assertFalse(viewModel.state.value.isLoading)
    }

    @Test
    fun selectPhotoRequestedEmitsEffect() = runCameraTest {
        val viewModel = createViewModel()

        viewModel.onEvent(CameraEvent.SelectPhotoRequested)

        assertEquals(CameraEffect.SelectPhoto, viewModel.effects.first())
    }

    @Test
    fun photoCaptureFailureUpdatesErrorState() = runCameraTest {
        val viewModel = createViewModel()

        viewModel.onEvent(CameraEvent.OnPhotoCaptureFailed("Camera unavailable"))

        val screenState = viewModel.state.value.cameraScreenState
        assertIs<CameraScreenState.Error>(screenState)
        assertIs<CameraScreenErrorState.PhotoUnavailable>(screenState.error)
        assertEquals(UiText.Plain("Camera unavailable"), screenState.error.message)
        assertFalse(viewModel.state.value.isLoading)
    }

    @Test
    fun cancellingCaptureClearsLoadingWithoutChangingScreenState() = runCameraTest {
        val viewModel = createViewModel()
        viewModel.onEvent(CameraEvent.OnImagePickerProcessingStarted)
        assertTrue(viewModel.state.value.isLoading)

        viewModel.onEvent(CameraEvent.OnPhotoCaptureCancelled)

        assertEquals(CameraScreenState.NoPhotoCaptured, viewModel.state.value.cameraScreenState)
        assertFalse(viewModel.state.value.isLoading)
    }

    @Test
    fun pickerProcessingStartedSetsLoading() = runCameraTest {
        val viewModel = createViewModel()

        viewModel.onEvent(CameraEvent.OnImagePickerProcessingStarted)

        assertTrue(viewModel.state.value.isLoading)
    }

    @Test
    fun pickedPhotoWithoutDataShowsUnavailableError() = runCameraTest {
        val viewModel = createViewModel()

        viewModel.onEvent(CameraEvent.OnPhotoPicked(null))
        val state = viewModel.state.first { it.cameraScreenState is CameraScreenState.Error }

        val screenState = state.cameraScreenState
        assertIs<CameraScreenState.Error>(screenState)
        assertIs<CameraScreenErrorState.PhotoUnavailable>(screenState.error)
        assertFalse(state.isLoading)
        assertNull(state.photo)
    }

    @Test
    fun retryWithoutPhotoShowsUnavailableErrorWithoutUploading() = runCameraTest {
        var uploads = 0
        val viewModel = createViewModel {
            uploads++
            error("Unexpected upload")
        }
        viewModel.onEvent(CameraEvent.OnPhotoCaptureFailed("Camera unavailable"))

        viewModel.onEvent(CameraEvent.RetryUploadRequested)
        advanceUntilIdle()

        val screenState = viewModel.state.value.cameraScreenState
        assertIs<CameraScreenState.Error>(screenState)
        assertIs<CameraScreenErrorState.PhotoUnavailable>(screenState.error)
        assertFalse(screenState.error.canRetry)
        assertEquals(0, uploads)
        assertFalse(viewModel.state.value.isLoading)
    }

    private fun runCameraTest(block: suspend TestScope.() -> Unit) = runTest {
        Dispatchers.setMain(StandardTestDispatcher(testScheduler))
        try {
            block()
        } finally {
            Dispatchers.resetMain()
        }
    }

    private fun createViewModel(
        upload: suspend (ByteArray) -> Prediction = { error("Unexpected upload") },
    ) = CameraViewModel(
        UploadPhotoUseCase(
            object : PhotoRepository {
                override suspend fun uploadPhoto(photo: ByteArray): Prediction = upload(photo)
            },
        ),
    )
}
