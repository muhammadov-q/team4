package org.example.project.domain.model

class ApiException(val status: Int) : Exception("Request failed with status $status")
