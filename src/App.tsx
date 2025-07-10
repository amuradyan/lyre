import React, { useState } from 'react';
import LessonPage from './components/LessonPage.tsx';
import { lessons } from './data/lessons.ts';

function App() {
  const [currentPage, setCurrentPage] = useState(0);

  const handleNextChapter = () => {
    if (currentPage < lessons.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <LessonPage
          lesson={lessons[currentPage]}
          isLastPage={currentPage === lessons.length - 1}
          onNextChapter={handleNextChapter}
        />
      </div>
    </div>
  );
}

export default App;
