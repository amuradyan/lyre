const processInlineCode = (text) =>
  text.replace(/`([^`]+)`/g, (match, code) => `<code class="inline-code">${code}</code>`);

const extractTitle = (line) => {
  const match = line.match(/^#\s+(.+)$/);
  return match ? match[1].trim() : null;
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
const isCodeFence = (line) => line.startsWith('```');
const isHeader = (line) => /^#/.test(line);
const isEmpty = (line) => line.trim() === '';

const createParagraph = (lines) => 
  lines.length ? {
    type: 'paragraph',
    content: processInlineCode(lines.join(' ').trim())
  } : null;

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
  navigation: { next: null, back: null },
  context: {
    inCode: false,
    currentPara: [],
    codeBuffer: [],
    inNext: false,
    inBack: false
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
    const flushed = flushParagraph(state);
    return {
      ...flushed,
      context: { ...flushed.context, inNext: true, inBack: false }
    };
  }
  
  if (!context.inCode && isBackSection(line)) {
    const flushed = flushParagraph(state);
    return {
      ...flushed,
      context: { ...flushed.context, inBack: true, inNext: false }
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
  
  if (isCodeFence(line)) {
    if (context.inCode) {
      const code = context.codeBuffer.join('\n');
      const { comment, endIndex } = findTestComment(lines, index);
      
      return {
        ...state,
        content: [...state.content, { type: 'codeblock', code, testComment: comment }],
        context: {
          ...context,
          inCode: false,
          codeBuffer: []
        },
        skipToIndex: endIndex
      };
    } else {
      const flushed = flushParagraph(state);
      return {
        ...flushed,
        context: { ...flushed.context, inCode: true }
      };
    }
  }
  
  if (context.inCode) {
    return {
      ...state,
      context: { ...context, codeBuffer: [...context.codeBuffer, line] }
    };
  }
  
  if (isHeader(line)) {
    return flushParagraph(state);
  }
  
  if (isEmpty(line)) {
    return flushParagraph(state);
  }
  
  return {
    ...state,
    context: { ...context, currentPara: [...context.currentPara, line.trim()] }
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
  
  const finalState = flushParagraph(result);
  
  return {
    title: finalState.title,
    slideId: finalState.slideId,
    content: finalState.content,
    nextHref: finalState.navigation.next?.href || null,
    nextText: finalState.navigation.next?.text || null,
    backHref: finalState.navigation.back?.href || null,
    backText: finalState.navigation.back?.text || null
  };
}

export { parseMarkdown };
