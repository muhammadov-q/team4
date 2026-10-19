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
import org.example.project.domain.model.ApiException
import org.example.project.domain.model.DigitPrediction
import org.example.project.domain.model.Prediction
import org.example.project.domain.model.PredictionBox
import org.example.project.domain.repository.PhotoRepository
import org.example.project.domain.usecase.UploadPhotoUseCase
import org.example.project.presentation.camera.models.CameraScreenErrorState
import org.example.project.presentation.camera.models.CameraScreenState
import kotlin.test.Test
import kotlin.test.assertContentEquals
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
        val state = viewModel.state.value

        val screenState = state.cameraScreenState
        assertIs<CameraScreenState.Error>(screenState)
        assertIs<CameraScreenErrorState.PhotoUnavailable>(screenState.error)
        assertFalse(state.isLoading)
        assertNull(state.photo)
    }

    @Test
    fun pickedEmptyPhotoDataShowsUnavailableError() = runCameraTest {
        val viewModel = createViewModel()

        viewModel.onEvent(CameraEvent.OnPhotoPicked(byteArrayOf()))

        val screenState = viewModel.state.value.cameraScreenState
        assertIs<CameraScreenState.Error>(screenState)
        assertIs<CameraScreenErrorState.PhotoUnavailable>(screenState.error)
        assertFalse(viewModel.state.value.isLoading)
    }

    @Test
    fun successfulUploadDisplaysPredictionAndClearsLoading() = runCameraTest {
        val photo = byteArrayOf(1, 2, 3)
        var uploads = 0
        var uploadedPhoto: ByteArray? = null
        val prediction = samplePrediction()
        val viewModel = createViewModel {
            uploads++
            uploadedPhoto = it
            prediction
        }

        viewModel.onEvent(CameraEvent.OnPhotoPicked(photo))
        advanceUntilIdle()

        val state = viewModel.state.value
        assertEquals(1, uploads)
        assertContentEquals(photo, uploadedPhoto)
        assertContentEquals(photo, state.photo)
        assertIs<CameraScreenState.PhotoCaptured>(state.cameraScreenState)
        assertFalse(state.isLoading)
        assertEquals("v1", state.prediction?.modelVersion)
        assertEquals(1, state.prediction?.predictions?.size)
    }

    @Test
    fun failedUploadDisplaysMappedErrorAndClearsLoading() = runCameraTest {
        val viewModel = createViewModel {
            throw ApiException(503)
        }

        viewModel.onEvent(CameraEvent.OnPhotoPicked(byteArrayOf(9, 9, 9)))
        advanceUntilIdle()

        val state = viewModel.state.value
        val screenState = state.cameraScreenState
        assertIs<CameraScreenState.Error>(screenState)
        assertIs<CameraScreenErrorState.ServiceOffline>(screenState.error)
        assertFalse(state.isLoading)
    }

    @Test
    fun retryAfterFailedUploadReusesPhotoAndCanSucceed() = runCameraTest {
        val photo = byteArrayOf(7, 7, 7)
        var attempts = 0
        val uploadedPhotos = mutableListOf<ByteArray>()
        val viewModel = createViewModel {
            attempts++
            uploadedPhotos += it
            if (attempts == 1) throw ApiException(503)
            samplePrediction()
        }

        viewModel.onEvent(CameraEvent.OnPhotoPicked(photo))
        advanceUntilIdle()
        assertIs<CameraScreenState.Error>(viewModel.state.value.cameraScreenState)

        viewModel.onEvent(CameraEvent.RetryUploadRequested)
        advanceUntilIdle()

        val finalState = viewModel.state.value
        assertEquals(2, attempts)
        assertContentEquals(photo, uploadedPhotos[0])
        assertContentEquals(photo, uploadedPhotos[1])
        assertContentEquals(photo, finalState.photo)
        assertIs<CameraScreenState.PhotoCaptured>(finalState.cameraScreenState)
        assertFalse(finalState.isLoading)
        assertEquals("v1", finalState.prediction?.modelVersion)
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

    private fun samplePrediction() = Prediction(
        predictions = listOf(
            DigitPrediction(
                digit = 3,
                probabilities = mapOf("3" to 0.92),
                box = PredictionBox(x = 80.0, y = 60.0, w = 120.0, h = 180.0)
            )
        ),
        modelVersion = "v1"
    )

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
