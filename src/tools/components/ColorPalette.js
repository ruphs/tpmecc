import React from 'react';

const ColorPalette = ({ 
  colors, 
  isNegative, 
  onRemoveColor, 
  onToggleMode 
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">
          Selected Colors ({colors.length})
        </h3>
        {onToggleMode && (
          <button
            className="text-xs text-blue-500 hover:underline"
            onClick={onToggleMode}
          >
            Show {isNegative ? 'positive' : 'negative'} colors
          </button>
        )}
      </div>
      
      {colors.length === 0 ? (
        <p className="text-gray-500">
          No colors selected yet. 
          Click on the image to select colors to {isNegative ? 'exclude' : 'include'}.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border rounded">
          {colors.map((color, index) => (
            <div key={index} className="relative group">
              <div 
                className="w-full h-10 rounded border cursor-pointer"
                style={{ backgroundColor: color }}
              ></div>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 truncate">
                {color}
              </div>
              <button
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemoveColor(color)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPalette;
