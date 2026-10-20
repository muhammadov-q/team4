package org.example.project.di

import org.example.project.core.network.di.coreNetworkModule
import org.example.project.feature.camera.di.cameraModule
import org.koin.dsl.module

val appModule = module {
    includes(coreNetworkModule, cameraModule)
}
