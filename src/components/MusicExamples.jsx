import { useState } from 'react';

const musicExamples = [
  {
    id: 'twinkle-twinkle',
    title: 'Twinkle Twinkle',
    filename: 'twinkle-twinkle.lyre'
  },
  {
    id: 'seven-nation-army',
    title: 'Seven Nation Army',
    filename: 'seven-nation-army.lyre'
  },
  {
    id: 'beethovens-5th',
    title: "Beethoven's 5th",
    filename: 'beethovens-5th.lyre'
  },
  {
    id: 'still-dre',
    title: 'Still D.R.E.',
    filename: 'still-dre.lyre'
  },
  {
    id: 'fur-elize',
    title: 'Für Elise',
    filename: 'fur-elize.lyre'
  }
];

export default function MusicExamples({ onSelectExample, selectedExample }) {
  const [isLoading, setIsLoading] = useState(null);

  const handleExampleClick = async (example) => {
    if (selectedExample === example.id) return;

    setIsLoading(example.id);
    try {
      const response = await fetch(`/fixtures/${example.filename}`);
      const code = await response.text();
      onSelectExample(example.id, code);
    } catch (error) {
      console.error('Failed to load example:', error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
      {musicExamples.map((example) => (
        <button
          key={example.id}
          onClick={() => handleExampleClick(example)}
          disabled={isLoading === example.id}
          className={`
              px-3 py-2 rounded text-xs border transition-all duration-200
              ${selectedExample === example.id
              ? 'bg-gray-100 border-gray-300 text-gray-800'
              : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
            }
              ${isLoading === example.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
          {example.title}
        </button>
      ))}
    </div>
  );
}
