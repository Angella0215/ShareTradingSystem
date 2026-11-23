#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -f backend/.env ]]; then
  echo 'Copy the Neon connection string into backend/.env (see backend/.env.example)';
  cp backend/.env.example backend/.env
  echo 'Set DATABASE_URL and JWT_SECRET, then re-run this script.'
  exit 1
fi
npm --prefix backend install
npm --prefix frontend install
npm --prefix backend run db:setup
read -r -p 'Import the 18 Oct 2026 database snapshot? [Y/n] ' answer
if [[ ! "$answer" =~ ^[Nn]$ ]];then npm --prefix backend run db:import;fi
printf 'Start with ./start.sh\n'
