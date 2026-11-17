#!/usr/bin/env bash
# Build the web app and publish it to the TEST site (event-management-system-test).
# Run from the repo folder in Git Bash:   bash scripts/deploy-test.sh [branch]
# Default branch is master. Never deploys to the live project.
set -euo pipefail

BRANCH="${1:-master}"
PROJECT="event-management-system-test"

cd "$(dirname "$0")/.."

echo "1/5  Getting the latest code from GitHub ($BRANCH)"
git fetch origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "2/5  Installing packages"
npm ci

echo "3/5  Building the site"
npm run build

echo "4/5  Checking you're signed in to Firebase"
if ! npx --yes firebase-tools projects:list >/dev/null 2>&1; then
  npx --yes firebase-tools login
fi

echo "5/5  Publishing to $PROJECT"
npx --yes firebase-tools deploy --only hosting --project "$PROJECT"

echo "Done. Open https://$PROJECT.web.app"
