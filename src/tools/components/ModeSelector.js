import React from 'react';

const ModeSelector = ({ isNegativeMode, onModeChange }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Color Selection Mode</h3>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded text-sm ${!isNegativeMode ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => onModeChange(false)}
          >
            Add Positive
          </button>
          <button
            className={`px-3 py-1 rounded text-sm ${isNegativeMode ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => onModeChange(true)}
          >
            Add Negative
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeSelector;
