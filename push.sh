#!/bin/bash
set -e

echo "Pushing to GitHub..."
cd screenforge
git add -A
echo "Enter commit message:"
read -r msg
git commit -m "$msg"
git push
