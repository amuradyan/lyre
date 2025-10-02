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

  if (currentHash === '#walkthrough' || currentHash.startsWith('#walkthrough/')) {
    return (
      <>
        <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-indigo-100 -z-10"></div>
        <div className="font-sans text-gray-900 p-8">
          <div className="max-w-65xl mx-auto">
            <Slide initialMarkdownPath="./notes/Making a sound/0 Describing Sound.md" />
          </div>
        </div>
      </>
    );
  }

  return <Index />;
}
