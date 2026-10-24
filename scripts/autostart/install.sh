#!/bin/bash
# Démarre Mon Budget à chaque ouverture de session macOS et le relance s'il s'arrête.
# L'app a sa propre adresse, pour ne gêner aucun autre projet local :
#   http://monbudget.localhost:4848
# À lancer une seule fois : bash scripts/autostart/install.sh
set -euo pipefail

# Ports réservés à Mon Budget (les autres projets AdonisJS utilisent 3333 et 24678)
PORT=4848
HMR_PORT=24848
URL="http://monbudget.localhost:$PORT"

LABEL="com.monbudget.server"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/monbudget.log"
PROJECT="$(cd "$(dirname "$0")/../.." && pwd)"
NODE="$(command -v node || true)"

if [ -z "$NODE" ]; then
  echo "Node introuvable : lance ce script depuis un terminal où « node -v » fonctionne."
  exit 1
fi

# Recharge l'agent s'il était déjà installé (libère ses ports)
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
sleep 1

for p in $PORT $HMR_PORT; do
  if lsof -tiTCP:$p -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Le port $p est déjà utilisé par un autre programme : change PORT / HMR_PORT en haut du script."
    exit 1
  fi
done

mkdir -p "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"

cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NODE</string>
    <string>ace</string>
    <string>serve</string>
    <string>--hmr</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$PROJECT</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>$(dirname "$NODE"):/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string>
    <!-- Prioritaires sur le fichier .env -->
    <key>PORT</key>
    <string>$PORT</string>
    <key>VITE_HMR_PORT</key>
    <string>$HMR_PORT</string>
    <key>APP_URL</key>
    <string>$URL</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>ThrottleInterval</key>
  <integer>10</integer>
  <key>StandardOutPath</key>
  <string>$LOG</string>
  <key>StandardErrorPath</key>
  <string>$LOG</string>
</dict>
</plist>
PLIST

launchctl bootstrap "gui/$(id -u)" "$PLIST"

echo "Installé ! Mon Budget démarre (quelques secondes) sur $URL"
echo "Il redémarrera tout seul à chaque ouverture de session."
echo "Journal : $LOG"
echo "Pour l'enlever : bash scripts/autostart/uninstall.sh"
