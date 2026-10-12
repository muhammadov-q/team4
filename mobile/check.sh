#!/bin/bash

set -euo pipefail

echo "Running Kotlin Multiplatform tests..."
./gradlew :shared:allTests --no-daemon

echo "Building Android debug application..."
./gradlew :androidApp:assembleDebug --no-daemon

echo "All mobile checks passed."
