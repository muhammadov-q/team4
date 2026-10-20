package org.example.project.core.platform

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform
