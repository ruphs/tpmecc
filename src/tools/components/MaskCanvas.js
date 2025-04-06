import React, { useEffect, useRef, useMemo } from 'react';
import { isPixelInRange } from '../colorUtils';

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
    
    // Create a temporary canvas to process the image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // For mask calculation, we can downsample very large images
    // but keep a reasonable resolution for display quality
    const maxDimension = Math.max(imageWidth, imageHeight);
    const downsampleFactor = maxDimension > 2000 ? Math.floor(maxDimension / 2000) : 1;
    const processWidth = Math.floor(imageWidth / downsampleFactor);
    const processHeight = Math.floor(imageHeight / downsampleFactor);
    
    tempCanvas.width = processWidth;
    tempCanvas.height = processHeight;
    tempCtx.drawImage(backgroundImage, 0, 0, processWidth, processHeight);
    
    // Get image data
    const imageData = tempCtx.getImageData(0, 0, processWidth, processHeight);
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
    const maskImageData = maskOnlyCtx.getImageData(0, 0, processWidth, processHeight);
    const maskData = maskImageData.data;
    
    // Process pixels in chunks to avoid blocking the UI
    const chunkSize = 10000; // Number of pixels to process at once
    const totalPixels = data.length / 4;
    
    // For small to medium images, process all pixels
    if (totalPixels < 250000) {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Use the calculateFinalMask function to determine if this pixel should be included
        const isIncluded = calculateFinalMask(r, g, b);
        
        if (isIncluded) {
          // Set pixel to white in the mask
          maskData[i] = 255;     // R
          maskData[i + 1] = 255; // G
          maskData[i + 2] = 255; // B
          maskData[i + 3] = 255; // A
        }
      }
    } else {
      // For larger images, use a smaller sample rate to maintain quality
      const sampleRate = Math.max(1, Math.floor(Math.sqrt(totalPixels / 250000)));
      
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
            for (let blockY = 0; blockY < sampleRate && y + blockY < processHeight; blockY++) {
              for (let blockX = 0; blockX < sampleRate && x + blockX < processWidth; blockX++) {
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
    }
    
    // Put the mask data back to the canvas
    maskOnlyCtx.putImageData(maskImageData, 0, 0);
    
    // Always create a final canvas at original resolution for high-quality display
    const finalMaskCanvas = document.createElement('canvas');
    finalMaskCanvas.width = imageWidth;
    finalMaskCanvas.height = imageHeight;
    const finalCtx = finalMaskCanvas.getContext('2d');
    
    if (downsampleFactor > 1) {
      // Use a high-quality upscaling approach
      // First, draw the mask at the processed resolution
      finalCtx.drawImage(maskOnlyCanvas, 0, 0, imageWidth, imageHeight);
      
      // Apply a slight blur to smooth jagged edges from upscaling
      finalCtx.filter = 'blur(0.5px)';
      finalCtx.globalCompositeOperation = 'source-in';
      finalCtx.fillStyle = 'white';
      finalCtx.fillRect(0, 0, imageWidth, imageHeight);
      
      // Reset filters
      finalCtx.filter = 'none';
      finalCtx.globalCompositeOperation = 'source-over';
    } else {
      // For non-downsampled images, just draw directly
      finalCtx.drawImage(maskOnlyCanvas, 0, 0);
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
