import React, { useState, useEffect, useRef, useCallback } from 'react';

const ColorPicker = () => {
  // Color state
  const [color, setColor] = useState('#3b82f6'); // Default to blue
  const [colorFormat, setColorFormat] = useState('hex');
  const [savedColors, setSavedColors] = useState([]);
  
  // Canvas and image state
  const canvasRef = useRef(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  
  // Zoom and pan state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
  // Convert hex to RGB
  const hexToRgb = useCallback((hex) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
  }, []);
  
  // Convert RGB to hex
  const rgbToHex = useCallback((r, g, b) => {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }, []);
  
  // Convert RGB to HSL
  const rgbToHsl = useCallback((r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }, []);
  
  // Get color in different formats
  const getColorInFormat = useCallback((format) => {
    if (format === 'hex') {
      return color;
    } else if (format === 'rgb') {
      const { r, g, b } = hexToRgb(color);
      return `rgb(${r}, ${g}, ${b})`;
    } else if (format === 'hsl') {
      const { r, g, b } = hexToRgb(color);
      const { h, s, l } = rgbToHsl(r, g, b);
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
    
    return color;
  }, [color, hexToRgb, rgbToHsl]);
  
  // Save the current color
  const saveColor = () => {
    if (!savedColors.includes(color)) {
      setSavedColors([...savedColors, color]);
    }
  };
  
  // Remove a saved color
  const removeSavedColor = (colorToRemove) => {
    setSavedColors(savedColors.filter(c => c !== colorToRemove));
  };
  
  // Copy color to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(getColorInFormat(colorFormat))
      .then(() => {
        alert('Color copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  // Function to handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setBackgroundImage(img);
        setImageWidth(img.width);
        setImageHeight(img.height);
        
        // Auto-fit the image to the canvas
        const canvas = canvasRef.current;
        if (canvas) {
          // Calculate the zoom level to fit the image
          const scaleX = canvas.width / img.width;
          const scaleY = canvas.height / img.height;
          const fitZoom = Math.min(scaleX, scaleY) * 0.9; // 90% of fit to leave some margin
          
          // Calculate center position
          const centerX = (canvas.width - img.width * fitZoom) / 2;
          const centerY = (canvas.height - img.height * fitZoom) / 2;
          
          setZoomLevel(fitZoom);
          setPanOffset({ x: centerX, y: centerY });
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };
  
  // Reset zoom and pan
  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };
  
  // Handle image canvas interactions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Convert canvas coordinates to image coordinates
    const canvasToImageCoords = (canvasX, canvasY) => {
      // Account for zoom and pan
      const x = (canvasX - panOffset.x) / zoomLevel;
      const y = (canvasY - panOffset.y) / zoomLevel;
      
      return { x, y };
    };
    
    // Prevent context menu on right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };
    
    const handleMouseDown = (e) => {
      if (e.button === 2) {
        // Right button for panning
        e.preventDefault();
        setIsPanning(true);
        setLastPanPoint({ x: e.clientX, y: e.clientY });
        return;
      }
      
      // Left click to pick color
      const canvasX = (e.clientX - rect.left) * scaleX;
      const canvasY = (e.clientY - rect.top) * scaleY;
      
      // Convert to image coordinates
      const { x: imageX, y: imageY } = canvasToImageCoords(canvasX, canvasY);
      
      // Check if click is within image bounds
      if (imageX >= 0 && imageX < imageWidth && imageY >= 0 && imageY < imageHeight) {
        // Create a temporary canvas to get the pixel color
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = imageWidth;
        tempCanvas.height = imageHeight;
        tempCtx.drawImage(backgroundImage, 0, 0);
        
        // Get pixel data
        const pixelData = tempCtx.getImageData(Math.floor(imageX), Math.floor(imageY), 1, 1).data;
        const r = pixelData[0];
        const g = pixelData[1];
        const b = pixelData[2];
        
        // Set the color
        const newColor = rgbToHex(r, g, b);
        setColor(newColor);
      }
    };
    
    const handleMouseMove = (e) => {
      if (isPanning) {
        const dx = e.clientX - lastPanPoint.x;
        const dy = e.clientY - lastPanPoint.y;
        
        setPanOffset(prev => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));
        
        setLastPanPoint({ x: e.clientX, y: e.clientY });
      }
    };
    
    const handleMouseUp = () => {
      setIsPanning(false);
    };
    
    const handleWheel = (e) => {
      e.preventDefault();
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;
      
      // Calculate zoom factor
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.max(0.1, Math.min(10, zoomLevel * zoomFactor));
      
      // Calculate new pan offset to zoom centered on mouse position
      const newPanOffset = {
        x: mouseX - (mouseX - panOffset.x) * (newZoom / zoomLevel),
        y: mouseY - (mouseY - panOffset.y) * (newZoom / zoomLevel)
      };
      
      setZoomLevel(newZoom);
      setPanOffset(newPanOffset);
    };
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [backgroundImage, imageWidth, imageHeight, zoomLevel, panOffset, isPanning, lastPanPoint, rgbToHex]);
  
  // Draw image on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save the current transformation matrix
    ctx.save();
    
    // Apply zoom and pan transformations
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);
    
    // Draw background image
    ctx.drawImage(backgroundImage, 0, 0);
    
    // Restore the transformation matrix
    ctx.restore();
    
    // Draw zoom level indicator
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Zoom: ${zoomLevel.toFixed(1)}x`, 10, 10);
    
    // Draw image dimensions
    ctx.fillText(`Image: ${imageWidth}×${imageHeight}px`, 10, 30);
    
  }, [backgroundImage, zoomLevel, panOffset, imageWidth, imageHeight]);
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Color Picker</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div 
            className="w-full h-40 rounded-lg mb-4 border"
            style={{ backgroundColor: color }}
          ></div>
          
          <div className="mb-4">
            <div className="border rounded p-2 mb-4">
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
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                
                {backgroundImage && (
                  <button
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    onClick={resetView}
                  >
                    Reset View
                  </button>
                )}
              </div>
              
              <canvas 
                ref={canvasRef} 
                width={300} 
                height={300} 
                className="w-full border cursor-crosshair"
              ></canvas>
              
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
          
          <div className="mb-4">
            <label className="block mb-2">Color Format:</label>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded ${colorFormat === 'hex' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setColorFormat('hex')}
              >
                HEX
              </button>
              <button
                className={`px-3 py-1 rounded ${colorFormat === 'rgb' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setColorFormat('rgb')}
              >
                RGB
              </button>
              <button
                className={`px-3 py-1 rounded ${colorFormat === 'hsl' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setColorFormat('hsl')}
              >
                HSL
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Color Value:</label>
            <div className="flex">
              <input
                type="text"
                value={getColorInFormat(colorFormat)}
                readOnly
                className="flex-grow px-3 py-2 border rounded-l"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
              >
                Copy
              </button>
            </div>
          </div>
          
          <button
            onClick={saveColor}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Color
          </button>
        </div>
        
        <div>
          <h3 className="font-bold mb-2">Saved Colors</h3>
          
          {savedColors.length === 0 ? (
            <p className="text-gray-500">No colors saved yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {savedColors.map((savedColor, index) => (
                <div key={index} className="relative group">
                  <div 
                    className="w-full h-16 rounded border cursor-pointer"
                    style={{ backgroundColor: savedColor }}
                    onClick={() => setColor(savedColor)}
                  ></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs px-2 py-1">
                    {savedColor}
                  </div>
                  <button
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeSavedColor(savedColor)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="font-bold mb-2">Color Information</h3>
            
            <div className="bg-gray-100 p-3 rounded">
              {(() => {
                const { r, g, b } = hexToRgb(color);
                const { h, s, l } = rgbToHsl(r, g, b);
                
                return (
                  <div>
                    <p><strong>HEX:</strong> {color}</p>
                    <p><strong>RGB:</strong> rgb({r}, {g}, {b})</p>
                    <p><strong>HSL:</strong> hsl({h}, {s}%, {l}%)</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-3 bg-gray-100 rounded text-sm">
        <p><strong>Instructions:</strong></p>
        <ul className="list-disc pl-5 mt-1">
          <li>Upload an image to pick colors from it</li>
          <li>Left-click on the image to select a color</li>
          <li>Right-click and drag to pan the image</li>
          <li>Use mouse wheel to zoom in and out</li>
          <li>Choose your preferred color format (HEX, RGB, HSL)</li>
          <li>Copy the color value to use in your projects</li>
          <li>Save colors to create a palette</li>
        </ul>
      </div>
    </div>
  );
};

export default ColorPicker;
