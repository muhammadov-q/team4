package org.example.project.presentation.camera

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import kotlinx.coroutines.flow.first
import org.example.project.common.presentation.ui.UiText
import org.example.project.domain.model.ApiException
import org.example.project.domain.model.DigitPrediction
import org.example.project.domain.model.Prediction
import org.example.project.domain.model.PredictionBox
import org.example.project.domain.repository.PhotoRepository
import org.example.project.domain.usecase.UploadPhotoUseCase
import org.example.project.presentation.camera.models.DigitPredictionModel
import org.example.project.presentation.camera.models.CameraScreenErrorState
import org.example.project.presentation.camera.models.CameraScreenState
import org.example.project.presentation.camera.models.PredictionBoxModel
import org.example.project.presentation.camera.models.PredictionModel
import kotlin.test.Test
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertIs
import kotlin.test.assertNull

@OptIn(ExperimentalCoroutinesApi::class)
class CameraViewModelTest {
    @Test
    fun captureRequestClearsPriorResultAndEmitsCaptureEffect() = runCameraTest {
        val viewModel = CameraViewModel(UploadPhotoUseCase(FakePhotoRepository { error("Unexpected upload") }))

        viewModel.onEvent(CameraEvent.CapturePhotoRequested)

        assertNull(viewModel.state.value.prediction)
        assertEquals(CameraScreenState.NoPhotoCaptured, viewModel.state.value.cameraScreenState)
        assertEquals(CameraEffect.CapturePhoto, viewModel.effects.first())
    }

    @Test
    fun selectPhotoRequestEmitsSelectEffect() = runCameraTest {
        val viewModel = CameraViewModel(UploadPhotoUseCase(FakePhotoRepository { error("Unexpected upload") }))

        viewModel.onEvent(CameraEvent.SelectPhotoRequested)

        assertEquals(CameraEffect.SelectPhoto, viewModel.effects.first())
    }

    @Test
    fun photoCaptureFailureUpdatesErrorState() = runCameraTest {
        val viewModel = CameraViewModel(UploadPhotoUseCase(FakePhotoRepository { error("Unexpected upload") }))

        viewModel.onEvent(CameraEvent.OnPhotoCaptureFailed("Camera unavailable"))

        val screenState = viewModel.state.value.cameraScreenState
        assertIs<CameraScreenState.Error>(screenState)
        assertIs<CameraScreenErrorState.PhotoUnavailable>(screenState.error)
        assertEquals(UiText.Plain("Camera unavailable"), screenState.error.message)
    }

    @Test
    fun capturedPhotoUploadsAndSetsPrediction() = runCameraTest {
        val photo = byteArrayOf(1, 2, 3)
        val expected = Prediction(
            predictions = listOf(
                DigitPrediction(
                    digit = 7,
                    probabilities = mapOf("7" to 0.87),
                    box = PredictionBox(x = 1.0, y = 2.0, w = 3.0, h = 4.0),
                ),
            ),
            modelVersion = "test",
        )
        var uploadedPhoto: ByteArray? = null
        val viewModel = CameraViewModel(
            UploadPhotoUseCase(
                FakePhotoRepository { captured ->
                    uploadedPhoto = captured
                    expected
                },
            ),
        )

        viewModel.onEvent(CameraEvent.OnPhotoCaptured(photo))
        advanceUntilIdle()

        assertContentEquals(photo, uploadedPhoto)
        assertEquals(
            PredictionModel(
                predictions = listOf(
                    DigitPredictionModel(
                        digit = 7,
                        probability = "87%",
                        box = PredictionBoxModel(x = 1.0, y = 2.0, w = 3.0, h = 4.0),
                    ),
                ),
                modelVersion = "test",
            ),
            viewModel.state.value.prediction,
        )
        assertEquals(CameraScreenState.PhotoCaptured, viewModel.state.value.cameraScreenState)
        assertFalse(viewModel.state.value.isLoading)
    }

    @Test
    fun uploadFailureSetsErrorAndClearsUploadingState() = runCameraTest {
        val viewModel = CameraViewModel(
            UploadPhotoUseCase(FakePhotoRepository { error("Backend unavailable") }),
        )

        viewModel.onEvent(CameraEvent.OnPhotoCaptured(byteArrayOf(1)))
        advanceUntilIdle()

        assertEquals(
            CameraScreenState.Error(CameraScreenErrorState.RecognitionFailed).error,
            (viewModel.state.value.cameraScreenState as CameraScreenState.Error).error,
        )
        assertFalse(viewModel.state.value.isLoading)
        assertNull(viewModel.state.value.prediction)
    }

    @Test
    fun apiErrorsMapToMatchingErrorState() = runCameraTest {
        val expected = mapOf(
            0 to CameraScreenErrorState.ServiceOffline,
            400 to CameraScreenErrorState.ImageRejected,
            413 to CameraScreenErrorState.ImageTooLarge,
            415 to CameraScreenErrorState.ImageRejected,
            422 to CameraScreenErrorState.ImageRejected,
            500 to CameraScreenErrorState.RecognitionFailed,
        )

        expected.forEach { (status, errorState) ->
            val viewModel = CameraViewModel(
                UploadPhotoUseCase(FakePhotoRepository { throw ApiException(status) }),
            )

            viewModel.onEvent(CameraEvent.OnPhotoCaptured(byteArrayOf(1)))
            advanceUntilIdle()

            val screenState = viewModel.state.value.cameraScreenState
            assertIs<CameraScreenState.Error>(screenState)
            assertEquals(errorState, screenState.error, "status $status")
            assertFalse(viewModel.state.value.isLoading)
        }
    }

    @Test
    fun retryWithoutPhotoShowsPhotoUnavailableAndDoesNotUpload() = runCameraTest {
        var uploads = 0
        val viewModel = CameraViewModel(
            UploadPhotoUseCase(FakePhotoRepository { uploads++; error("Unexpected upload") }),
        )

        viewModel.onEvent(CameraEvent.RetryUploadRequested)
        advanceUntilIdle()

        val screenState = viewModel.state.value.cameraScreenState
        assertIs<CameraScreenState.Error>(screenState)
        assertIs<CameraScreenErrorState.PhotoUnavailable>(screenState.error)
        assertIs<UiText.Resource>(screenState.error.message)
        assertEquals(0, uploads)
        assertFalse(viewModel.state.value.isLoading)
    }

    @Test
    fun retryUploadsTheLastPhotoAgain() = runCameraTest {
        var attempts = 0
        val viewModel = CameraViewModel(
            UploadPhotoUseCase(
                FakePhotoRepository {
                    if (attempts++ == 0) throw ApiException(503)
                    Prediction(predictions = emptyList(), modelVersion = "test")
                },
            ),
        )

        viewModel.onEvent(CameraEvent.OnPhotoCaptured(byteArrayOf(1)))
        advanceUntilIdle()
        viewModel.onEvent(CameraEvent.RetryUploadRequested)
        advanceUntilIdle()

        assertEquals(2, attempts)
        assertEquals(CameraScreenState.PhotoCaptured, viewModel.state.value.cameraScreenState)
        assertEquals("test", viewModel.state.value.prediction?.modelVersion)
    }

    private fun runCameraTest(block: suspend TestScope.() -> Unit) = runTest {
        Dispatchers.setMain(StandardTestDispatcher(testScheduler))
        try {
            block()
        } finally {
            Dispatchers.resetMain()
        }
    }

    private class FakePhotoRepository(
        private val upload: suspend (ByteArray) -> Prediction,
    ) : PhotoRepository {
        override suspend fun uploadPhoto(photo: ByteArray): Prediction = upload(photo)
    }
}
