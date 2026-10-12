package org.example.project.presentation.camera

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch
import org.example.project.core.mvi.setEffect
import org.example.project.core.mvi.setState
import org.example.project.domain.usecase.UploadPhotoUseCase
import org.example.project.presentation.camera.models.CameraScreenState
import org.example.project.presentation.mappers.mapPredictionToUiModel

class CameraViewModel(
    private val uploadPhoto: UploadPhotoUseCase,
) : ViewModel() {
    private val _state = MutableStateFlow(CameraContract())
    val state = _state.asStateFlow()
    private val effectChannel = Channel<CameraEffect>(Channel.BUFFERED)
    val effects = effectChannel.receiveAsFlow()

    fun onEvent(event: CameraEvent) {
        when (event) {
            is CameraEvent.CapturePhotoRequested -> effectChannel.setEffect(CameraEffect.CapturePhoto)

            is CameraEvent.SelectPhotoRequested -> effectChannel.setEffect(CameraEffect.SelectPhoto)

            is CameraEvent.OnPhotoCaptured -> {
                _state.setState {
                    it.copy(
                        cameraScreenState = CameraScreenState.PhotoCaptured,
                        photo = event.photo,
                        prediction = null,
                        error = null,
                    )
                }
                upload(event.photo)
            }

            is CameraEvent.OnPhotoCaptureFailed -> {
                _state.setState {
                    it.copy(error = event.message)
                }
            }
        }
    }

    private fun upload(photo: ByteArray) {
        viewModelScope.launch {
            _state.setState { it.copy(error = null) }
            try {
                val prediction = uploadPhoto(photo)
                _state.setState {
                    it.copy(
                        prediction = mapPredictionToUiModel(prediction),
                    )
                }
                println("Prediction: $prediction")
            } catch (cancellation: CancellationException) {
                throw cancellation
            } catch (exception: Exception) {
                _state.setState {
                    it.copy(
                        error = exception.message ?: "Photo upload failed.",
                    )
                }
                println("Error: ${exception.message}")
            }
        }
    }
}
