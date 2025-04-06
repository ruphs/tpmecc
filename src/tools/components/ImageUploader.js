import React from 'react';

const ImageUploader = ({ backgroundImage, onImageUpload, onResetView, onResetColors }) => {
  return (
    <div className="mb-2 flex flex-wrap gap-2 items-center">
      <div className="relative">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Upload Image
        </button>
        <input
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
      
      {backgroundImage && (
        <>
          <button
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={onResetView}
          >
            Reset View
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={onResetColors}
          >
            Reset Colors
          </button>
        </>
      )}
    </div>
  );
};

export default ImageUploader;
