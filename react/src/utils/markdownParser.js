function parseMarkdown(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  let title = '';
  let slideId = null;
  let inCode = false;
  let currentPara = [];
  const content = [];
  let codeBuffer = [];
  let nextHref = null;
  let nextText = null;
  let backHref = null;
  let backText = null;
  let inNext = false;
  let inBack = false;

  const processInlineCode = (text) => {
    return text.replace(/`([^`]+)`/g, (match, code) => {
      return `<code class="inline-code">${code}</code>`;
    });
  };

  const flushParagraph = () => {
    if (currentPara.length) {
      const paraText = currentPara.join(' ').trim();
      content.push({
        type: 'paragraph',
        content: processInlineCode(paraText)
      });
      currentPara = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inCode && line.startsWith('# ')) {
      if (!title) title = line.replace(/^#\s+/, '').trim();
      continue;
    }

    if (!inCode && line.trim().startsWith('<!-- slide-id:')) {
      const match = line.match(/<!--\s*slide-id:\s*([a-f0-9-]+)\s*-->/i);
      if (match) {
        slideId = match[1].trim();
      }
      continue;
    }

    if (!inCode && /^##\s+Next(\s+section)?\s*$/i.test(line.trim())) {
      flushParagraph();
      inNext = true;
      inBack = false;
      continue;
    }

    if (!inCode && /^##\s+Back(\s+section)?\s*$/i.test(line.trim())) {
      flushParagraph();
      inBack = true;
      inNext = false;
      continue;
    }

    if (inNext) {
      const m = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (m) {
        nextText = m[1].trim();
        nextHref = m[2].trim();
        inNext = false;
      }
      continue;
    }

    if (inBack) {
      const m = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (m) {
        backText = m[1].trim();
        backHref = m[2].trim();
        inBack = false;
      }
      continue;
    }

    if (line.startsWith('```')) {
      if (inCode) {
        const code = codeBuffer.join('\n');
        let testComment = null;

        if (i + 1 < lines.length) {
          let commentLines = [];
          let j = i + 1;
          let foundStart = false;
          let foundEnd = false;

          while (j < lines.length && !foundEnd) {
            const currentLine = lines[j].trim();

            if (!foundStart && currentLine.startsWith('<!--')) {
              foundStart = true;
              commentLines.push(lines[j]);
              if (currentLine.includes('-->')) {
                foundEnd = true;
              }
            } else if (foundStart && !foundEnd) {
              commentLines.push(lines[j]);
              if (currentLine.includes('-->')) {
                foundEnd = true;
              }
            } else if (!foundStart && currentLine !== '') {
              break;
            }

            j++;
          }

          if (foundStart && foundEnd) {
            testComment = commentLines.join('\n');
            i = j - 1;
          }
        }

        content.push({
          type: 'codeblock',
          code,
          testComment
        });
        codeBuffer = [];
        inCode = false;
      } else {
        flushParagraph();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    if (/^#/.test(line)) {
      flushParagraph();
      continue;
    }

    if (line.trim() === '') {
      flushParagraph();
    } else {
      currentPara.push(line.trim());
    }
  }

  flushParagraph();

  return { title, slideId, content, nextHref, nextText, backHref, backText };
}

export { parseMarkdown };
