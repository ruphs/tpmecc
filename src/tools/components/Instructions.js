import React from 'react';

const Instructions = () => {
  return (
    <>
      <div className="mt-6 p-3 bg-gray-100 rounded text-sm">
        <p><strong>Instructions:</strong></p>
        <ul className="list-disc pl-5 mt-1">
          <li>Upload an image to work with</li>
          <li>Start with the default positive mask to select colors you want to include</li>
          <li>Add additional positive masks to include more colors</li>
          <li>Add negative masks to exclude specific colors from the result</li>
          <li>Click on a mask in the list to make it active and edit it</li>
          <li>Left-click on colors in the image to add them to the active mask</li>
          <li>The color ranges automatically expand to include selected colors</li>
          <li>Adjust the RGB sliders to fine-tune each mask's range</li>
        </ul>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
        <p><strong>Tips:</strong></p>
        <ul className="list-disc pl-5 mt-1">
          <li>Masks are processed in order from top to bottom</li>
          <li>Positive masks include colors, negative masks exclude colors</li>
          <li>You can't delete the first positive mask</li>
          <li>The final mask shows white pixels that match the combined result of all masks</li>
          <li>Use right-click and drag to pan both the image and mask</li>
          <li>Use mouse wheel to zoom in and out of both views simultaneously</li>
        </ul>
      </div>
    </>
  );
};

export default Instructions;
