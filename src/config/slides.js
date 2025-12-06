const slideModules = import.meta.glob('../../notes/Lyre/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
});

const extractTitle = (content) => {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
};

const extractLeadingNumber = (path) => {
  const filename = path.split('/').pop();
  const match = filename.match(/^(\d+)\s+/);
  return match ? parseInt(match[1]) : Infinity;
};

const extractChapter = (path) => {
  const parts = path.split('/');
  const lyreIndex = parts.findIndex(p => p === 'Lyre');
  if (lyreIndex >= 0 && lyreIndex < parts.length - 1) {
    return parts[lyreIndex + 1];
  }
  return null;
};

export const SLIDES = Object.entries(slideModules)
  .map(([path, content]) => ({
    path: path.replace('../../notes/Lyre/', './notes/Lyre/'),
    title: extractTitle(content),
    chapter: extractChapter(path),
    _sortOrder: extractLeadingNumber(path)
  }))
  .sort((a, b) => a._sortOrder - b._sortOrder)
  .map(({ path, title, chapter }) => ({ path, title, chapter }));
