#!/bin/bash
cd /home/z/my-project
while true; do
  npx next dev -p 3000 > /tmp/dev.log 2>&1
  echo "$(date): Server exited, restarting in 3s..." >> /tmp/dev.log
  sleep 3
done