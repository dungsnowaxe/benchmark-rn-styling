#!/usr/bin/env bash
# Collect BENCHMARK_REPORT lines from a release APK on a connected Android device/emulator.
set -euo pipefail

APK="${1:-android/app/build/outputs/apk/release/app-release.apk}"
OUT="${2:-/tmp/benchmark-reports.jsonl}"
PACKAGE="com.dzungsnowaxe.benchmarkstyling"
MAX_UPDATES="${MAX_UPDATES:-100}"

SCREENS=(
  "static-benchmark"
  "user-states-benchmark"
  "form-validation-benchmark"
  "list-item-states-benchmark"
  "skeleton-transition-benchmark"
)

adb wait-for-device
# Wait until boot completed
for _ in $(seq 1 60); do
  if [ "$(adb shell getprop sys.boot_completed | tr -d '\r')" = "1" ]; then
    break
  fi
  sleep 2
done

adb install -r "$APK"
adb logcat -c
rm -f "$OUT"

# Capture logcat in background
adb logcat -v time ReactNativeJS:V *:S > /tmp/bench-logcat.txt 2>&1 &
LOGCAT_PID=$!
trap 'kill $LOGCAT_PID 2>/dev/null || true' EXIT

for screen in "${SCREENS[@]}"; do
  echo "▶ Running $screen (maxUpdates=$MAX_UPDATES)"
  adb shell am force-stop "$PACKAGE" || true
  # Expo Router deep link via scheme from app.json
  adb shell am start -a android.intent.action.VIEW \
    -d "acme://${screen}?auto=1&maxUpdates=${MAX_UPDATES}" \
    "$PACKAGE/.MainActivity" >/dev/null

  # Wait for suite-complete or timeout (3 engines * updates * interval + buffer)
  deadline=$((SECONDS + 240))
  while [ $SECONDS -lt $deadline ]; do
    if rg -q 'suite-complete' /tmp/bench-logcat.txt 2>/dev/null; then
      # Drain a moment for final lines
      sleep 1
      # Extract reports for this run then clear marker for next screen
      rg 'BENCHMARK_REPORT' /tmp/bench-logcat.txt | sed 's/.*BENCHMARK_REPORT //' >> "$OUT" || true
      : > /tmp/bench-logcat.txt
      break
    fi
    # Static screen has no suite-complete — wait briefly for initial report
    if [ "$screen" = "static-benchmark" ]; then
      sleep 4
      rg 'BENCHMARK_REPORT' /tmp/bench-logcat.txt | sed 's/.*BENCHMARK_REPORT //' >> "$OUT" || true
      : > /tmp/bench-logcat.txt
      break
    fi
    sleep 2
  done
done

echo "Wrote $OUT"
wc -l "$OUT"
