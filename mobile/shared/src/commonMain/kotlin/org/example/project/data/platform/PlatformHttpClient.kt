package org.example.project.data.platform

import io.ktor.client.HttpClient

expect fun createPlatformHttpClient(): HttpClient

expect fun localBackendBaseUrl(): String
