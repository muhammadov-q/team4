package org.example.project.core.network.platform

import io.ktor.client.HttpClient

expect fun createHttpClient(): HttpClient

expect fun localBackendBaseUrl(): String

