#!/bin/bash
# Auto-commit and push script for 24Hour News
# Commits all changes every 5 minutes and pushes to GitHub

cd /home/z/my-project

while true; do
  sleep 300  # 5 minutes

  # Check for changes
  CHANGES=$(git status --porcelain 2>/dev/null)

  if [ -n "$CHANGES" ]; then
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    git add -A
    git commit -m "Auto-update: ${TIMESTAMP}

Changes:
$(git diff --cached --stat 2>/dev/null)" 2>/dev/null

    git push origin main 2>/dev/null
    echo "[${TIMESTAMP}] Committed and pushed changes"
  fi
done