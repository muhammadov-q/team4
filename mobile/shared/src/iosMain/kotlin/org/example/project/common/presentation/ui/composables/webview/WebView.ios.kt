package org.example.project.common.presentation.ui.composables.webview

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.UIKitView
import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.ObjCSignatureOverride
import platform.Foundation.NSError
import platform.Foundation.NSURL
import platform.Foundation.NSURLRequest
import platform.darwin.NSObject
import platform.WebKit.WKNavigation
import platform.WebKit.WKNavigationDelegateProtocol
import platform.WebKit.WKWebView

private class WebViewNavigationDelegate(
    private val onLoadDone: () -> Unit,
) : NSObject(), WKNavigationDelegateProtocol {
    override fun webView(webView: WKWebView, didFinishNavigation: WKNavigation?) {
        onLoadDone()
    }

    @ObjCSignatureOverride
    override fun webView(webView: WKWebView, didFailNavigation: WKNavigation?, withError: NSError) {
        onLoadDone()
    }

    @ObjCSignatureOverride
    override fun webView(webView: WKWebView, didFailProvisionalNavigation: WKNavigation?, withError: NSError) {
        onLoadDone()
    }
}

@OptIn(ExperimentalForeignApi::class)
@Composable
actual fun WebView(url: String, modifier: Modifier) {
    var isLoading by remember(url) { mutableStateOf(true) }
    val navigationDelegate = remember(url) {
        WebViewNavigationDelegate { isLoading = false }
    }

    Box(modifier = modifier) {
        UIKitView(
            modifier = Modifier.fillMaxSize(),
            factory = {
                WKWebView().apply {
                    this.navigationDelegate = navigationDelegate
                    NSURL.URLWithString(url)?.let { loadRequest(NSURLRequest.requestWithURL(it)) }
                }
            },
        )

        if (isLoading) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
        }
    }
}
