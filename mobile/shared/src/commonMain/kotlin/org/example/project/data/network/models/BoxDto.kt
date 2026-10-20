package org.example.project.data.network.models

import kotlinx.serialization.Serializable

@Serializable
data class BoxDto(
    val x: Double,
    val y: Double,
    val w: Double,
    val h: Double,
)
