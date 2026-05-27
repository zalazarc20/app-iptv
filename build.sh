#!/bin/bash
set -e

OUTPUT="$(dirname "$0")/extension.zip"

rm -f "$OUTPUT"

zip -r "$OUTPUT" . \
  -x ".git/*" \
  -x ".gitignore" \
  -x "*.zip" \
  -x "build.sh"

echo "Extension packed: $OUTPUT"
