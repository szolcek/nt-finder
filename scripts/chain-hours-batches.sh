#!/usr/bin/env bash
set -u
cd "$(dirname "$0")/.."

LOG_DIR="/tmp"
WAIT_SECS=1200   # 20 min
BATCH_SIZE=100

count_settled() {
  grep -cE '^- \[[x~]\] ' locations-hours-tracker.md | tr -d ' '
}
count_total() {
  grep -cE '^- \[[ x~]\] ' locations-hours-tracker.md | tr -d ' '
}

while true; do
  total=$(count_total)
  settled=$(count_settled)
  remaining=$(( total - settled ))
  echo "[$(date -u +%H:%M:%S)] Tracker: ${settled}/${total} settled, ${remaining} remaining."

  if [ "$remaining" -le 0 ]; then
    echo "[$(date -u +%H:%M:%S)] All settled."
    break
  fi

  echo "[$(date -u +%H:%M:%S)] Sleeping ${WAIT_SECS}s before next batch..."
  sleep "$WAIT_SECS"

  ts=$(date -u +%Y%m%dT%H%M%S)
  log="${LOG_DIR}/batch-hours-${ts}.log"
  echo "[$(date -u +%H:%M:%S)] Running batch (size ${BATCH_SIZE}) -> ${log}"

  prev_settled=$settled
  npx tsx --env-file=.env.local src/lib/db/batch-scrape-hours.ts "$BATCH_SIZE" > "$log" 2>&1
  ec=$?
  echo "[$(date -u +%H:%M:%S)] Batch exit ${ec}"
  tail -3 "$log"

  settled=$(count_settled)
  remaining=$(( total - settled ))
  echo "[$(date -u +%H:%M:%S)] After batch: ${settled}/${total} settled."

  if [ "$settled" -le "$prev_settled" ]; then
    echo "[$(date -u +%H:%M:%S)] No progress in last batch; aborting chain."
    exit 2
  fi
done
