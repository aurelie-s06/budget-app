#!/bin/bash
# Arrête le serveur Mon Budget lancé automatiquement et retire son démarrage à l'ouverture de session.
set -euo pipefail

LABEL="com.monbudget.server"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
rm -f "$PLIST"

echo "Désinstallé : le serveur ne démarrera plus tout seul."
echo "Pour le lancer à la main : npm run dev"
