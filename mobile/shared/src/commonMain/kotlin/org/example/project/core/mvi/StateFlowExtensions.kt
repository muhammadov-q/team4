package org.example.project.core.mvi

import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update

fun <State> MutableStateFlow<State>.setState(reducer: (State) -> State) {
    update(reducer)
}

fun <Effect> Channel<Effect>.setEffect(effect: Effect) {
    check(trySend(effect).isSuccess) {
        "Could not send effect: $effect"
    }
}
