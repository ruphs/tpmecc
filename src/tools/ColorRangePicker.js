import React, { useState, useCallback } from 'react';
import { rgbToHex, hexToRgb, createTightRange, calculateColorRange, isPixelInRange } from './colorUtils';
import ImageCanvas from './components/ImageCanvas';
import MaskCanvas from './components/MaskCanvas';
import ColorRangeSliders from './components/ColorRangeSliders';
import ColorPalette from './components/ColorPalette';
import Instructions from './components/Instructions';
import ImageUploader from './components/ImageUploader';

const ColorRangePicker = () => {
  // Mask management
  const [masks, setMasks] = useState([
    {
      id: 1,
      name: "Positive Mask 1",
      type: "positive", // "positive" or "negative"
      colors: [],
      range: {
        r: { min: 0, max: 255 },
        g: { min: 0, max: 255 },
        b: { min: 0, max: 255 }
      }
    }
  ]);
  const [activeMaskIndex, setActiveMaskIndex] = useState(0);
  const [isNegativeMode, setIsNegativeMode] = useState(false);
  
  // Get active mask
  const activeMask = masks[activeMaskIndex];
  
  // Canvas and image state
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  
  // Zoom and pan state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
  // Add a new mask
  const addMask = (type) => {
    const newMaskId = masks.length > 0 ? Math.max(...masks.map(m => m.id)) + 1 : 1;
    const newMask = {
      id: newMaskId,
      name: `${type === 'positive' ? 'Positive' : 'Negative'} Mask ${newMaskId}`,
      type: type,
      colors: [],
      range: {
        r: { min: 0, max: 255 },
        g: { min: 0, max: 255 },
        b: { min: 0, max: 255 }
      }
    };
    
    setMasks([...masks, newMask]);
    setActiveMaskIndex(masks.length); // Set the new mask as active
    setIsNegativeMode(type === 'negative');
  };
  
  // Delete a mask
  const deleteMask = (index) => {
    // Don't allow deleting the first positive mask
    if (index === 0) return;
    
    const newMasks = [...masks];
    newMasks.splice(index, 1);
    setMasks(newMasks);
    
    // Adjust active mask index if needed
    if (activeMaskIndex >= newMasks.length) {
      setActiveMaskIndex(newMasks.length - 1);
    } else if (activeMaskIndex === index) {
      setActiveMaskIndex(Math.max(0, index - 1));
    }
  };
  
  // Switch to a different mask
  const switchToMask = (index) => {
    setActiveMaskIndex(index);
    setIsNegativeMode(masks[index].type === 'negative');
  };
  
  // Add a color to the active mask
  const addColor = useCallback((r, g, b) => {
    const newColor = rgbToHex(r, g, b);
    
    // Check if color already exists in active mask
    if (activeMask.colors.some(color => color === newColor)) {
      return;
    }
    
    // Create a new masks array with the updated active mask
    const newMasks = [...masks];
    const updatedMask = { ...activeMask };
    
    // Add color to the mask
    updatedMask.colors = [...updatedMask.colors, newColor];
    
    // Update the range
    if (updatedMask.colors.length === 1) {
      // If this is the first color, set a tight range around it
      updatedMask.range = createTightRange(r, g, b);
    } else {
      // Update the range to include this new color
      const allColors = [...updatedMask.colors.map(hexToRgb), { r, g, b }];
      updatedMask.range = calculateColorRange(allColors);
    }
    
    // Update the masks array
    newMasks[activeMaskIndex] = updatedMask;
    setMasks(newMasks);
  }, [masks, activeMask, activeMaskIndex]);
  
  // Remove a color from the active mask
  const removeColor = (colorToRemove) => {
    // Create a new masks array with the updated active mask
    const newMasks = [...masks];
    const updatedMask = { ...activeMask };
    
    // Remove the color
    updatedMask.colors = updatedMask.colors.filter(c => c !== colorToRemove);
    
    // Recalculate the range
    if (updatedMask.colors.length > 0) {
      const rgbColors = updatedMask.colors.map(hexToRgb);
      updatedMask.range = calculateColorRange(rgbColors);
    } else {
      // Reset range to default if no colors left
      updatedMask.range = {
        r: { min: 0, max: 255 },
        g: { min: 0, max: 255 },
        b: { min: 0, max: 255 }
      };
    }
    
    // Update the masks array
    newMasks[activeMaskIndex] = updatedMask;
    setMasks(newMasks);
  };
  
  // Handle manual range adjustment
  const handleRangeChange = (channel, bound, value) => {
    // Create a new masks array with the updated active mask
    const newMasks = [...masks];
    const updatedMask = { ...activeMask };
    
    // Update the range
    updatedMask.range = {
      ...updatedMask.range,
      [channel]: {
        ...updatedMask.range[channel],
        [bound]: parseInt(value)
      }
    };
    
    // Update the masks array
    newMasks[activeMaskIndex] = updatedMask;
    setMasks(newMasks);
  };
  
  // Function to handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Show loading indicator or message for large files
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert("Loading large image. This may take a moment...");
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        console.log(`Image loaded: ${img.width}x${img.height}`);
        
        setBackgroundImage(img);
        setImageWidth(img.width);
        setImageHeight(img.height);
        
        // Auto-fit the image to the canvas
        // Calculate the zoom level to fit the image
        const scaleX = 800 / img.width; // Using updated canvas width
        const scaleY = 600 / img.height; // Using updated canvas height
        const fitZoom = Math.min(scaleX, scaleY) * 0.9; // 90% of fit to leave some margin
        
        // Calculate center position
        const centerX = (800 - img.width * fitZoom) / 2;
        const centerY = (600 - img.height * fitZoom) / 2;
        
        setZoomLevel(fitZoom);
        setPanOffset({ x: centerX, y: centerY });
      };
      
      // Add error handling
      img.onerror = () => {
        alert("Error loading image. Please try a different file.");
      };
      
      img.src = event.target.result;
    };
    
    reader.onerror = () => {
      alert("Error reading file. Please try again.");
    };
    
    reader.readAsDataURL(file);
  };
  
  // Reset zoom and pan
  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };
  
  // Reset all masks
  const resetMasks = () => {
    setMasks([
      {
        id: 1,
        name: "Positive Mask 1",
        type: "positive",
        colors: [],
        range: {
          r: { min: 0, max: 255 },
          g: { min: 0, max: 255 },
          b: { min: 0, max: 255 }
        }
      }
    ]);
    setActiveMaskIndex(0);
    setIsNegativeMode(false);
  };
  
  // Download masks data
  const downloadMasks = () => {
    if (masks.length === 0) {
      alert('No masks to download');
      return;
    }
    
    // Prepare the data for download
    const masksData = masks.map(mask => ({
      id: mask.id,
      name: mask.name,
      type: mask.type,
      range: mask.range,
      colors: mask.colors
    }));
    
    // Create a JSON string with the data
    const jsonData = JSON.stringify(masksData, null, 2);
    
    // Create a blob and download it
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color_range_masks.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Calculate the final mask by combining all masks
  const calculateFinalMask = useCallback((r, g, b) => {
    // Process all masks in order
    // Start with positive masks first for potential early return
    const positiveMasks = masks.filter(mask => mask.type === 'positive');
    const negativeMasks = masks.filter(mask => mask.type === 'negative');
    
    // First check if the pixel is included by any positive mask
    let includedByPositive = false;
    for (const mask of positiveMasks) {
      if (isPixelInRange(r, g, b, mask.range)) {
        includedByPositive = true;
        break;
      }
    }
    
    // If not included by any positive mask, return false immediately
    if (!includedByPositive) {
      return false;
    }
    
    // Then check if the pixel is excluded by any negative mask
    for (const mask of negativeMasks) {
      if (isPixelInRange(r, g, b, mask.range)) {
        return false;
      }
    }
    
    // If we get here, the pixel is included by a positive mask and not excluded by any negative mask
    return true;
  }, [masks]);
  
  // Render mask list item
  const renderMaskListItem = (mask, index) => {
    const isActive = index === activeMaskIndex;
    const canDelete = index !== 0; // Can't delete the first positive mask
    
    return (
      <div 
        key={mask.id}
        className={`flex items-center justify-between p-2 mb-1 rounded cursor-pointer ${
          isActive 
            ? 'bg-blue-100 border border-blue-300' 
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
        onClick={() => switchToMask(index)}
      >
        <div className="flex items-center">
          <div 
            className={`w-3 h-3 rounded-full mr-2 ${
              mask.type === 'positive' ? 'bg-green-500' : 'bg-red-500'
            }`}
          ></div>
          <span>{mask.name} ({mask.colors.length} colors)</span>
        </div>
        {canDelete && (
          <button 
            className="text-red-500 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              deleteMask(index);
            }}
          >
            ×
          </button>
        )}
      </div>
    );
  };
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Color Range Picker</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <div className="border rounded p-2 mb-4">
              <ImageUploader 
                backgroundImage={backgroundImage}
                onImageUpload={handleImageUpload}
                onResetView={resetView}
                onResetColors={resetMasks}
              />
              
              <ImageCanvas 
                backgroundImage={backgroundImage}
                imageWidth={imageWidth}
                imageHeight={imageHeight}
                zoomLevel={zoomLevel}
                panOffset={panOffset}
                isPanning={isPanning}
                lastPanPoint={lastPanPoint}
                setIsPanning={setIsPanning}
                setLastPanPoint={setLastPanPoint}
                setPanOffset={setPanOffset}
                setZoomLevel={setZoomLevel}
                onColorPick={addColor}
              />
              
              {backgroundImage ? (
                <div className="mt-2 text-sm text-gray-600">
                  Left-click to select color, right-click and drag to pan, mouse wheel to zoom
                </div>
              ) : (
                <div className="mt-2 text-sm text-gray-600 text-center p-4">
                  Upload an image to pick colors from it
                </div>
              )}
            </div>
          </div>
          
          {/* Mask Management */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Masks</h3>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() => addMask('positive')}
                >
                  Add Positive
                </button>
                <button
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => addMask('negative')}
                >
                  Add Negative
                </button>
              </div>
            </div>
            
            <div className="border rounded p-2 mb-4 max-h-40 overflow-y-auto">
              {masks.map(renderMaskListItem)}
            </div>
          </div>
          
          {/* Color Range Sliders */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">
                {activeMask.name} Range
              </h3>
              <span className="text-sm text-gray-500">
                {activeMask.type === 'negative' ? 'Colors to exclude' : 'Colors to include'}
              </span>
            </div>
            
            <ColorRangeSliders 
              range={activeMask.range}
              onRangeChange={handleRangeChange}
            />
          </div>
          
          {/* Selected Colors */}
          <ColorPalette 
            colors={activeMask.colors}
            isNegative={activeMask.type === 'negative'}
            onRemoveColor={removeColor}
            onToggleMode={null} // No toggle in multi-mask mode
          />
        </div>
        
        <div>
          <div className="border rounded p-2 mb-4 bg-gray-100">
            <MaskCanvas 
              backgroundImage={backgroundImage}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
              masks={masks}
              calculateFinalMask={calculateFinalMask}
              zoomLevel={zoomLevel}
              panOffset={panOffset}
              isNegativeMode={isNegativeMode}
              activeMaskName={activeMask.name}
            />
            
            {backgroundImage ? (
              <div className="mt-2 text-sm text-gray-600">
                White areas show pixels that match the final mask calculation
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-600 text-center p-4">
                Upload an image to see the color range mask
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <button
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
              onClick={downloadMasks}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download Masks Data
            </button>
          </div>
          
          <Instructions />
        </div>
      </div>
    </div>
  );
};

export default ColorRangePicker;
