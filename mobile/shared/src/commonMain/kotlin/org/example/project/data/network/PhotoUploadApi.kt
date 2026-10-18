package org.example.project.data.network

import io.ktor.client.HttpClient
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.Headers
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import kotlinx.coroutines.CancellationException
import org.example.project.domain.model.ApiException
import io.ktor.client.request.forms.MultiPartFormDataContent
import io.ktor.client.request.forms.formData
import kotlinx.serialization.json.Json
import org.example.project.data.network.models.PredictionDto

class PhotoUploadApi(
    private val client: HttpClient,
    private val config: PhotoUploadConfig,
) {
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun upload(photo: ByteArray): PredictionDto {
        val endpoint = "${config.baseUrl.trimEnd('/')}/${config.uploadPath.trimStart('/')}"
        println("$TAG: POST $endpoint (${photo.size} bytes)")

        val response = try {
            client.post(endpoint) { setBody(photoBody(photo)) }
        } catch (cancellation: CancellationException) {
            throw cancellation
        } catch (exception: Exception) {
            println("$TAG: no response from $endpoint: $exception")
            throw ApiException(0)
        }

        val body = response.bodyAsText()
        println("$TAG: response ${response.status.value}: $body")
        if (response.status != HttpStatusCode.OK) {
            throw ApiException(response.status.value)
        }
        return json.decodeFromString(body)
    }

    private fun photoBody(photo: ByteArray) = MultiPartFormDataContent(
        formData {
            append(
                key = config.multipartFieldName,
                value = photo,
                headers = Headers.build {
                    append(HttpHeaders.ContentType, ContentType.Image.JPEG.toString())
                    append(HttpHeaders.ContentDisposition, "filename=\"photo.jpg\"")
                }
            )
        }
    )

    private companion object {
        const val TAG = "PhotoUploadApi"
    }
}

