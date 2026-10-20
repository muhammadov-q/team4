package org.example.project.data.platform

import io.ktor.client.HttpClient
import io.ktor.client.engine.darwin.Darwin

actual fun createPlatformHttpClient(): HttpClient =
    HttpClient(Darwin) {
        expectSuccess = false
    }

actual fun localBackendBaseUrl(): String = "http://127.0.0.1:8000"