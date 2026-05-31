#!/bin/sh
set -e

# Apply any pending database migrations, then start the server.
# `migrate deploy` is safe to run on every boot — it only applies new ones.
echo "Running database migrations…"
node node_modules/prisma/build/index.js migrate deploy

echo "Starting SaaSVoice…"
exec node server.js
