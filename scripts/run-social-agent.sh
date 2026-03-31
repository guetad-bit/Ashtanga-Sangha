#!/bin/bash
# Run the social activity agent
# Requires: SUPABASE_URL and SUPABASE_SERVICE_KEY env vars

cd "$(dirname "$0")/.."
npx ts-node scripts/social-agent.ts
