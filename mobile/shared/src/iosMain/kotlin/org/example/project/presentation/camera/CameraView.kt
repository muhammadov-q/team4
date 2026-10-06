package org.example.project.presentation.camera

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.UIKitView
import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.readBytes
import kotlinx.coroutines.flow.Flow
import platform.CoreGraphics.CGRectMake
import platform.UIKit.UIImage
import platform.UIKit.UIImageJPEGRepresentation
import platform.UIKit.UIImagePickerController
import platform.UIKit.UIImagePickerControllerDelegateProtocol
import platform.UIKit.UIImagePickerControllerOriginalImage
import platform.UIKit.UIImagePickerControllerSourceType
import platform.UIKit.UINavigationControllerDelegateProtocol
import platform.UIKit.UIColor
import platform.UIKit.UIView
import platform.UIKit.UIViewController

@Composable
@OptIn(ExperimentalForeignApi::class)
actual fun CameraView(
    modifier: Modifier,
    cameraEffects: Flow<CameraEffect>,
    onPhotoCaptured: (ByteArray) -> Unit,
    onCaptureError: (String) -> Unit,
) {
    val pickerView = remember { mutableStateOf<CameraPickerView?>(null) }
    UIKitView(
        factory = {
            CameraPickerView(onPhotoCaptured, onCaptureError).also {
                pickerView.value = it
            }
        },
        modifier = modifier,
        update = { view ->
            view.onPhotoCaptured = onPhotoCaptured
            view.onCaptureError = onCaptureError
        },
    )
    LaunchedEffect(cameraEffects) {
        cameraEffects.collect { effect ->
            when (effect) {
                CameraEffect.CapturePhoto -> pickerView.value?.openPicker(
                    UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypeCamera,
                )
                CameraEffect.SelectPhoto -> pickerView.value?.openPicker(
                    UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypePhotoLibrary,
                )
            }
        }
    }
}

@OptIn(ExperimentalForeignApi::class)
private class CameraPickerView(
    var onPhotoCaptured: (ByteArray) -> Unit,
    var onCaptureError: (String) -> Unit,
) : UIView(frame = CGRectMake(0.0, 0.0, 0.0, 0.0)),
    UIImagePickerControllerDelegateProtocol,
    UINavigationControllerDelegateProtocol {

    private var picker: UIImagePickerController? = null

    init {
        backgroundColor = UIColor.blackColor
    }

    fun openPicker(source: UIImagePickerControllerSourceType) {
        if (!UIImagePickerController.isSourceTypeAvailable(source)) {
            onCaptureError(
                if (source == UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypeCamera) {
                    "No camera is available on this device."
                } else {
                    "Photo library is not available on this device."
                },
            )
            return
        }

        val rootController = window?.rootViewController
        if (rootController == null) {
            onCaptureError("Could not open the camera.")
            return
        }

        var presenter: UIViewController = rootController
        while (true) {
            val presented = presenter.presentedViewController ?: break
            presenter = presented
        }

        val cameraPicker = UIImagePickerController()
        cameraPicker.sourceType = source
        cameraPicker.allowsEditing = false
        cameraPicker.delegate = this
        picker = cameraPicker
        presenter.presentViewController(cameraPicker, animated = true, completion = null)
    }

    override fun imagePickerController(
        picker: UIImagePickerController,
        didFinishPickingMediaWithInfo: Map<Any?, *>,
    ) {
        val image = didFinishPickingMediaWithInfo[UIImagePickerControllerOriginalImage] as? UIImage
        val data = image?.let { UIImageJPEGRepresentation(it, 0.95) }
        val photo = data?.bytes?.readBytes(data.length.toInt())
        picker.dismissViewControllerAnimated(true, completion = null)
        this.picker = null

        if (photo == null || photo.isEmpty()) {
            onCaptureError("The photo contained no image data.")
        } else {
            onPhotoCaptured(photo)
        }
    }

    override fun imagePickerControllerDidCancel(picker: UIImagePickerController) {
        picker.dismissViewControllerAnimated(true, completion = null)
        this.picker = null
        onCaptureError("Photo operation was cancelled.")
    }
}
