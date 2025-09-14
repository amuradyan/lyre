const STORAGE_PREFIX = 'lyre_slide_';

function getSlideKey(slideId) {
  return `${STORAGE_PREFIX}${slideId}`;
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

function saveCodeBlock(slideId, blockIndex, code) {
  if (!slideId) return;

  try {
    const key = getSlideKey(slideId);
    let slideData = loadSlideData(slideId) || { codeBlocks: {} };

    slideData.codeBlocks[blockIndex] = code;

    localStorage.setItem(key, JSON.stringify(slideData));
  } catch (error) {
    console.warn('Failed to save code block:', error);
  }
}

function loadCodeBlock(slideId, blockIndex) {
  const slideData = loadSlideData(slideId);
  return slideData?.codeBlocks?.[blockIndex] || null;
}

export {
  saveCodeBlock,
  loadCodeBlock,
  loadSlideData
};
