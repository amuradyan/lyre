import { useState, useEffect } from 'react';
import Index from './pages/Index.jsx';
import Slide from './components/slide/Slide.jsx';

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Index page - show at #playground
  if (currentHash === '#playground') {
    return <Index />;
  }

  // Default - show slide system
  return (
    <div className="font-sans bg-gray-100 text-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <Slide initialMarkdownPath="./notes/Making a sound/0 Describing Sound.md" />
      </div>
    </div>
  );
}
