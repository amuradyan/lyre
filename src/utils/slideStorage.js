const STORAGE_PREFIX = 'lyre_slide_';

function getSlideKey(slideId) {
  return `${STORAGE_PREFIX}${slideId}`;
}

function hashContent(content) {
  let hash = 0;
  if (content.length === 0) return hash;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

function loadSlideData(slideId) {
  if (!slideId) return null;

  try {
    const key = getSlideKey(slideId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Failed to load slide data:', error);
    return null;
  }
}

function saveCodeBlock(slideId, initialCode, userCode) {
  if (!slideId || !initialCode) return;

  try {
    const key = getSlideKey(slideId);
    let slideData = loadSlideData(slideId) || { codeBlocks: {} };

    const contentHash = hashContent(initialCode);
    slideData.codeBlocks[contentHash] = userCode;

    localStorage.setItem(key, JSON.stringify(slideData));
  } catch (error) {
    console.warn('Failed to save code block:', error);
  }
}

function loadCodeBlock(slideId, initialCode) {
  if (!slideId || !initialCode) return null;
  
  const slideData = loadSlideData(slideId);
  const contentHash = hashContent(initialCode);
  return slideData?.codeBlocks?.[contentHash] || null;
}

export {
  saveCodeBlock,
  loadCodeBlock,
  loadSlideData
};
