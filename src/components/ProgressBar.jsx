
import React from 'react';

const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
        style={{ width: `${progress}%` }}
      />
      <div className="text-xs font-medium text-gray-500 mt-1">
        {progress}%
      </div>
    </div>
  );
};

export default ProgressBar;
