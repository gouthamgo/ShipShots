#!/bin/bash
set -e

echo "Starting Screenforge dev server..."
cd screenforge
nohup npm run dev > /tmp/screenforge.log 2>&1 &
echo "Server started at http://localhost:3000"
echo "Logs: tail -f /tmp/screenforge.log"
