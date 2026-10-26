package org.example.project.feature.camera.domain.model

class ApiException(val status: Int) : Exception("Request failed with status $status")

