#!/usr/bin/env bash

# Pre-commit hook to strip Claude co-author credits from commit messages

COMMIT_MSG_FILE=".git/COMMIT_EDITMSG"

if [ -f "$COMMIT_MSG_FILE" ]; then
  # Remove lines with Claude credits and co-authorship
  sed -i '/🤖 Generated with \[Claude Code\]/d' "$COMMIT_MSG_FILE"
  sed -i '/Co-Authored-By: Claude/d' "$COMMIT_MSG_FILE"

  # Remove trailing blank lines at the end
  sed -i -e :a -e '/^\s*$/d;N;ba' "$COMMIT_MSG_FILE"
fi

exit 0
