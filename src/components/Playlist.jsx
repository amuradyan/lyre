
import { useState, useEffect } from 'react';

const exampleModules = import.meta.glob('../assets/examples/*.lyre', { as: 'raw' });

const formatTitle = (filename) => {
  return filename
    .replace('.lyre', '')
    .split('-')
    .map(word => {
      if (word.toLowerCase() === 'dre') return 'D.R.E.';
      if (word.toLowerCase() === 'pachelbels') return "Pachelbel's";
      if (word.toLowerCase() === 'beethovens') return "Beethoven's";
      if (word.toLowerCase() === 'fur') return 'Für';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

const featuredOrder = ['pachelbels-canon-in-d', 'twinkle-twinkle', 'still-dre'];

export default function Playlist({ onSelectExample, selectedExample }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [musicExamples, setMusicExamples] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExamples = async () => {
      try {
        const examples = [];

        for (const [path, moduleFunction] of Object.entries(exampleModules)) {
          const filename = path.split('/').pop();
          const id = filename.replace('.lyre', '');
          const title = formatTitle(filename);
          const code = await moduleFunction();

          examples.push({ id, title, code });
        }

        const sortedExamples = examples.sort((a, b) => {
          const aIndex = featuredOrder.indexOf(a.id);
          const bIndex = featuredOrder.indexOf(b.id);

          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.title.localeCompare(b.title);
        });

        setMusicExamples(sortedExamples);
      } catch (error) {
        console.error('Failed to load music examples:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExamples();
  }, []);

  const featuredExamples = musicExamples.slice(0, 3);
  const dropdownExamples = musicExamples.slice(3);

  const handleExampleClick = (example) => {
    if (selectedExample === example.id) return;
    onSelectExample(example.id, example.code);
    setIsDropdownOpen(false);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="px-3 py-2 rounded text-xs border bg-gray-100 animate-pulse">
            Loading...
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-4 gap-2">
        {featuredExamples.map((example) => (
          <button
            key={example.id}
            onClick={() => handleExampleClick(example)}
            className={`
              px-3 py-2 rounded text-xs border transition-all duration-200
              ${selectedExample === example.id
                ? 'bg-gray-100 border-gray-300 text-gray-800'
                : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {example.title}
          </button>
        ))}

        {dropdownExamples.length > 0 && (
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-3 py-2 rounded text-xs border transition-all duration-200 bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 flex items-center justify-center"
          >
            More {isDropdownOpen ? '▲' : '▼'}
          </button>
        )}
      </div>

      {isDropdownOpen && dropdownExamples.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-sm z-10">
          {dropdownExamples.map((example) => (
            <button
              key={example.id}
              onClick={() => handleExampleClick(example)}
              className={`
                w-full px-3 py-2 text-xs text-left hover:bg-gray-50 first:rounded-t last:rounded-b
                ${selectedExample === example.id
                  ? 'bg-gray-100 text-gray-800'
                  : 'text-gray-700'
                }
              `}
            >
              {example.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
