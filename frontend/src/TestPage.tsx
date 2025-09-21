import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          Tailwind CSS Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            If you can see this styled properly, Tailwind is working!
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-100 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-red-800">Red Card</h3>
              <p className="text-red-600">This should be red</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-800">Green Card</h3>
              <p className="text-green-600">This should be green</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800">Blue Card</h3>
              <p className="text-blue-600">This should be blue</p>
            </div>
          </div>
          
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
            Test Button
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>If the above elements are not styled (no colors, no spacing), then Tailwind CSS is not loading properly.</p>
          <p>If they are styled correctly, then the issue is with the main application components.</p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;