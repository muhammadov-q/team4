package org.example.project

import org.example.project.presentation.camera.CameraContract
import org.example.project.presentation.camera.models.CameraScreenState
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull

class SharedCommonTest {
    @Test
    fun cameraContractStartsWithoutPhotoOrPrediction() {
        val contract = CameraContract()

        assertEquals(CameraScreenState.NoPhotoCaptured, contract.cameraScreenState)
        assertNull(contract.photo)
        assertNull(contract.prediction)
        assertFalse(contract.isLoading)
    }
}