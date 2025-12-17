const slideModules = import.meta.glob('../../../notes/Lyre/**/*.md', {
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

const extractTags = (content) => {
  const match = content.match(/<!--\s*tags:\s*(.+?)\s*-->/);
  return match ? match[1].split(',').map(t => t.trim()) : [];
};

export const SLIDES = Object.entries(slideModules)
  .map(([path, content]) => ({
    path: path.replace('../../../notes/Lyre/', './notes/Lyre/'),
    title: extractTitle(content),
    chapter: extractChapter(path),
    tags: extractTags(content),
    _sortOrder: extractLeadingNumber(path)
  }))
  .sort((a, b) => a._sortOrder - b._sortOrder)
  .map(({ path, title, chapter, tags }) => ({ path, title, chapter, tags }));
