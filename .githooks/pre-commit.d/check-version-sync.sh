#!/usr/bin/env bash

# Pre-commit hook to ensure lang/package.json and lang/jsr.json have matching versions

# Check if package.json or jsr.json are being committed
if git diff --cached --name-only | grep -qE "lang/(package|jsr)\.json"; then

  # Extract versions from staged files
  PKG_VERSION=$(git show :lang/package.json 2>/dev/null | grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
  JSR_VERSION=$(git show :lang/jsr.json 2>/dev/null | grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)

  # Check if both files exist and have versions
  if [ -n "$PKG_VERSION" ] && [ -n "$JSR_VERSION" ]; then
    if [ "$PKG_VERSION" != "$JSR_VERSION" ]; then
      echo "❌ Version mismatch detected!"
      echo "   lang/package.json: $PKG_VERSION"
      echo "   lang/jsr.json:     $JSR_VERSION"
      echo ""
      echo "Both files must have the same version."
      echo "Please update both files before committing."
      exit 1
    fi
  fi
fi

exit 0
