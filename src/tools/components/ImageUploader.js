import React, { useState } from 'react';

const ImageUploader = ({ backgroundImage, onImageUpload, onResetView, onResetColors }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Show loading state
    setIsLoading(true);
    
    // Call the parent's onImageUpload handler
    try {
      onImageUpload(e);
    } catch (error) {
      console.error("Error in image upload:", error);
      alert("Error uploading image. Please try a different file.");
    } finally {
      // Reset loading state after a short delay to ensure UI updates
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };
  
  return (
    <div className="mb-2 flex flex-wrap gap-2 items-center">
      <div className="relative">
        <button
          className={`px-3 py-1 ${isLoading ? 'bg-blue-300' : 'bg-blue-500'} text-white rounded hover:bg-blue-600`}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Upload Image'}
        </button>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={isLoading}
        />
      </div>
      
      {backgroundImage && (
        <>
          <button
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={onResetView}
            disabled={isLoading}
          >
            Reset View
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={onResetColors}
            disabled={isLoading}
          >
            Reset Colors
          </button>
        </>
      )}
      
      {isLoading && (
        <span className="text-sm text-blue-600">
          Processing image...
        </span>
      )}
    </div>
  );
};

export default ImageUploader;
