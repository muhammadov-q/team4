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

class CameraViewModel(
    private val uploadPhoto: UploadPhotoUseCase,
) : ViewModel() {
    private val _state = MutableStateFlow(CameraContract())
    val state = _state.asStateFlow()
    private val effectChannel = Channel<CameraEffect>(Channel.BUFFERED)
    val effects = effectChannel.receiveAsFlow()

    fun onEvent(event: CameraEvent) {
        when (event) {
            CameraEvent.CapturePhotoRequested -> {
                if (_state.value.isUploading) return
                _state.setState {
                    it.copy(
                        prediction = null,
                        error = null,
                    )
                }
                effectChannel.setEffect(CameraEffect.CapturePhoto)
            }
            is CameraEvent.OnPhotoCaptured -> {
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
        if (_state.value.isUploading) return
        viewModelScope.launch {
            _state.setState { it.copy(isUploading = true, error = null) }
            try {
                val prediction = uploadPhoto(photo)
                _state.setState {
                    it.copy(isUploading = false, prediction = prediction)
                }
                println("Prediction: $prediction")
            } catch (cancellation: CancellationException) {
                throw cancellation
            } catch (exception: Exception) {
                _state.setState {
                    it.copy(
                        isUploading = false,
                        error = exception.message ?: "Photo upload failed.",
                    )
                }
            }
        }
    }
}
