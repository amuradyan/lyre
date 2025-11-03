function extractTokens(line) {
  const tokens = line.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g) || [];
  return tokens;
}

function calculateSimilarity(originalTokens, editedTokens) {
  if (originalTokens.length === 0) return 1;

  const matchCount = originalTokens.filter(token => editedTokens.includes(token)).length;
  return matchCount / originalTokens.length;
}

function stripHintsFromLine(line) {
  return line
    .replace(/\/\/\s*#!.*$/, '')
    .trimEnd();
}

function extractInlineHint(line) {
  const match = line.match(/\/\/\s*#!\s*(.+)$/);
  return match ? match[1].trim() : null;
}

function stripHintsFull(code) {
  return code
    .replace(/\/\/\s*#!.*$/gm, '')
    .replace(/\/\*\s*#![\s\S]*?\*\//g, '')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n');
}

function mergeHintsIntoEdited(originalCode, editedCode) {
  const originalLines = originalCode.split('\n');
  const editedLines = editedCode.split('\n');

  const fullyStripped = stripHintsFull(originalCode);
  const strippedLines = fullyStripped.split('\n');

  const lineDiff = Math.abs(strippedLines.length - editedLines.length);
  if (lineDiff > 2) {
    return { success: false, reason: 'line_count_changed' };
  }

  const mergedLines = [];
  let failedMatches = 0;
  let origIndex = 0;
  let editIndex = 0;

  while (origIndex < originalLines.length) {
    const originalLine = originalLines[origIndex];

    if (originalLine.trim().startsWith('/*') && originalLine.includes('#!')) {
      const blockHintLines = [originalLine];

      if (originalLine.includes('*/')) {
        let anchorOrigIndex = origIndex + 1;
        while (anchorOrigIndex < originalLines.length && originalLines[anchorOrigIndex].trim() === '') {
          anchorOrigIndex++;
        }

        blockHintLines.forEach(line => mergedLines.push(line));

        while (editIndex < editedLines.length && editedLines[editIndex].trim() === '') {
          editIndex++;
        }

        if (editIndex < editedLines.length) {
          mergedLines.push(editedLines[editIndex]);
          editIndex++;
        }

        origIndex = anchorOrigIndex;
        continue;
      }

      origIndex++;
      while (origIndex < originalLines.length) {
        blockHintLines.push(originalLines[origIndex]);
        if (originalLines[origIndex].includes('*/')) {
          break;
        }
        origIndex++;
      }

      let anchorOrigIndex = origIndex + 1;
      while (anchorOrigIndex < originalLines.length && originalLines[anchorOrigIndex].trim() === '') {
        anchorOrigIndex++;
      }

      blockHintLines.forEach(line => mergedLines.push(line));

      while (editIndex < editedLines.length && editedLines[editIndex].trim() === '') {
        editIndex++;
      }

      if (editIndex < editedLines.length) {
        mergedLines.push(editedLines[editIndex]);
        editIndex++;
      }

      origIndex = anchorOrigIndex;
      continue;
    }

    if (originalLine.trim() === '') {
      if (editIndex < editedLines.length && editedLines[editIndex].trim() === '') {
        mergedLines.push(editedLines[editIndex]);
        editIndex++;
      }
      origIndex++;
      continue;
    }

    const hint = extractInlineHint(originalLine);
    if (hint) {
      if (editIndex < editedLines.length) {
        const strippedOrig = stripHintsFromLine(originalLine);
        const editedLine = editedLines[editIndex];

        const origTokens = extractTokens(strippedOrig);
        const editTokens = extractTokens(editedLine);
        const similarity = calculateSimilarity(origTokens, editTokens);

        if (similarity >= 0.6) {
          mergedLines.push(`${editedLine} // #! ${hint}`);
        } else {
          failedMatches++;
          mergedLines.push(editedLine);
        }
        editIndex++;
      }
      origIndex++;
      continue;
    }

    if (editIndex < editedLines.length) {
      mergedLines.push(editedLines[editIndex]);
      editIndex++;
    }
    origIndex++;
  }

  while (editIndex < editedLines.length) {
    mergedLines.push(editedLines[editIndex]);
    editIndex++;
  }

  const failureRate = failedMatches / strippedLines.length;
  if (failureRate > 0.3) {
    return { success: false, reason: 'too_many_changes' };
  }

  return { success: true, code: mergedLines.join('\n') };
}

export { mergeHintsIntoEdited };
