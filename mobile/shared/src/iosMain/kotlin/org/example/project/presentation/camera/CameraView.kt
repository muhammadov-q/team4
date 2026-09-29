package org.example.project.presentation.camera

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.UIKitView
import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.readBytes
import platform.CoreGraphics.CGRectMake
import platform.Foundation.NSError
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
    captureRequestId: Int,
    onPhotoCaptured: (ByteArray) -> Unit,
    onCaptureError: (String) -> Unit,
) {
    UIKitView(
        factory = { CameraPickerView(onPhotoCaptured, onCaptureError) },
        modifier = modifier,
        update = { view ->
            view.onPhotoCaptured = onPhotoCaptured
            view.onCaptureError = onCaptureError
            if (captureRequestId > view.lastCaptureRequestId) {
                view.lastCaptureRequestId = captureRequestId
                view.openCamera()
            }
        },
    )
}

@OptIn(ExperimentalForeignApi::class)
private class CameraPickerView(
    var onPhotoCaptured: (ByteArray) -> Unit,
    var onCaptureError: (String) -> Unit,
) : UIView(frame = CGRectMake(0.0, 0.0, 0.0, 0.0)),
    UIImagePickerControllerDelegateProtocol,
    UINavigationControllerDelegateProtocol {

    var lastCaptureRequestId = 0
    private var picker: UIImagePickerController? = null

    init {
        backgroundColor = UIColor.blackColor
    }

    fun openCamera() {
        val cameraSource = UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypeCamera
        if (!UIImagePickerController.isSourceTypeAvailable(cameraSource)) {
            onCaptureError("No camera is available on this device.")
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
        cameraPicker.sourceType = cameraSource
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
            onCaptureError("The captured photo contained no image data.")
        } else {
            onPhotoCaptured(photo)
        }
    }

    override fun imagePickerControllerDidCancel(picker: UIImagePickerController) {
        picker.dismissViewControllerAnimated(true, completion = null)
        this.picker = null
        onCaptureError("Photo capture was cancelled.")
    }
}
