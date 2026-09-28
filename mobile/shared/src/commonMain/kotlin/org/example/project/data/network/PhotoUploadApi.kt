package org.example.project.data.network

import io.ktor.client.HttpClient
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.Headers
import io.ktor.http.HttpHeaders
import io.ktor.client.request.forms.MultiPartFormDataContent
import io.ktor.client.request.forms.formData
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

class PhotoUploadApi(
    private val client: HttpClient,
    private val config: PhotoUploadConfig,
) {
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun upload(photo: ByteArray): PredictionResponse {
        println("Uploading photo of size ${photo.size} bytes")
        val endpoint =
            "${config.baseUrl.trimEnd('/')}/${config.uploadPath.trimStart('/')}"
        println("POST $endpoint")
        val response = client.post(endpoint) {
            setBody(
                MultiPartFormDataContent(
                    formData {
                        append(
                            key = config.multipartFieldName,
                            value = photo,
                            headers = Headers.build {
                                append(HttpHeaders.ContentType, ContentType.Image.JPEG.toString())
                                append(HttpHeaders.ContentDisposition, "filename=\"photo.jpg\"")
                            },
                        )
                    },
                ),
            )
        }
        val responseText = response.bodyAsText()

        println("Response ${response.status.value}: $responseText")
        if (response.status.value !in 200..299) {
            error("Prediction request failed (${response.status.value}): $responseText")
        }
        return json.decodeFromString(responseText)
    }
}

@Serializable
data class PredictionResponse(
    val prediction: Double,
    @SerialName("model_version")
    val modelVersion: String,
)
