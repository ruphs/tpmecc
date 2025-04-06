import React from 'react';

const ColorRangeSliders = ({ 
  range, 
  onRangeChange 
}) => {
  return (
    <div className="space-y-4">
      {/* Red Channel */}
      <div>
        <div className="flex justify-between">
          <label className="text-red-600 font-medium">Red (R)</label>
          <span>
            {`${range.r.min} - ${range.r.max}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="255"
            value={range.r.min}
            onChange={(e) => onRangeChange('r', 'min', e.target.value)}
            className="w-full accent-red-600"
          />
          <input
            type="range"
            min="0"
            max="255"
            value={range.r.max}
            onChange={(e) => onRangeChange('r', 'max', e.target.value)}
            className="w-full accent-red-600"
          />
        </div>
      </div>
      
      {/* Green Channel */}
      <div>
        <div className="flex justify-between">
          <label className="text-green-600 font-medium">Green (G)</label>
          <span>
            {`${range.g.min} - ${range.g.max}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="255"
            value={range.g.min}
            onChange={(e) => onRangeChange('g', 'min', e.target.value)}
            className="w-full accent-green-600"
          />
          <input
            type="range"
            min="0"
            max="255"
            value={range.g.max}
            onChange={(e) => onRangeChange('g', 'max', e.target.value)}
            className="w-full accent-green-600"
          />
        </div>
      </div>
      
      {/* Blue Channel */}
      <div>
        <div className="flex justify-between">
          <label className="text-blue-600 font-medium">Blue (B)</label>
          <span>
            {`${range.b.min} - ${range.b.max}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="255"
            value={range.b.min}
            onChange={(e) => onRangeChange('b', 'min', e.target.value)}
            className="w-full accent-blue-600"
          />
          <input
            type="range"
            min="0"
            max="255"
            value={range.b.max}
            onChange={(e) => onRangeChange('b', 'max', e.target.value)}
            className="w-full accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
};

export default ColorRangeSliders;
