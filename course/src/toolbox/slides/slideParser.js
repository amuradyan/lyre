const inlineCodeBackticks = /`([^`]+)`/g;
const boldDoubleAsterisks = /\*\*([^*]+)\*\*/g;
const boldDoubleUnderscores = /__([^_]+)__/g;
const italicSingleAsterisk = /\*([^*]+)\*/g;
const italicSingleUnderscore = /_([^_]+)_/g;
const markdownLink = /\[([^\]]+)\]\(([^)]+)\)/g;

const titleHeader = /^#\s+(.+)$/;
const anyHeader = /^(#+)\s+(.+)$/;
const slideIdComment = /<!--\s*slide-id:\s*([a-f0-9-]+)\s*-->/i;
const inlineNavigation = /^#####\s+(Next|Back|Skip):\s+\[([^\]]+)\]\(([^)]+)\)/i;

const startsWithHash = /^#/;
const bulletPoint = /^[*+-]\s+/;
const fourOrMoreSpaces = /^\s{4,}/;
const twoOrMoreTabs = /^\t{2,}/;
const collapsibleMarker = /^>\+\s+/;
const blockquoteMarker = /^\s*>\s+/;
const horizontalRule = /^-{4,}\s*$/;
const imageMarkdown = /^!\[([^\]]*)\]\(([^)]*)\)\s*$/;

const bulletContentCapture = /^\s*[*+-]\s+(.+)$/;
const blockquoteContentCapture = /^\s*>\s+(.+)$/;
const fourSpaces = /^\s{4}/;
const twoTabs = /^\t{2}/;
const oneTab = /^\t/;

const blockHintStart = /\/\*\s*#!\s*(.*)/;
const blockHintEndInline = /(.*)?\*\//;
const blockHintEndMultiline = /^(.*?)?\*\//;
const blockHintContinuation = /^\s*(?:\*\s*)?(.*)$/;
const inlineHint = /\/\/\s*#!\s*(.+)$/;

const processInlineCode = (text) => {
  const CODE_PLACEHOLDER = '\u0000CODE\u0000';
  const codeBlocks = [];

  let result = text.replace(inlineCodeBackticks, (match, code) => {
    codeBlocks.push(`<code class="inline-code">${code}</code>`);
    return CODE_PLACEHOLDER + (codeBlocks.length - 1) + CODE_PLACEHOLDER;
  });

  result = result
    .replace(boldDoubleAsterisks, (_, bold) => `<strong>${bold}</strong>`)
    .replace(boldDoubleUnderscores, (_, bold) => `<strong>${bold}</strong>`)
    .replace(italicSingleAsterisk, (_, italic) => `<em>${italic}</em>`)
    .replace(italicSingleUnderscore, (_, italic) => `<em>${italic}</em>`)
    .replace(markdownLink, (_, text, url) => {
      const isHashLink = url.startsWith('#');
      const target = isHashLink ? '' : ' target="_blank" rel="noopener noreferrer"';
      return `<a href="${url}"${target} class="text-indigo-600 hover:underline filter drop-shadow-sm">${text}</a>`;
    });

  result = result.replace(new RegExp(CODE_PLACEHOLDER + '(\\d+)' + CODE_PLACEHOLDER, 'g'), (_, index) => {
    return codeBlocks[parseInt(index)];
  });

  return result;
};

const extractTitle = (line) => {
  const match = line.match(titleHeader);
  return match ? match[1].trim() : null;
};

const extractHeader = (line) => {
  const match = line.match(anyHeader);
  return match ? { level: match[1].length, text: match[2].trim() } : null;
};

const extractSlideId = (line) => {
  const match = line.match(slideIdComment);
  return match ? match[1].trim() : null;
};

const extractInlineNavigation = (line) => {
  const match = line.match(inlineNavigation);
  return match ? { type: match[1].toLowerCase(), text: match[2].trim(), href: match[3].trim() } : null;
};
const isCodeFence = (line) => line.startsWith('```');
const isHeader = (line) => startsWithHash.test(line);
const isEmpty = (line) => line.trim() === '';
const isBulletPoint = (line) => bulletPoint.test(line.trim()) && !fourOrMoreSpaces.test(line) && !twoOrMoreTabs.test(line);
const isCollapsible = (line) => collapsibleMarker.test(line.trim());
const isBlockquote = (line) => blockquoteMarker.test(line) && !isCollapsible(line);
const isIndentedContent = (line) => fourOrMoreSpaces.test(line) || twoOrMoreTabs.test(line);
const isHorizontalRule = (line) => horizontalRule.test(line.trim());
const isImage = (line) => imageMarkdown.test(line.trim());

const createParagraph = (lines) => {
  if (!lines.length) return null;

  return {
    type: 'paragraph',
    content: processInlineCode(lines.join(' ').trim())
  };
};

const createList = (items) =>
  items.length ? {
    type: 'list',
    items: items.map(item => processInlineCode(item.trim()))
  } : null;

const extractBulletContent = (line) => {
  const match = line.match(bulletContentCapture);
  return match ? match[1].trim() : '';
};

const createBlockquote = (lines) =>
  lines.length ? {
    type: 'blockquote',
    content: processInlineCode(lines.join(' ').trim())
  } : null;

const createIndentedContent = (lines) =>
  lines.length ? {
    type: 'indented',
    content: processInlineCode(lines.join('\n'))
  } : null;

const createCollapsible = (lines) => {
  if (!lines.length) return null;
  const firstLine = lines[0].trim();
  const strippedFirstLine = firstLine.replace(collapsibleMarker, '');
  const allLines = [strippedFirstLine, ...lines.slice(1)];
  return {
    type: 'collapsible',
    content: processInlineCode(allLines.join(' ').trim())
  };
};

const extractBlockquoteContent = (line) => {
  const match = line.match(blockquoteContentCapture);
  return match ? match[1].trim() : '';
};

const extractIndentedContent = (line) => {
  return line.replace(fourSpaces, '').replace(twoTabs, '\t').replace(oneTab, '');
};

const extractImage = (line) => {
  const match = line.trim().match(imageMarkdown);
  if (!match) return null;

  const alt = match[1];
  const src = match[2];

  if (alt === 'wave-superposition') {
    return { type: 'wave-superposition' };
  }

  if (alt === 'harmonic-builder') {
    return { type: 'harmonic-builder' };
  }

  if (alt === 'spectrum-analyzer') {
    return { type: 'spectrum-analyzer' };
  }

  if (alt === 'synthesis-diagram') {
    return { type: 'synthesis-diagram' };
  }

  return { type: 'image', alt, src };
};

const parseFenceLanguage = (languageString) => {
  if (!languageString) return ['javascript', null];
  const parts = languageString.split(':');
  const language = parts[0] || 'javascript';
  const normalizedLanguage = language === 'js' ? 'javascript' : language;
  return parts.length > 1
    ? [normalizedLanguage, parts[1]]
    : [normalizedLanguage, null];
};

const extractHints = (code) => {
  const lines = code.split('\n');
  const hints = [];
  let inBlockHint = false;
  let blockHintLines = [];
  let blockHintStartLine = -1;

  lines.forEach((line, index) => {
    if (!inBlockHint) {
      const blockHintMatch = line.match(blockHintStart);
      if (blockHintMatch) {
        inBlockHint = true;
        blockHintStartLine = index;
        blockHintLines = [blockHintMatch[1]];

        if (line.includes('*/')) {
          const endMatch = line.match(blockHintEndInline);
          if (endMatch && endMatch[1]) {
            blockHintLines[0] = endMatch[1].trim();
          }

          let anchorLine = index + 1;
          while (anchorLine < lines.length && lines[anchorLine].trim() === '') {
            anchorLine++;
          }

          hints.push({
            type: 'block',
            text: blockHintLines.join('\n').trim(),
            anchorLine: anchorLine < lines.length ? anchorLine : index + 1,
            startLine: blockHintStartLine
          });

          inBlockHint = false;
          blockHintLines = [];
          blockHintStartLine = -1;
        }
        return;
      }

      const inlineHintMatch = line.match(inlineHint);
      if (inlineHintMatch) {
        hints.push({
          type: 'inline',
          text: inlineHintMatch[1].trim(),
          line: index
        });
      }
    } else {
      if (line.includes('*/')) {
        const endMatch = line.match(blockHintEndMultiline);
        if (endMatch && endMatch[1] && endMatch[1].trim()) {
          blockHintLines.push(endMatch[1].trim());
        }

        let anchorLine = index + 1;
        while (anchorLine < lines.length && lines[anchorLine].trim() === '') {
          anchorLine++;
        }

        hints.push({
          type: 'block',
          text: blockHintLines.join('\n').trim(),
          anchorLine: anchorLine < lines.length ? anchorLine : index + 1,
          startLine: blockHintStartLine
        });

        inBlockHint = false;
        blockHintLines = [];
        blockHintStartLine = -1;
      } else {
        const continuationMatch = line.match(blockHintContinuation);
        if (continuationMatch && continuationMatch[1].trim()) {
          blockHintLines.push(continuationMatch[1].trim());
        }
      }
    }
  });

  return hints.length > 0 ? hints : null;
};

const findTestComment = (lines, startIndex) => {
  const findCommentEnd = (lines, index, accumulator = []) => {
    if (index >= lines.length) return { comment: null, endIndex: startIndex };
    
    const line = lines[index];
    const trimmed = line.trim();
    
    if (accumulator.length === 0) {
      if (!trimmed.startsWith('<!--')) {
        return trimmed === '' 
          ? findCommentEnd(lines, index + 1, accumulator)
          : { comment: null, endIndex: startIndex };
      }
      const newAcc = [line];
      return trimmed.includes('-->')
        ? { comment: newAcc.join('\n'), endIndex: index }
        : findCommentEnd(lines, index + 1, newAcc);
    }
    
    const newAcc = [...accumulator, line];
    return trimmed.includes('-->')
      ? { comment: newAcc.join('\n'), endIndex: index }
      : findCommentEnd(lines, index + 1, newAcc);
  };
  
  return findCommentEnd(lines, startIndex + 1);
};

const createInitialState = () => ({
  title: null,
  slideId: null,
  content: [],
  navigation: { next: null, back: null, skip: null },
  context: {
    inCode: false,
    currentPara: [],
    currentList: [],
    currentBlockquote: [],
    currentIndented: [],
    currentCollapsible: [],
    codeBuffer: [],
    codeLanguage: null,
    playableNext: false
  }
});

const flushParagraph = (state) => {
  const paragraph = createParagraph(state.context.currentPara);
  return paragraph 
    ? {
        ...state,
        content: [...state.content, paragraph],
        context: { ...state.context, currentPara: [] }
      }
    : { ...state, context: { ...state.context, currentPara: [] } };
};

const flushList = (state) => {
  const list = createList(state.context.currentList);
  return list 
    ? {
        ...state,
        content: [...state.content, list],
        context: { ...state.context, currentList: [] }
      }
    : { ...state, context: { ...state.context, currentList: [] } };
};

const flushBlockquote = (state) => {
  const blockquote = createBlockquote(state.context.currentBlockquote);
  return blockquote 
    ? {
        ...state,
        content: [...state.content, blockquote],
        context: { ...state.context, currentBlockquote: [] }
      }
    : { ...state, context: { ...state.context, currentBlockquote: [] } };
};

const flushIndented = (state) => {
  const indented = createIndentedContent(state.context.currentIndented);
  return indented
    ? {
        ...state,
        content: [...state.content, indented],
        context: { ...state.context, currentIndented: [] }
      }
    : { ...state, context: { ...state.context, currentIndented: [] } };
};

const flushCollapsible = (state) => {
  const collapsible = createCollapsible(state.context.currentCollapsible);
  return collapsible
    ? {
        ...state,
        content: [...state.content, collapsible],
        context: { ...state.context, currentCollapsible: [] }
      }
    : { ...state, context: { ...state.context, currentCollapsible: [] } };
};

const flushAll = (state) => {
  let newState = state;
  if (newState.context.currentPara.length > 0) {
    newState = flushParagraph(newState);
  }
  if (newState.context.currentList.length > 0) {
    newState = flushList(newState);
  }
  if (newState.context.currentBlockquote.length > 0) {
    newState = flushBlockquote(newState);
  }
  if (newState.context.currentIndented.length > 0) {
    newState = flushIndented(newState);
  }
  if (newState.context.currentCollapsible.length > 0) {
    newState = flushCollapsible(newState);
  }
  return newState;
};

const processLine = (lines) => (state, line, index) => {
  const { context } = state;
  
  if (!context.inCode && extractTitle(line) && !state.title) {
    return { ...state, title: extractTitle(line) };
  }
  
  const slideId = !context.inCode ? extractSlideId(line) : null;
  if (slideId) {
    return { ...state, slideId };
  }

  if (!context.inCode && line.trim() === '<!-- playable -->') {
    return {
      ...state,
      context: { ...context, playableNext: true }
    };
  }

  const inlineNav = !context.inCode ? extractInlineNavigation(line) : null;
  if (inlineNav) {
    const flushed = flushAll(state);
    const navLink = { text: inlineNav.text, href: inlineNav.href };
    return {
      ...flushed,
      navigation: {
        ...flushed.navigation,
        [inlineNav.type]: navLink
      }
    };
  }

  if (isCodeFence(line)) {
    if (context.inCode) {
      const code = context.codeBuffer.join('\n');
      const { comment, endIndex } = findTestComment(lines, index);
      const [language, filename] = parseFenceLanguage(context.codeLanguage);
      const hints = extractHints(code);

      return {
        ...state,
        content: [...state.content, {
          type: 'codeblock',
          code,
          testComment: comment,
          language,
          filename,
          playable: context.playableNext,
          hints
        }],
        context: {
          ...context,
          inCode: false,
          codeBuffer: [],
          codeLanguage: null,
          playableNext: false
        },
        skipToIndex: endIndex
      };
    } else {
      const flushed = flushAll(state);
      const language = line.replace('```', '').trim() || 'javascript';
      return {
        ...flushed,
        context: {
          ...flushed.context,
          inCode: true,
          codeLanguage: language
        }
      };
    }
  }
  
  if (context.inCode) {
    return {
      ...state,
      context: { ...context, codeBuffer: [...context.codeBuffer, line] }
    };
  }
  
  if (!context.inCode && isCollapsible(line)) {
    const flushed = flushParagraph(state);
    const flushedList = flushList(flushed);
    const flushedBlockquote = flushBlockquote(flushedList);
    const flushedIndented = flushIndented(flushedBlockquote);
    return {
      ...flushedIndented,
      context: { ...flushedIndented.context, currentCollapsible: [...flushedIndented.context.currentCollapsible, line] }
    };
  }

  if (!context.inCode && isBlockquote(line)) {
    const flushed = flushParagraph(state);
    const flushedList = flushList(flushed);
    const flushedIndented = flushIndented(flushedList);
    const flushedCollapsible = flushCollapsible(flushedIndented);
    const blockquoteContent = extractBlockquoteContent(line);
    return {
      ...flushedCollapsible,
      context: { ...flushedCollapsible.context, currentBlockquote: [...flushedCollapsible.context.currentBlockquote, blockquoteContent] }
    };
  }
  
  if (!context.inCode && isIndentedContent(line)) {
    const flushed = flushParagraph(state);
    const flushedList = flushList(flushed);
    const flushedBlockquote = flushBlockquote(flushedList);
    const indentedContent = extractIndentedContent(line);
    return {
      ...flushedBlockquote,
      context: { ...flushedBlockquote.context, currentIndented: [...flushedBlockquote.context.currentIndented, indentedContent] }
    };
  }
  
  if (!context.inCode && isBulletPoint(line)) {
    const flushed = flushParagraph(state);
    const flushedBlockquote = flushBlockquote(flushed);
    const flushedIndented = flushIndented(flushedBlockquote);
    const bulletContent = extractBulletContent(line);
    return {
      ...flushedIndented,
      context: { ...flushedIndented.context, currentList: [...flushedIndented.context.currentList, bulletContent] }
    };
  }
  
  if (isHeader(line)) {
    const header = extractHeader(line);
    if (header && header.level === 1) {
      return flushAll(state);
    } else if (header && header.level > 1) {
      const flushed = flushAll(state);
      return {
        ...flushed,
        content: [...flushed.content, { 
          type: 'header', 
          level: header.level, 
          text: processInlineCode(header.text) 
        }]
      };
    }
    return flushAll(state);
  }
  
  if (!context.inCode && isHorizontalRule(line)) {
    const flushed = flushAll(state);
    return {
      ...flushed,
      content: [...flushed.content, { type: 'hr' }]
    };
  }

  if (!context.inCode && isImage(line)) {
    const image = extractImage(line);
    if (image) {
      const flushed = flushAll(state);
      return {
        ...flushed,
        content: [...flushed.content, image]
      };
    }
  }

  if (isEmpty(line)) {
    return flushAll(state);
  }
  
  const flushedList = flushList(state);
  const flushedBlockquote = flushBlockquote(flushedList);
  const flushedIndented = flushIndented(flushedBlockquote);
  return {
    ...flushedIndented,
    context: { ...flushedIndented.context, currentPara: [...flushedIndented.context.currentPara, line.trim()] }
  };
};

const groupConsecutiveCodeblocks = (content) => {
  const grouped = [];
  let currentGroup = [];

  content.forEach((item) => {
    if (item.type === 'codeblock') {
      currentGroup.push(item);
    } else {
      if (currentGroup.length > 1) {
        const hasPlayable = currentGroup.some(block => block.playable);
        const testComment = currentGroup.find(block => block.testComment)?.testComment;
        grouped.push({
          type: 'codeblock-group',
          blocks: currentGroup,
          playable: hasPlayable,
          testComment
        });
        currentGroup = [];
      } else if (currentGroup.length === 1) {
        grouped.push(currentGroup[0]);
        currentGroup = [];
      }
      grouped.push(item);
    }
  });

  if (currentGroup.length > 1) {
    const hasPlayable = currentGroup.some(block => block.playable);
    const testComment = currentGroup.find(block => block.testComment)?.testComment;
    grouped.push({
      type: 'codeblock-group',
      blocks: currentGroup,
      playable: hasPlayable,
      testComment
    });
  } else if (currentGroup.length === 1) {
    grouped.push(currentGroup[0]);
  }

  return grouped;
};

function parseMarkdown(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const processor = processLine(lines);

  const { result } = lines.reduce(
    ({ result, skipNext }, line, index) => {
      if (skipNext > 0) {
        return { result, skipNext: skipNext - 1 };
      }

      const newResult = processor(result, line, index);
      const skipCount = newResult.skipToIndex ? newResult.skipToIndex - index : 0;

      return {
        result: { ...newResult, skipToIndex: undefined },
        skipNext: skipCount
      };
    },
    { result: createInitialState(), skipNext: 0 }
  );

  const finalState = flushAll(result);
  const groupedContent = groupConsecutiveCodeblocks(finalState.content);

  return {
    title: finalState.title,
    slideId: finalState.slideId,
    content: groupedContent,
    nextHref: finalState.navigation.next?.href || null,
    nextText: finalState.navigation.next?.text || null,
    backHref: finalState.navigation.back?.href || null,
    backText: finalState.navigation.back?.text || null,
    skipHref: finalState.navigation.skip?.href || null,
    skipText: finalState.navigation.skip?.text || null
  };
}

export { parseMarkdown };
