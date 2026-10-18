package org.example.project.domain.model

/** [status] is the HTTP status, or 0 when the server could not be reached. */
class ApiException(val status: Int) : Exception("Request failed with status $status")
