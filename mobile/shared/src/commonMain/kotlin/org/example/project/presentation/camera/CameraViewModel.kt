package org.example.project.presentation.camera

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch
import org.example.project.core.mvi.setEffect
import org.example.project.core.mvi.setState
import org.example.project.domain.model.ApiException
import org.example.project.domain.usecase.UploadPhotoUseCase
import org.example.project.presentation.camera.models.CameraScreenErrorState
import org.example.project.presentation.camera.models.CameraScreenState
import org.example.project.presentation.mappers.mapPredictionToUiModel
import org.example.project.presentation.mappers.mapUploadErrorToUiModel
import org.example.project.common.presentation.ui.UiText

class CameraViewModel(
    private val uploadPhoto: UploadPhotoUseCase,
) : ViewModel() {
    private val _state = MutableStateFlow(CameraContract())
    val state = _state.asStateFlow()
    private val effectChannel = Channel<CameraEffect>(Channel.BUFFERED)
    val effects = effectChannel.receiveAsFlow()
    private var uploadJob: Job? = null

    fun onEvent(event: CameraEvent) {
        when (event) {
            is CameraEvent.CapturePhotoRequested -> effectChannel.setEffect(CameraEffect.CapturePhoto)

            is CameraEvent.SelectPhotoRequested -> effectChannel.setEffect(CameraEffect.SelectPhoto)

            is CameraEvent.OnPhotoCaptured -> {
                println("$TAG: photo captured, ${event.photo.size} bytes")
                _state.setState {
                    it.copy(
                        cameraScreenState = CameraScreenState.PhotoCaptured,
                        photo = event.photo,
                        prediction = null
                    )
                }
                upload(event.photo)
            }

            is CameraEvent.OnPhotoCaptureCancelled -> println("$TAG: photo capture cancelled")

            is CameraEvent.OnPhotoCaptureFailed -> {
                println("$TAG: photo capture failed: ${event.message}")
                uploadJob?.cancel()
                _state.setState {
                    it.copy(
                        isLoading = false,
                        cameraScreenState = CameraScreenState.Error(
                            CameraScreenErrorState.PhotoUnavailable(UiText.Plain(event.message))
                        )
                    )
                }
            }

            is CameraEvent.RetryUploadRequested -> {
                val photo = _state.value.photo
                if (photo == null) {
                    _state.setState { it.copy(cameraScreenState = CameraScreenState.NoPhotoCaptured) }
                } else {
                    println("$TAG: retrying upload")
                    upload(photo)
                }
            }
        }
    }

    private fun upload(photo: ByteArray) {
        uploadJob?.cancel()
        _state.setState { it.copy(isLoading = true) }

        uploadJob = viewModelScope.launch {

            try {
                val prediction = uploadPhoto(photo)
                _state.setState {
                    it.copy(
                        prediction = mapPredictionToUiModel(prediction),
                        isLoading = false,
                        cameraScreenState = CameraScreenState.PhotoCaptured,
                    )
                }
                println("$TAG: prediction received: $prediction")
            } catch (cancellation: CancellationException) {
                throw cancellation
            } catch (exception: Exception) {
                _state.setState {
                    it.copy(
                        isLoading = false,
                        cameraScreenState = CameraScreenState.Error(
                            mapUploadErrorToUiModel(exception)
                        )
                    )
                }
                val status = (exception as? ApiException)?.status
                println("$TAG: upload failed (status=$status): ${exception.message}")
            }
        }
    }

    private companion object {
        const val TAG = "CameraViewModel"
    }
}
