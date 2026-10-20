package org.example.project.navigation

import org.example.project.core.navigation.Screen
import kotlin.test.Test
import kotlin.test.assertEquals

class NavigationDestinationsTest {
    @Test
    fun routesStayStableAndInExpectedOrder() {
        val routes = Screen.entries.map { it.route }

        assertEquals(listOf("camera", "docs", "source"), routes)
    }

    @Test
    fun routesAreUnique() {
        val routes = Screen.entries.map { it.route }

        assertEquals(routes.size, routes.toSet().size)
    }
}

