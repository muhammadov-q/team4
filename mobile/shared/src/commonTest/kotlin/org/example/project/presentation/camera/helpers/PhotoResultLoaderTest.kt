package org.example.project.presentation.camera.helpers

import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertNull

class PhotoResultLoaderTest {
    @Test
    fun nullPhotoResultReturnsNull() = runTest {
        val result = loadPhotoBytes(photo = null)

        assertNull(result)
    }
}

