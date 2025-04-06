import React, { useState, useCallback, useRef, useEffect } from 'react';
import { isPixelInRange } from './colorUtils';

const PolygonMaskAnalyzer = () => {
  // Image and canvas state
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  
  // Zoom and pan state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
  // Mask state
  const [masks, setMasks] = useState([]);
  const [maskLoaded, setMaskLoaded] = useState(false);
  
  // Polygon state
  const [polygon, setPolygon] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // Canvas refs
  const imageCanvasRef = useRef(null);
  const polygonCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  
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
        const scaleX = 800 / img.width;
        const scaleY = 600 / img.height;
        const fitZoom = Math.min(scaleX, scaleY) * 0.9; // 90% of fit to leave some margin
        
        // Calculate center position
        const centerX = (800 - img.width * fitZoom) / 2;
        const centerY = (600 - img.height * fitZoom) / 2;
        
        setZoomLevel(fitZoom);
        setPanOffset({ x: centerX, y: centerY });
        
        // Reset polygon and analysis
        setPolygon([]);
        setAnalysisResult(null);
        
        // Draw the image
        drawImage();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };
  
  // Function to handle mask data upload
  const handleMaskUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const masksData = JSON.parse(event.target.result);
        setMasks(masksData);
        setMaskLoaded(true);
        
        // Reset analysis
        setAnalysisResult(null);
        
        // Draw the mask if image is loaded
        if (backgroundImage) {
          drawMask();
        }
      } catch (error) {
        console.error('Error parsing mask data:', error);
        alert('Invalid mask data format. Please upload a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };
  
  // Reset view
  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    drawImage();
    drawPolygon();
    if (maskLoaded) {
      drawMask();
    }
  };
  
  // Reset polygon
  const resetPolygon = () => {
    setPolygon([]);
    setAnalysisResult(null);
    drawPolygon();
  };
  
  // Draw the image on the canvas
  const drawImage = useCallback(() => {
    const canvas = imageCanvasRef.current;
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
  
  // Draw the polygon on the canvas
  const drawPolygon = useCallback(() => {
    const canvas = polygonCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (polygon.length === 0) return;
    
    // Save the current transformation matrix
    ctx.save();
    
    // Apply zoom and pan transformations
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);
    
    // Draw the polygon
    ctx.beginPath();
    ctx.moveTo(polygon[0].x, polygon[0].y);
    
    for (let i = 1; i < polygon.length; i++) {
      ctx.lineTo(polygon[i].x, polygon[i].y);
    }
    
    // Close the polygon if we have at least 3 points
    if (polygon.length >= 3) {
      ctx.closePath();
    }
    
    // Style for the polygon
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.lineWidth = 2 / zoomLevel; // Adjust line width for zoom
    ctx.stroke();
    
    // Fill with semi-transparent color
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    ctx.fill();
    
    // Draw points
    polygon.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4 / zoomLevel, 0, Math.PI * 2);
      ctx.fillStyle = index === 0 ? 'green' : 'blue';
      ctx.fill();
    });
    
    // Restore the transformation matrix
    ctx.restore();
    
    // Draw instructions
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Points: ${polygon.length}`, 10, 50);
    
    // No longer needed since we have the Analyze Polygon button
  }, [polygon, zoomLevel, panOffset]);
  
  // Draw the mask on the canvas
  const drawMask = useCallback(() => {
    const canvas = maskCanvasRef.current;
    if (!canvas || !backgroundImage || !masks || masks.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create a temporary canvas to process the image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = imageWidth;
    tempCanvas.height = imageHeight;
    tempCtx.drawImage(backgroundImage, 0, 0);
    
    // Get image data
    const imageData = tempCtx.getImageData(0, 0, imageWidth, imageHeight);
    const data = imageData.data;
    
    // Create a new canvas for the mask
    const maskOnlyCanvas = document.createElement('canvas');
    maskOnlyCanvas.width = imageWidth;
    maskOnlyCanvas.height = imageHeight;
    const maskOnlyCtx = maskOnlyCanvas.getContext('2d');
    
    // Fill with black background
    maskOnlyCtx.fillStyle = 'black';
    maskOnlyCtx.fillRect(0, 0, imageWidth, imageHeight);
    
    // Create white pixels for matching colors
    const maskImageData = maskOnlyCtx.getImageData(0, 0, imageWidth, imageHeight);
    const maskData = maskImageData.data;
    
    // Calculate the final mask
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Check if pixel is included by any positive mask and not excluded by any negative mask
      let includedByPositive = false;
      let excludedByNegative = false;
      
      for (const mask of masks) {
        if (mask.type === 'positive' && isPixelInRange(r, g, b, mask.range)) {
          includedByPositive = true;
        } else if (mask.type === 'negative' && isPixelInRange(r, g, b, mask.range)) {
          excludedByNegative = true;
          break;
        }
      }
      
      if (includedByPositive && !excludedByNegative) {
        // Set pixel to white in the mask
        maskData[i] = 255;     // R
        maskData[i + 1] = 255; // G
        maskData[i + 2] = 255; // B
        maskData[i + 3] = 255; // A
      }
    }
    
    // Put the mask data back to the canvas
    maskOnlyCtx.putImageData(maskImageData, 0, 0);
    
    // Draw the mask on the canvas with zoom and pan
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.drawImage(maskOnlyCanvas, 0, 0);
    ctx.restore();
    
    // Draw mask indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Masks: ${masks.length}`, 10, 10);
  }, [backgroundImage, imageWidth, imageHeight, masks, zoomLevel, panOffset]);
  
  // Handle canvas mouse events for polygon drawing - optimized version
  const handleCanvasMouseDown = useCallback((e) => {
    if (e.button === 2) {
      // Right button for panning
      e.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Left click to add polygon point
    const canvas = polygonCanvasRef.current;
    if (!canvas || !backgroundImage) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;
    
    // Convert to image coordinates
    const imageX = (canvasX - panOffset.x) / zoomLevel;
    const imageY = (canvasY - panOffset.y) / zoomLevel;
    
    // Check if click is within image bounds
    if (imageX >= 0 && imageX < imageWidth && imageY >= 0 && imageY < imageHeight) {
      if (!isDrawing) {
        // Start drawing a new polygon
        setPolygon([{ x: imageX, y: imageY }]);
        setIsDrawing(true);
      } else {
        // Add a point to the existing polygon
        setPolygon(prevPolygon => [...prevPolygon, { x: imageX, y: imageY }]);
      }
    }
  }, [backgroundImage, imageHeight, imageWidth, isDrawing, panOffset, zoomLevel]);
  
  const handleCanvasMouseMove = useCallback((e) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPoint.x;
      const dy = e.clientY - lastPanPoint.y;
      
      setPanOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastPanPoint]);
  
  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);
  
  const handleCanvasWheel = useCallback((e) => {
    e.preventDefault();
    
    const canvas = polygonCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
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
  }, [zoomLevel, panOffset]);
  
  // Prevent context menu on right-click
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    return false;
  }, []);
  
  // Function to analyze the polygon
  const analyzePolygon = useCallback(() => {
    if (!backgroundImage || !maskLoaded || polygon.length < 3) {
      return;
    }
    
    // Create a temporary canvas to draw the polygon
    const polygonCanvas = document.createElement('canvas');
    polygonCanvas.width = imageWidth;
    polygonCanvas.height = imageHeight;
    const polygonCtx = polygonCanvas.getContext('2d');
    
    // Draw the polygon
    polygonCtx.beginPath();
    polygonCtx.moveTo(polygon[0].x, polygon[0].y);
    
    for (let i = 1; i < polygon.length; i++) {
      polygonCtx.lineTo(polygon[i].x, polygon[i].y);
    }
    
    polygonCtx.closePath();
    polygonCtx.fillStyle = 'white';
    polygonCtx.fill();
    
    // Get polygon data
    const polygonData = polygonCtx.getImageData(0, 0, imageWidth, imageHeight).data;
    
    // Create a temporary canvas to draw the mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = imageWidth;
    maskCanvas.height = imageHeight;
    const maskCtx = maskCanvas.getContext('2d');
    
    // Draw the image
    maskCtx.drawImage(backgroundImage, 0, 0);
    
    // Get image data
    const imageData = maskCtx.getImageData(0, 0, imageWidth, imageHeight);
    const data = imageData.data;
    
    // Create a new canvas for the mask
    const maskOnlyCanvas = document.createElement('canvas');
    maskOnlyCanvas.width = imageWidth;
    maskOnlyCanvas.height = imageHeight;
    const maskOnlyCtx = maskOnlyCanvas.getContext('2d');
    
    // Fill with black background
    maskOnlyCtx.fillStyle = 'black';
    maskOnlyCtx.fillRect(0, 0, imageWidth, imageHeight);
    
    // Create white pixels for matching colors
    const maskImageData = maskOnlyCtx.getImageData(0, 0, imageWidth, imageHeight);
    const maskData = maskImageData.data;
    
    // Calculate the final mask
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Check if pixel is included by any positive mask and not excluded by any negative mask
      let includedByPositive = false;
      let excludedByNegative = false;
      
      for (const mask of masks) {
        if (mask.type === 'positive' && isPixelInRange(r, g, b, mask.range)) {
          includedByPositive = true;
        } else if (mask.type === 'negative' && isPixelInRange(r, g, b, mask.range)) {
          excludedByNegative = true;
          break;
        }
      }
      
      if (includedByPositive && !excludedByNegative) {
        // Set pixel to white in the mask
        maskData[i] = 255;     // R
        maskData[i + 1] = 255; // G
        maskData[i + 2] = 255; // B
        maskData[i + 3] = 255; // A
      }
    }
    
    // Put the mask data back to the canvas
    maskOnlyCtx.putImageData(maskImageData, 0, 0);
    
    // Get mask data
    const finalMaskData = maskOnlyCtx.getImageData(0, 0, imageWidth, imageHeight).data;
    
    // Count pixels
    let totalPolygonPixels = 0;
    let maskedPolygonPixels = 0;
    
    for (let i = 0; i < polygonData.length; i += 4) {
      // Check if pixel is in polygon (white)
      if (polygonData[i] > 0) {
        totalPolygonPixels++;
        
        // Check if pixel is also in mask (white)
        if (finalMaskData[i] > 0) {
          maskedPolygonPixels++;
        }
      }
    }
    
    // Calculate percentage
    const percentage = totalPolygonPixels > 0 
      ? (maskedPolygonPixels / totalPolygonPixels) * 100 
      : 0;
    
    // Set analysis result
    setAnalysisResult({
      totalPolygonPixels,
      maskedPolygonPixels,
      percentage: percentage.toFixed(2)
    });
  }, [backgroundImage, imageHeight, imageWidth, maskLoaded, masks, polygon]);
  
  // Complete polygon and analyze
  const completePolygon = useCallback(() => {
    if (polygon.length >= 3) {
      // Complete the polygon
      setIsDrawing(false);
      
      // Analyze the polygon
      analyzePolygon();
    } else {
      alert('Please draw a polygon with at least 3 points');
    }
  }, [polygon.length, analyzePolygon]);
  
  // Set up canvas event listeners
  useEffect(() => {
    const canvas = polygonCanvasRef.current;
    if (!canvas) return;
    
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('mouseleave', handleCanvasMouseUp);
    canvas.addEventListener('wheel', handleCanvasWheel);
    canvas.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      canvas.removeEventListener('mousedown', handleCanvasMouseDown);
      canvas.removeEventListener('mousemove', handleCanvasMouseMove);
      canvas.removeEventListener('mouseup', handleCanvasMouseUp);
      canvas.removeEventListener('mouseleave', handleCanvasMouseUp);
      canvas.removeEventListener('wheel', handleCanvasWheel);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasWheel,
    handleContextMenu
  ]);
  
  // Combined effect to redraw everything when needed
  useEffect(() => {
    drawImage();
    drawPolygon();
    if (maskLoaded) {
      drawMask();
    }
  }, [drawImage, drawPolygon, drawMask, maskLoaded, zoomLevel, panOffset, polygon]);
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Polygon Mask Analyzer</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
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
                
                <div className="relative">
                  <button
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Upload Mask Data
                  </button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleMaskUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                
              {backgroundImage && (
                  <>
                    <button
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      onClick={resetView}
                    >
                      Reset View
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={resetPolygon}
                    >
                      Reset Polygon
                    </button>
                  </>
                )}
              </div>
              
              <div className="relative">
                <canvas 
                  ref={imageCanvasRef} 
                  width={800} 
                  height={600} 
                  className="w-full absolute top-0 left-0 z-0"
                />
                <canvas 
                  ref={maskCanvasRef} 
                  width={800} 
                  height={600} 
                  className="w-full absolute top-0 left-0 z-10 opacity-50"
                />
                <canvas 
                  ref={polygonCanvasRef} 
                  width={800} 
                  height={600} 
                  className="w-full relative z-20"
                />
              </div>
              
              {backgroundImage ? (
                <div className="mt-2 text-sm text-gray-600">
                  Left-click to add polygon points, right-click and drag to pan, mouse wheel to zoom. Click "Analyze Polygon" when done.
                </div>
              ) : (
                <div className="mt-2 text-sm text-gray-600 text-center p-4">
                  Upload an image and mask data to analyze
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="border rounded p-4 mb-4 bg-gray-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Analysis Result</h3>
              {backgroundImage && polygon.length >= 3 && (
                <button
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={completePolygon}
                >
                  Analyze Polygon
                </button>
              )}
            </div>
            
            {analysisResult ? (
              <div>
                <div className="mb-2">
                  <span className="font-semibold">Total Polygon Area:</span> {analysisResult.totalPolygonPixels} pixels
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Masked Area:</span> {analysisResult.maskedPolygonPixels} pixels
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Percentage:</span> {analysisResult.percentage}%
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded">
                  <span className="font-bold text-blue-800">
                    {analysisResult.percentage}% of the polygon area is covered by the mask.
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                {!backgroundImage ? (
                  "Upload an image to start"
                ) : !maskLoaded ? (
                  "Upload mask data to continue"
                ) : polygon.length < 3 ? (
                  "Draw a polygon with at least 3 points"
                ) : isDrawing ? (
                  "Click the \"Analyze Polygon\" button when you're ready"
                ) : (
                  "No analysis results yet"
                )}
              </div>
            )}
          </div>
          
          <div className="border rounded p-4 bg-gray-100">
            <h3 className="font-bold mb-2">Instructions</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Upload an image using the "Upload Image" button</li>
              <li>Upload mask data (exported from ColorRangePicker) using the "Upload Mask Data" button</li>
              <li>Draw a polygon by clicking on the image to add points</li>
              <li>Click the "Analyze Polygon" button when you've finished drawing your polygon</li>
              <li>The result will show what percentage of the polygon area is covered by the mask</li>
              <li>Use right-click and drag to pan, and mouse wheel to zoom</li>
              <li>Click "Reset Polygon" to clear the current polygon and draw a new one</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolygonMaskAnalyzer;
