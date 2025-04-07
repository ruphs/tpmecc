import React, { useEffect, useRef } from 'react';

const ImageCanvas = ({ 
  backgroundImage, 
  imageWidth, 
  imageHeight, 
  zoomLevel, 
  panOffset, 
  isPanning, 
  lastPanPoint, 
  setIsPanning, 
  setLastPanPoint, 
  setPanOffset, 
  setZoomLevel, 
  onColorPick 
}) => {
  const canvasRef = useRef(null);
  
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
        try {
          // Create a temporary canvas to get the pixel color
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
          
          // For all images, use the more efficient approach with a small section
          // This works better for very large images
          const sectionSize = 10; // Small section around the clicked point
          const sectionX = Math.max(0, Math.floor(imageX) - Math.floor(sectionSize/2));
          const sectionY = Math.max(0, Math.floor(imageY) - Math.floor(sectionSize/2));
          
          // Ensure we don't go out of bounds
          const actualSectionWidth = Math.min(sectionSize, imageWidth - sectionX);
          const actualSectionHeight = Math.min(sectionSize, imageHeight - sectionY);
          
          if (actualSectionWidth <= 0 || actualSectionHeight <= 0) {
            console.error("Invalid section dimensions:", { sectionX, sectionY, actualSectionWidth, actualSectionHeight });
            return;
          }
          
          tempCanvas.width = actualSectionWidth;
          tempCanvas.height = actualSectionHeight;
          
          // Draw just that section
          tempCtx.drawImage(
            backgroundImage, 
            sectionX, sectionY, actualSectionWidth, actualSectionHeight,
            0, 0, actualSectionWidth, actualSectionHeight
          );
          
          // Get pixel data - adjust coordinates to the section
          const localX = Math.min(Math.floor(imageX) - sectionX, actualSectionWidth - 1);
          const localY = Math.min(Math.floor(imageY) - sectionY, actualSectionHeight - 1);
          
          // Ensure coordinates are valid
          if (localX < 0 || localY < 0 || localX >= actualSectionWidth || localY >= actualSectionHeight) {
            console.error("Invalid local coordinates:", { localX, localY, actualSectionWidth, actualSectionHeight });
            return;
          }
          
          const pixelData = tempCtx.getImageData(localX, localY, 1, 1).data;
          
          const r = pixelData[0];
          const g = pixelData[1];
          const b = pixelData[2];
          
          console.log(`Picked color at (${Math.floor(imageX)}, ${Math.floor(imageY)}): RGB(${r}, ${g}, ${b})`);
          
          // Call the color pick callback
          onColorPick(r, g, b);
        } catch (error) {
          console.error("Error picking color:", error, {
            imageX, imageY, imageWidth, imageHeight
          });
        }
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
  }, [
    backgroundImage, 
    imageWidth, 
    imageHeight, 
    zoomLevel, 
    panOffset, 
    isPanning, 
    lastPanPoint, 
    setIsPanning, 
    setLastPanPoint, 
    setPanOffset, 
    setZoomLevel, 
    onColorPick
  ]);
  
  // Draw image on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Log image information for debugging
    console.log(`Drawing image: ${imageWidth}x${imageHeight} with zoom: ${zoomLevel}`);
    
    // Save the current transformation matrix
    ctx.save();
    
    // Apply zoom and pan transformations
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);
    
    // Draw background image - ensure we're using the correct dimensions
    try {
      // Use explicit source and destination parameters to ensure proper rendering
      ctx.drawImage(
        backgroundImage, 
        0, 0, imageWidth, imageHeight,  // Source rectangle
        0, 0, imageWidth, imageHeight   // Destination rectangle
      );
    } catch (error) {
      console.error("Error drawing image:", error, {
        imageWidth, imageHeight, zoomLevel, panOffset
      });
      
      // Draw error message
      ctx.fillStyle = 'red';
      ctx.font = '20px Arial';
      ctx.fillText('Error drawing image', 10, 50);
    }
    
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
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={600} 
      className="w-full border cursor-crosshair"
    />
  );
};

export default ImageCanvas;
