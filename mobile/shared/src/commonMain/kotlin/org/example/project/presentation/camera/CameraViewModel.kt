package org.example.project.presentation.camera

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch
import org.example.project.common.presentation.ui.UiText
import org.example.project.common.presentation.ui.UiText.Plain
import org.example.project.core.mvi.setEffect
import org.example.project.core.mvi.setState
import org.example.project.domain.model.ApiException
import org.example.project.domain.usecase.UploadPhotoUseCase
import org.example.project.presentation.camera.models.CameraScreenErrorState.PhotoUnavailable
import org.example.project.presentation.camera.models.CameraScreenState
import org.example.project.presentation.mappers.mapPredictionToUiModel
import org.example.project.presentation.mappers.mapUploadErrorToUiModel
import scriptlens.shared.generated.resources.Res
import scriptlens.shared.generated.resources.error_photo_no_data

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

            is CameraEvent.OnPhotoPicked -> onPhotoPicked(event.photoBytes)

            is CameraEvent.OnPhotoCaptureCancelled -> setLoading(false)

            is CameraEvent.OnPhotoCaptureFailed -> onPhotoCaptureFailed(event.message)

            is CameraEvent.RetryUploadRequested -> retryUpload()

            is CameraEvent.OnImagePickerProcessingStarted -> setLoading(true)
        }
    }

    private fun onPhotoCaptureFailed(message: String) {
        _state.setState {
            it.copy(
                isLoading = false,
                cameraScreenState =
                    CameraScreenState.Error(PhotoUnavailable(Plain(message)))
            )

        }
    }

    private fun retryUpload() {
        setLoading(true)
        val photo = _state.value.photo
        if (photo == null) {
            _state.setState {
                it.copy(
                    isLoading = false,
                    cameraScreenState =
                        CameraScreenState.Error(PhotoUnavailable(UiText.Resource(Res.string.error_photo_no_data)))
                )
            }
        } else {
            println("$TAG: retrying upload")
            upload(photo)
        }

    }

    private fun onPhotoPicked(photoBytes: ByteArray?) {
        setLoading(true)
        photoBytes?.takeIf { it.isNotEmpty() }?.let { bytes ->
            _state.setState {
                it.copy(
                    cameraScreenState = CameraScreenState.PhotoCaptured,
                    photo = bytes,
                    prediction = null,
                    isLoading = true
                )
            }
            upload(bytes)
        } ?: _state.setState {
            it.copy(
                isLoading = false,
                cameraScreenState = CameraScreenState.Error(
                    PhotoUnavailable(UiText.Resource(Res.string.error_photo_no_data))
                )
            )
        }
    }

    private fun upload(photo: ByteArray) {
        setLoading(true)
        viewModelScope.launch {
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

    private fun setLoading(isLoading: Boolean) {
        _state.setState { it.copy(isLoading = isLoading) }
    }

    private companion object {
        const val TAG = "CameraViewModel"
    }
}
