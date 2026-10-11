#!/bin/sh

set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SOURCE="$ROOT/config"
CONFIG_HOME=${XDG_CONFIG_HOME:-"$HOME/.config"}
TARGET="$CONFIG_HOME/opencode"

if [ -e "$TARGET" ] || [ -L "$TARGET" ]; then
  if [ -L "$TARGET" ] && [ "$(readlink "$TARGET")" = "$SOURCE" ]; then
    printf '%s\n' "OpenCode config is already linked to $SOURCE"
  else
    printf '%s\n' "Refusing to replace existing $TARGET"
    printf '%s\n' "Move or back up that directory, then run this installer again."
    exit 1
  fi
else
  mkdir -p "$CONFIG_HOME"
  ln -s "$SOURCE" "$TARGET"
  printf '%s\n' "Linked $TARGET -> $SOURCE"
fi

npm ci --prefix "$ROOT"
npm install --prefix "$SOURCE" --ignore-scripts
if command -v herdr >/dev/null 2>&1; then
  herdr integration install opencode
fi
printf '%s\n' "Installed dependencies. Run opencode reload, then restart the TUI."
