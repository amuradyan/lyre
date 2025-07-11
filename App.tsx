import React, { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lyre</h1>
          <p className="text-gray-600 mb-8">React + Deno App</p>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-lg font-semibold mb-4">Counter: {count}</p>
              <div className="space-x-3">
                <button
                  onClick={() => setCount(count + 1)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                >
                  +
                </button>
                <button
                  onClick={() => setCount(count - 1)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
                >
                  -
                </button>
                <button
                  onClick={() => setCount(0)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>✅ React app running with Deno!</p>
              <p>Edit App.tsx to get started</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
