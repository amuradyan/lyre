const processInlineCode = (text) => {
  return text
    .replace(/`([^`]+)`/g, (_, code) => `<code class="inline-code">${code}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, (_, bold) => `<strong>${bold}</strong>`)
    .replace(/__([^_]+)__/g, (_, bold) => `<strong>${bold}</strong>`)
    .replace(/\*([^*]+)\*/g, (_, italic) => `<em>${italic}</em>`)
    .replace(/_([^_]+)_/g, (_, italic) => `<em>${italic}</em>`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline filter drop-shadow-sm">${text}</a>`);
};

const extractTitle = (line) => {
  const match = line.match(/^#\s+(.+)$/);
  return match ? match[1].trim() : null;
};

const extractHeader = (line) => {
  const match = line.match(/^(#+)\s+(.+)$/);
  return match ? { level: match[1].length, text: match[2].trim() } : null;
};

const extractSlideId = (line) => {
  const match = line.match(/<!--\s*slide-id:\s*([a-f0-9-]+)\s*-->/i);
  return match ? match[1].trim() : null;
};

const extractLink = (line) => {
  const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
  return match ? { text: match[1].trim(), href: match[2].trim() } : null;
};

const isNextSection = (line) => /^##\s+Next(\s+section)?\s*$/i.test(line.trim());
const isBackSection = (line) => /^##\s+Back(\s+section)?\s*$/i.test(line.trim());
const isSkipSection = (line) => /^##\s+Skip(\s+section)?\s*$/i.test(line.trim());
const isCodeFence = (line) => line.startsWith('```');
const isHeader = (line) => /^#/.test(line);
const isEmpty = (line) => line.trim() === '';
const isBulletPoint = (line) => /^[*+-]\s+/.test(line.trim()) && !/^\s{4,}/.test(line) && !/^\t{2,}/.test(line);
const isBlockquote = (line) => /^\s*>\s+/.test(line);
const isIndentedContent = (line) => /^\s{4,}/.test(line) || /^\t{2,}/.test(line);
const isHorizontalRule = (line) => /^-{4,}\s*$/.test(line.trim());

const createParagraph = (lines) => 
  lines.length ? {
    type: 'paragraph',
    content: processInlineCode(lines.join(' ').trim())
  } : null;

const createList = (items) =>
  items.length ? {
    type: 'list',
    items: items.map(item => processInlineCode(item.trim()))
  } : null;

const extractBulletContent = (line) => {
  const match = line.match(/^\s*[*+-]\s+(.+)$/);
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

const extractBlockquoteContent = (line) => {
  const match = line.match(/^\s*>\s+(.+)$/);
  return match ? match[1].trim() : '';
};

const extractIndentedContent = (line) => {
  return line.replace(/^\s{4}/, '').replace(/^\t{2}/, '\t').replace(/^\t/, '');
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
    codeBuffer: [],
    codeLanguage: null,
    inNext: false,
    inBack: false,
    inSkip: false
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
  
  if (!context.inCode && isNextSection(line)) {
    const flushed = flushAll(state);
    return {
      ...flushed,
      context: { ...flushed.context, inNext: true, inBack: false, inSkip: false }
    };
  }
  
  if (!context.inCode && isBackSection(line)) {
    const flushed = flushAll(state);
    return {
      ...flushed,
      context: { ...flushed.context, inBack: true, inNext: false, inSkip: false }
    };
  }

  if (!context.inCode && isSkipSection(line)) {
    const flushed = flushAll(state);
    return {
      ...flushed,
      context: { ...flushed.context, inSkip: true, inNext: false, inBack: false }
    };
  }

  if (context.inNext) {
    const link = extractLink(line);
    return link 
      ? {
          ...state,
          navigation: { ...state.navigation, next: link },
          context: { ...state.context, inNext: false }
        }
      : state;
  }
  
  if (context.inBack) {
    const link = extractLink(line);
    return link
      ? {
          ...state,
          navigation: { ...state.navigation, back: link },
          context: { ...state.context, inBack: false }
        }
      : state;
  }

  if (context.inSkip) {
    const link = extractLink(line);
    return link
      ? {
          ...state,
          navigation: { ...state.navigation, skip: link },
          context: { ...state.context, inSkip: false }
        }
      : state;
  }

  if (isCodeFence(line)) {
    if (context.inCode) {
      const code = context.codeBuffer.join('\n');
      const { comment, endIndex } = findTestComment(lines, index);
      const language = context.codeLanguage || 'javascript';
      
      return {
        ...state,
        content: [...state.content, { 
          type: 'codeblock', 
          code, 
          testComment: comment,
          language
        }],
        context: {
          ...context,
          inCode: false,
          codeBuffer: [],
          codeLanguage: null
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
  
  if (!context.inCode && isBlockquote(line)) {
    const flushed = flushParagraph(state);
    const flushedList = flushList(flushed);
    const flushedIndented = flushIndented(flushedList);
    const blockquoteContent = extractBlockquoteContent(line);
    return {
      ...flushedIndented,
      context: { ...flushedIndented.context, currentBlockquote: [...flushedIndented.context.currentBlockquote, blockquoteContent] }
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
  
  return {
    title: finalState.title,
    slideId: finalState.slideId,
    content: finalState.content,
    nextHref: finalState.navigation.next?.href || null,
    nextText: finalState.navigation.next?.text || null,
    backHref: finalState.navigation.back?.href || null,
    backText: finalState.navigation.back?.text || null,
    skipHref: finalState.navigation.skip?.href || null,
    skipText: finalState.navigation.skip?.text || null
  };
}

export { parseMarkdown };
