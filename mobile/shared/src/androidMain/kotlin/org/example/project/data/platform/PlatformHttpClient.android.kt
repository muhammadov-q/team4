package org.example.project.data.platform

import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO

actual fun createPlatformHttpClient(): HttpClient =
    HttpClient(CIO) {
        expectSuccess = true
    }

actual fun localBackendBaseUrl(): String = "http://10.0.2.2:8000"
