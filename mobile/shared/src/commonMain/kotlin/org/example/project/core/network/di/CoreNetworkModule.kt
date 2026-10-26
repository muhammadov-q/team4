package org.example.project.core.network.di

import org.example.project.core.network.platform.createHttpClient
import org.koin.dsl.module

val coreNetworkModule = module {
    single { createHttpClient() }
}

