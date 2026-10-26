package org.example.project.feature.camera.presentation.helpers

import kotlin.test.Test
import kotlin.test.assertEquals

class PhotoImageSampleSizeTest {

    @Test
    fun `returns 1 when long side is already within limit`() {
        assertEquals(1, calculateSampleSize(width = 2048, height = 1536))
    }

    @Test
    fun `returns 2 when long side is just above limit`() {
        assertEquals(2, calculateSampleSize(width = 2049, height = 1200))
    }

    @Test
    fun `returns 2 for typical 12MP photo`() {
        assertEquals(2, calculateSampleSize(width = 4032, height = 3024))
    }

    @Test
    fun `keeps power-of-two sample size scaling`() {
        assertEquals(4, calculateSampleSize(width = 8192, height = 4096))
        assertEquals(8, calculateSampleSize(width = 10000, height = 5000))
    }
}


