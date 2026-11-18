#!/bin/bash
# QUEEN AKUMA • simple start (Panel / shared hosting / Termux)
set -e
if [ ! -d node_modules ]; then npm install --legacy-peer-deps; fi
node manager.js
