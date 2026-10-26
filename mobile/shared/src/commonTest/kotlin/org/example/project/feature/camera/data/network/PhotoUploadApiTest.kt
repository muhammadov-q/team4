package org.example.project.feature.camera.data.network

import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.MockRequestHandleScope
import io.ktor.client.engine.mock.respond
import io.ktor.client.engine.mock.toByteArray
import io.ktor.client.request.HttpRequestData
import io.ktor.client.request.HttpResponseData
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.http.headersOf
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.SerializationException
import org.example.project.feature.camera.domain.model.ApiException
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class PhotoUploadApiTest {
    private val config = PhotoUploadConfig(
        baseUrl = "http://localhost:8000/",
        uploadPath = "/predict",
        multipartFieldName = "image",
    )
    private val jsonHeaders = headersOf(HttpHeaders.ContentType, "application/json")

    private fun api(handler: suspend MockRequestHandleScope.(HttpRequestData) -> HttpResponseData) =
        PhotoUploadApi(HttpClient(MockEngine(handler)), config)

    @Test
    fun successfulUploadParsesThePrediction() = runTest {
        val api = api {
            respond(
                """{"predictions":[{"digit":7,"probabilities":{"7":0.9},"box":{"x":1,"y":2,"w":3,"h":4}}],"model_version":"v1"}""",
                HttpStatusCode.OK,
                jsonHeaders,
            )
        }

        val result = api.upload(byteArrayOf(1, 2, 3))

        assertEquals("v1", result.modelVersion)
        assertEquals(7, result.predictions.single().digit)
    }

    @Test
    fun uploadPostsMultipartImageFieldToPredict() = runTest {
        var method: HttpMethod? = null
        var url: String? = null
        var body = ""
        val api = api { request ->
            method = request.method
            url = request.url.toString()
            body = request.body.toByteArray().decodeToString()
            respond("""{"predictions":[],"model_version":"v1"}""", HttpStatusCode.OK, jsonHeaders)
        }

        api.upload(byteArrayOf(1))

        assertEquals(HttpMethod.Post, method)
        assertEquals("http://localhost:8000/predict", url)
        assertTrue(body.contains("name=image"), body)
    }

    @Test
    fun nonOkStatusesThrowApiExceptionWithThatStatus() = runTest {
        listOf(400, 413, 415, 422, 500, 502).forEach { status ->
            val api = api { respond("""{"detail":"nope"}""", HttpStatusCode.fromValue(status), jsonHeaders) }

            val error = assertFailsWith<ApiException>("status $status") { api.upload(byteArrayOf(1)) }

            assertEquals(status, error.status)
        }
    }

    @Test
    fun nonOkStatusWithoutBodyStillThrowsApiException() = runTest {
        val api = api { respond("", HttpStatusCode.InternalServerError) }

        val error = assertFailsWith<ApiException> { api.upload(byteArrayOf(1)) }

        assertEquals(500, error.status)
    }

    @Test
    fun connectionFailureThrowsApiExceptionWithStatusZero() = runTest {
        val api = api { throw RuntimeException("connection refused") }

        val error = assertFailsWith<ApiException> { api.upload(byteArrayOf(1)) }

        assertEquals(0, error.status)
    }

    @Test
    fun malformedSuccessBodyThrowsSerializationException() = runTest {
        val api = api { respond("not json", HttpStatusCode.OK, jsonHeaders) }

        assertFailsWith<SerializationException> { api.upload(byteArrayOf(1)) }
    }

    @Test
    fun cancellationIsNotConvertedToApiException() = runTest {
        val api = api { throw CancellationException("cancelled") }

        assertFailsWith<CancellationException> { api.upload(byteArrayOf(1)) }
    }
}

