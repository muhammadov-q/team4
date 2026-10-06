package org.example.project.presentation.camera

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.example.project.domain.model.Prediction
import org.example.project.domain.repository.PhotoRepository
import org.example.project.domain.usecase.UploadPhotoUseCase
import kotlin.test.Test
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue
import kotlinx.coroutines.flow.first

@OptIn(ExperimentalCoroutinesApi::class)
class CameraViewModelTest {
    @Test
    fun captureRequestClearsPriorResultAndEmitsCaptureEffect() = runCameraTest {
        val viewModel = CameraViewModel(UploadPhotoUseCase(FakePhotoRepository { error("Unexpected upload") }))

        viewModel.onEvent(CameraEvent.CapturePhotoRequested)

        assertNull(viewModel.state.value.prediction)
        assertNull(viewModel.state.value.error)
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

        assertEquals("Camera unavailable", viewModel.state.value.error)
        assertFalse(viewModel.state.value.isUploading)
    }

    @Test
    fun capturedPhotoUploadsAndSetsPrediction() = runCameraTest {
        val photo = byteArrayOf(1, 2, 3)
        val expected = Prediction(value = 0.87, modelVersion = "test")
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
        assertEquals(expected, viewModel.state.value.prediction)
        assertFalse(viewModel.state.value.isUploading)
        assertNull(viewModel.state.value.error)
    }

    @Test
    fun uploadFailureSetsErrorAndClearsUploadingState() = runCameraTest {
        val viewModel = CameraViewModel(
            UploadPhotoUseCase(FakePhotoRepository { error("Backend unavailable") }),
        )

        viewModel.onEvent(CameraEvent.OnPhotoCaptured(byteArrayOf(1)))
        advanceUntilIdle()

        assertEquals("Backend unavailable", viewModel.state.value.error)
        assertNull(viewModel.state.value.prediction)
        assertFalse(viewModel.state.value.isUploading)
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
