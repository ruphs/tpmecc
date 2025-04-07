import React, { useEffect, useRef, useMemo } from 'react';

const MaskCanvas = ({ 
  backgroundImage, 
  imageWidth, 
  imageHeight, 
  masks,
  calculateFinalMask,
  zoomLevel, 
  panOffset,
  isNegativeMode,
  activeMaskName
}) => {
  const canvasRef = useRef(null);
  const lastMaskUpdateRef = useRef(null);
  
  // Memoize the mask calculation to prevent unnecessary recalculations
  const maskCanvas = useMemo(() => {
    if (!backgroundImage || !masks || masks.length === 0) return null;
    
    // Skip recalculation if masks haven't changed
    const masksString = JSON.stringify(masks.map(m => ({
      type: m.type,
      range: m.range
    })));
    
    if (lastMaskUpdateRef.current === masksString) {
      return lastMaskUpdateRef.current.canvas;
    }
    
    lastMaskUpdateRef.current = masksString;
    
    console.time('maskCalculation');
    console.log(`Processing image: ${imageWidth}x${imageHeight}`);
    
    // For very large images, we need to be more aggressive with downsampling
    const maxDimension = Math.max(imageWidth, imageHeight);
    
    // More aggressive downsampling for larger images
    let downsampleFactor = 1;
    if (maxDimension > 4000) {
      downsampleFactor = 8; // Very large images
    } else if (maxDimension > 3000) {
      downsampleFactor = 6; // Large images
    } else if (maxDimension > 2000) {
      downsampleFactor = 4; // Medium-large images
    } else if (maxDimension > 1000) {
      downsampleFactor = 2; // Medium images
    }
    
    const processWidth = Math.max(1, Math.floor(imageWidth / downsampleFactor));
    const processHeight = Math.max(1, Math.floor(imageHeight / downsampleFactor));
    
    console.log(`Processing dimensions: ${processWidth}x${processHeight}, downsample factor: ${downsampleFactor}`);
    
    // Create a temporary canvas to process the image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    
    tempCanvas.width = processWidth;
    tempCanvas.height = processHeight;
    
    // Ensure proper image rendering with correct dimensions
    try {
      tempCtx.drawImage(backgroundImage, 0, 0, imageWidth, imageHeight, 0, 0, processWidth, processHeight);
    } catch (error) {
      console.error("Error drawing image to temp canvas:", error);
      // Create a fallback canvas with a visible error indicator
      const errorCanvas = document.createElement('canvas');
      errorCanvas.width = imageWidth;
      errorCanvas.height = imageHeight;
      const errorCtx = errorCanvas.getContext('2d');
      errorCtx.fillStyle = 'black';
      errorCtx.fillRect(0, 0, imageWidth, imageHeight);
      errorCtx.fillStyle = 'red';
      errorCtx.font = '20px Arial';
      errorCtx.fillText('Error processing image', 20, 50);
      return errorCanvas;
    }
    
    // Get image data - handle potential errors
    let imageData;
    try {
      imageData = tempCtx.getImageData(0, 0, processWidth, processHeight);
    } catch (error) {
      console.error("Error getting image data:", error);
      // Create a fallback canvas with a visible error indicator
      const errorCanvas = document.createElement('canvas');
      errorCanvas.width = imageWidth;
      errorCanvas.height = imageHeight;
      const errorCtx = errorCanvas.getContext('2d');
      errorCtx.fillStyle = 'black';
      errorCtx.fillRect(0, 0, imageWidth, imageHeight);
      errorCtx.fillStyle = 'red';
      errorCtx.font = '20px Arial';
      errorCtx.fillText('Error processing image data', 20, 50);
      return errorCanvas;
    }
    
    const data = imageData.data;
    
    // Create a new canvas for the mask
    const maskOnlyCanvas = document.createElement('canvas');
    maskOnlyCanvas.width = processWidth;
    maskOnlyCanvas.height = processHeight;
    const maskOnlyCtx = maskOnlyCanvas.getContext('2d');
    
    // Fill with black background
    maskOnlyCtx.fillStyle = 'black';
    maskOnlyCtx.fillRect(0, 0, processWidth, processHeight);
    
    // Create white pixels for matching colors
    let maskImageData;
    try {
      maskImageData = maskOnlyCtx.getImageData(0, 0, processWidth, processHeight);
    } catch (error) {
      console.error("Error getting mask image data:", error);
      // Create a fallback canvas with a visible error indicator
      const errorCanvas = document.createElement('canvas');
      errorCanvas.width = imageWidth;
      errorCanvas.height = imageHeight;
      const errorCtx = errorCanvas.getContext('2d');
      errorCtx.fillStyle = 'black';
      errorCtx.fillRect(0, 0, imageWidth, imageHeight);
      errorCtx.fillStyle = 'red';
      errorCtx.font = '20px Arial';
      errorCtx.fillText('Error creating mask data', 20, 50);
      return errorCanvas;
    }
    
    const maskData = maskImageData.data;
    
    // Process pixels to avoid blocking the UI
    const totalPixels = data.length / 4;
    console.log(`Total pixels to process: ${totalPixels}`);
    
    // For very large images, we need to use a more aggressive sampling approach
    // Calculate sample rate based on total pixels
    const sampleRate = Math.max(1, Math.ceil(Math.sqrt(totalPixels / 250000)));
    console.log(`Using sample rate: ${sampleRate}`);
    
    // For very large images, we need to be more efficient
    // Process all pixels at once with the calculated sample rate
    console.log(`Processing all pixels with sample rate: ${sampleRate}`);
    
    // Process pixels in a more efficient way
    for (let y = 0; y < processHeight; y += sampleRate) {
      for (let x = 0; x < processWidth; x += sampleRate) {
        const i = (y * processWidth + x) * 4;
        
        if (i >= data.length) continue;
        
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Use the calculateFinalMask function to determine if this pixel should be included
        const isIncluded = calculateFinalMask(r, g, b);
        
        if (isIncluded) {
          // Fill a block of pixels for better visibility with downsampling
          const blockSize = Math.min(sampleRate, 4); // Limit block size for very large images
          for (let blockY = 0; blockY < blockSize && y + blockY < processHeight; blockY++) {
            for (let blockX = 0; blockX < blockSize && x + blockX < processWidth; blockX++) {
              const blockI = ((y + blockY) * processWidth + (x + blockX)) * 4;
              if (blockI < maskData.length) {
                maskData[blockI] = 255;     // R
                maskData[blockI + 1] = 255; // G
                maskData[blockI + 2] = 255; // B
                maskData[blockI + 3] = 255; // A
              }
            }
          }
        }
      }
    }
    
    // Put the mask data back to the canvas
    try {
      maskOnlyCtx.putImageData(maskImageData, 0, 0);
    } catch (error) {
      console.error("Error putting mask image data:", error);
      // Create a fallback canvas with a visible error indicator
      const errorCanvas = document.createElement('canvas');
      errorCanvas.width = imageWidth;
      errorCanvas.height = imageHeight;
      const errorCtx = errorCanvas.getContext('2d');
      errorCtx.fillStyle = 'black';
      errorCtx.fillRect(0, 0, imageWidth, imageHeight);
      errorCtx.fillStyle = 'red';
      errorCtx.font = '20px Arial';
      errorCtx.fillText('Error applying mask data', 20, 50);
      return errorCanvas;
    }
    
    // Always create a final canvas at original resolution for high-quality display
    const finalMaskCanvas = document.createElement('canvas');
    finalMaskCanvas.width = imageWidth;
    finalMaskCanvas.height = imageHeight;
    const finalCtx = finalMaskCanvas.getContext('2d');
    
    // Ensure we have valid dimensions before drawing
    if (imageWidth > 0 && imageHeight > 0 && processWidth > 0 && processHeight > 0) {
      try {
        // Draw the mask at the processed resolution to the final canvas
        finalCtx.drawImage(maskOnlyCanvas, 0, 0, processWidth, processHeight, 0, 0, imageWidth, imageHeight);
      } catch (error) {
        console.error("Error drawing final mask:", error);
        finalCtx.fillStyle = 'red';
        finalCtx.font = '20px Arial';
        finalCtx.fillText('Error creating final mask', 20, 50);
      }
    } else {
      console.error("Invalid dimensions for drawing mask:", { 
        imageWidth, imageHeight, processWidth, processHeight 
      });
      // Draw an error indicator
      finalCtx.fillStyle = 'red';
      finalCtx.font = '20px Arial';
      finalCtx.fillText('Invalid image dimensions', 20, 50);
    }
    
    console.timeEnd('maskCalculation');
    
    lastMaskUpdateRef.current = {
      masksString,
      canvas: finalMaskCanvas
    };
    
    return finalMaskCanvas;
  }, [backgroundImage, imageWidth, imageHeight, masks, calculateFinalMask]);
  
  // Draw the mask on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !maskCanvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear the display canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply the same zoom and pan as the main image
    ctx.save();
    
    // Apply zoom and pan transformations
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);
    
    // Draw the mask
    ctx.drawImage(maskCanvas, 0, 0);
    
    // Restore the transformation matrix
    ctx.restore();
    
    // Draw zoom level indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Zoom: ${zoomLevel.toFixed(1)}x`, 10, 10);
    
    // Draw active mask indicator
    ctx.fillText(`Active: ${activeMaskName}`, 10, 30);
    
    // Draw mask count
    ctx.fillText(`Masks: ${masks.length}`, 10, 50);
    
  }, [maskCanvas, zoomLevel, panOffset, activeMaskName, masks.length]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={600} 
      className="w-full bg-gray-200"
    />
  );
};

export default MaskCanvas;
