package org.example.project.core.network.platform

import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO

actual fun createHttpClient(): HttpClient =
    HttpClient(CIO) {
        expectSuccess = false
    }

actual fun localBackendBaseUrl(): String = "http://127.0.0.1:8000"

