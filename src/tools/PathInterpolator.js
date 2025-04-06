import React, { useState, useEffect, useRef } from 'react';

const PathInterpolator = () => {
  // State for user-provided points
  const [points, setPoints] = useState([]);
  const [newPointX, setNewPointX] = useState('');
  const [newPointY, setNewPointY] = useState('');
  const [interpolationType, setInterpolationType] = useState("linear");
  const [timeSlices, setTimeSlices] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPointIndex, setDragPointIndex] = useState(null);
  
  // State for image background
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  
  // State for zoom and pan
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
  // Function to add a new point
  const addPoint = () => {
    if (newPointX !== '' && newPointY !== '') {
      const x = parseFloat(newPointX);
      const y = parseFloat(newPointY);
      if (!isNaN(x) && !isNaN(y)) {
        setPoints([...points, { x, y }]);
        setNewPointX('');
        setNewPointY('');
      }
    }
  };
  
  // Function to remove a point
  const removePoint = (index) => {
    const newPoints = [...points];
    newPoints.splice(index, 1);
    setPoints(newPoints);
  };
  
  // Function to clear all points
  const clearPoints = () => {
    setPoints([]);
  };
  
  // Calculate distances for uniform speed
  const calculateDistances = () => {
    if (points.length < 2) return { distances: [0], totalDistance: 0 };
    
    const distances = [0];
    let totalDistance = 0;
    
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i-1].x;
      const dy = points[i].y - points[i-1].y;
      const segmentDistance = Math.sqrt(dx*dx + dy*dy);
      totalDistance += segmentDistance;
      distances.push(totalDistance);
    }
    
    return { distances, totalDistance };
  };
  
  const { distances, totalDistance } = calculateDistances();
  
  // Create interpolated positions
  const getInterpolatedPosition = (t) => {
    if (points.length < 2) return { x: 0, y: 0 };
    
    // Ensure t is between 0 and 1
    t = Math.max(0, Math.min(1, t));
    
    if (t === 0) return points[0];
    if (t === 1) return points[points.length - 1];
    
    // Find which segment we're in
    const targetDistance = t * totalDistance;
    let segmentIndex = 0;
    
    for (let i = 0; i < distances.length; i++) {
      if (distances[i] > targetDistance) {
        segmentIndex = i - 1;
        break;
      }
    }
    
    // Calculate how far along this segment we are
    const segmentStart = distances[segmentIndex];
    const segmentEnd = distances[segmentIndex + 1];
    const segmentLength = segmentEnd - segmentStart;
    const segmentProgress = (targetDistance - segmentStart) / segmentLength;
    
    // Linear interpolation between the points
    if (interpolationType === "linear") {
      return {
        x: points[segmentIndex].x + segmentProgress * (points[segmentIndex + 1].x - points[segmentIndex].x),
        y: points[segmentIndex].y + segmentProgress * (points[segmentIndex + 1].y - points[segmentIndex].y)
      };
    }
    
    // Cubic interpolation
    if (interpolationType === "cubic") {
      const p = segmentProgress;
      const p2 = p * p;
      const p3 = p2 * p;
      
      // Handle edge cases
      if (segmentIndex === 0) {
        // First segment
        const curr = points[0];
        const next = points[1];
        const after = points.length > 2 ? points[2] : next;
        
        // Create a "virtual" point before the first point
        const prev = { 
          x: curr.x - (next.x - curr.x), 
          y: curr.y - (next.y - curr.y) 
        };
        
        return {
          x: 0.5 * ((2 * curr.x) + 
              (-prev.x + next.x) * p +
              (2*prev.x - 5*curr.x + 4*next.x - after.x) * p2 +
              (-prev.x + 3*curr.x - 3*next.x + after.x) * p3),
          y: 0.5 * ((2 * curr.y) + 
              (-prev.y + next.y) * p +
              (2*prev.y - 5*curr.y + 4*next.y - after.y) * p2 +
              (-prev.y + 3*curr.y - 3*next.y + after.y) * p3)
        };
      } else if (segmentIndex === points.length - 2) {
        // Last segment
        const prev = points[segmentIndex - 1];
        const curr = points[segmentIndex];
        const next = points[segmentIndex + 1];
        
        // Create a "virtual" point after the last point
        const after = { 
          x: next.x + (next.x - curr.x), 
          y: next.y + (next.y - curr.y) 
        };
        
        return {
          x: 0.5 * ((2 * curr.x) + 
              (-prev.x + next.x) * p +
              (2*prev.x - 5*curr.x + 4*next.x - after.x) * p2 +
              (-prev.x + 3*curr.x - 3*next.x + after.x) * p3),
          y: 0.5 * ((2 * curr.y) + 
              (-prev.y + next.y) * p +
              (2*prev.y - 5*curr.y + 4*next.y - after.y) * p2 +
              (-prev.y + 3*curr.y - 3*next.y + after.y) * p3)
        };
      } else {
        // Middle segments
        const prev = points[segmentIndex - 1];
        const curr = points[segmentIndex];
        const next = points[segmentIndex + 1];
        const after = points[segmentIndex + 2];
        
        return {
          x: 0.5 * ((2 * curr.x) + 
              (-prev.x + next.x) * p +
              (2*prev.x - 5*curr.x + 4*next.x - after.x) * p2 +
              (-prev.x + 3*curr.x - 3*next.x + after.x) * p3),
          y: 0.5 * ((2 * curr.y) + 
              (-prev.y + next.y) * p +
              (2*prev.y - 5*curr.y + 4*next.y - after.y) * p2 +
              (-prev.y + 3*curr.y - 3*next.y + after.y) * p3)
        };
      }
    }
    
    return { x: 0, y: 0 };
  };
  
  // Generate time slices for the entire path
  const generateTimeSlices = () => {
    const slices = [];
    for (let i = 0; i <= timeSlices; i++) {
      const t = i / timeSlices;
      slices.push(getInterpolatedPosition(t));
    }
    return slices;
  };
  
  const timeSlicePositions = generateTimeSlices();
  
  // Animation effect
  useEffect(() => {
    let animationId;
    
    if (playing && points.length >= 2) {
      const startTime = Date.now() - (currentTime * 5000); // 5 seconds for full path
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const newTime = Math.min(elapsed / 5000, 1);
        setCurrentTime(newTime);
        
        if (newTime < 1) {
          animationId = requestAnimationFrame(animate);
        } else {
          setPlaying(false);
        }
      };
      
      animationId = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [playing, currentTime, points]);
  
  // Get current position
  const currentPosition = getInterpolatedPosition(currentTime);
  
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
  
  // Convert image coordinates to canvas coordinates
  // This function is kept for potential future use with image coordinate transformations
  // eslint-disable-next-line no-unused-vars
  const imageToCanvasCoords = (imageX, imageY) => {
    if (!backgroundImage) return { x: imageX, y: imageY };
    
    // Account for zoom and pan
    const x = imageX * zoomLevel + panOffset.x;
    const y = imageY * zoomLevel + panOffset.y;
    
    return { x, y };
  };
  
  // Handle canvas mouse events
  useEffect(() => {
    // Convert canvas coordinates to image coordinates
    const canvasToImageCoords = (canvasX, canvasY) => {
      if (!backgroundImage) return { x: canvasX, y: canvasY };
      
      const canvas = canvasRef.current;
      if (!canvas) return { x: canvasX, y: canvasY };
      
      // Account for zoom and pan
      const x = (canvasX - panOffset.x) / zoomLevel;
      const y = (canvasY - panOffset.y) / zoomLevel;
      
      return { x, y };
    };
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
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
      
      const canvasX = (e.clientX - rect.left) * scaleX;
      const canvasY = (e.clientY - rect.top) * scaleY;
      
      // Convert to image coordinates
      const { x: mouseX, y: mouseY } = canvasToImageCoords(canvasX, canvasY);
      
      // Check if we're clicking on an existing point
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const dx = point.x - mouseX;
        const dy = point.y - mouseY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // Adjust selection radius based on zoom level
        if (distance < 10 / zoomLevel) {
          setIsDragging(true);
          setDragPointIndex(i);
          return;
        }
      }
      
      // If not clicking on an existing point, add a new one
      setPoints([...points, { x: mouseX, y: mouseY }]);
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
        return;
      }
      
      if (isDragging && dragPointIndex !== null) {
        const canvasX = (e.clientX - rect.left) * scaleX;
        const canvasY = (e.clientY - rect.top) * scaleY;
        
        // Convert to image coordinates
        const { x: mouseX, y: mouseY } = canvasToImageCoords(canvasX, canvasY);
        
        const newPoints = [...points];
        newPoints[dragPointIndex] = { x: mouseX, y: mouseY };
        setPoints(newPoints);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragPointIndex(null);
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
  }, [points, isDragging, dragPointIndex, zoomLevel, panOffset, isPanning, lastPanPoint, backgroundImage]);
  
  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save the current transformation matrix
    ctx.save();
    
    // Apply zoom and pan transformations
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);
    
    // Draw background image if available
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0);
    } else {
      // Draw grid if no image
      ctx.strokeStyle = '#eeeeee';
      ctx.lineWidth = 1 / zoomLevel;
      
      const gridSize = 50;
      const startX = Math.floor(-panOffset.x / zoomLevel / gridSize) * gridSize;
      const startY = Math.floor(-panOffset.y / zoomLevel / gridSize) * gridSize;
      const endX = startX + (canvas.width / zoomLevel) + gridSize;
      const endY = startY + (canvas.height / zoomLevel) + gridSize;
      
      for (let x = startX; x <= endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      
      for (let y = startY; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }
    }
    
    if (points.length < 2) {
      // Draw original points even if less than 2
      ctx.fillStyle = 'blue';
      
      for (let i = 0; i < points.length; i++) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 6 / zoomLevel, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw point indices
        ctx.fillStyle = 'white';
        ctx.font = `${10 / zoomLevel}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i + 1, points[i].x, points[i].y);
        ctx.fillStyle = 'blue';
      }
      
      // Restore the transformation matrix
      ctx.restore();
      return;
    }
    
    // Draw connections between original points
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2 / zoomLevel;
    ctx.setLineDash([5 / zoomLevel, 5 / zoomLevel]);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw interpolated path
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2 / zoomLevel;
    ctx.beginPath();
    
    if (timeSlicePositions.length > 0) {
      ctx.moveTo(timeSlicePositions[0].x, timeSlicePositions[0].y);
      
      for (let i = 1; i < timeSlicePositions.length; i++) {
        ctx.lineTo(timeSlicePositions[i].x, timeSlicePositions[i].y);
      }
    }
    
    ctx.stroke();
    
    // Draw time slice points
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    
    for (let i = 0; i < timeSlicePositions.length; i++) {
      ctx.beginPath();
      ctx.arc(timeSlicePositions[i].x, timeSlicePositions[i].y, 2 / zoomLevel, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw original points
    ctx.fillStyle = 'blue';
    
    for (let i = 0; i < points.length; i++) {
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, 6 / zoomLevel, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw point indices
      ctx.fillStyle = 'white';
      ctx.font = `${10 / zoomLevel}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i + 1, points[i].x, points[i].y);
      ctx.fillStyle = 'blue';
    }
    
    // Draw current position
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(currentPosition.x, currentPosition.y, 8 / zoomLevel, 0, Math.PI * 2);
    ctx.fill();
    
    // Restore the transformation matrix
    ctx.restore();
    
    // Draw zoom level indicator
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Zoom: ${zoomLevel.toFixed(1)}x`, 10, 10);
    
    // Draw image dimensions if available
    if (backgroundImage) {
      ctx.fillText(`Image: ${imageWidth}×${imageHeight}px`, 10, 30);
    }
    
  }, [points, timeSlicePositions, currentPosition, backgroundImage, zoomLevel, panOffset, imageWidth, imageHeight]);
  
  // Export data
  const exportData = () => {
    if (points.length < 2) {
      alert('Add at least 2 points before exporting');
      return;
    }
    
    const data = {
      originalPoints: points,
      interpolatedPoints: timeSlicePositions,
      metadata: {
        totalDistance,
        interpolationType,
        timeSlices
      }
    };
    
    let exportText = '';
    
    if (exportFormat === 'json') {
      exportText = JSON.stringify(data, null, 2);
    } else if (exportFormat === 'python') {
      exportText = `# Path data generated with Path Interpolator
# Original points: ${points.length} points
# Interpolation type: ${interpolationType}
# Time slices: ${timeSlices}

# Original points as [(x, y), ...]
original_points = [
${points.map(p => `    (${p.x}, ${p.y})`).join(',\n')}
]

# Interpolated points as [(x, y), ...]
interpolated_points = [
${timeSlicePositions.map(p => `    (${p.x.toFixed(4)}, ${p.y.toFixed(4)})`).join(',\n')}
]

# Metadata
metadata = {
    "total_distance": ${totalDistance.toFixed(4)},
    "interpolation_type": "${interpolationType}",
    "time_slices": ${timeSlices}
}
`;
    } else if (exportFormat === 'csv') {
      exportText = 'index,t,x,y\n';
      timeSlicePositions.forEach((p, i) => {
        const t = i / timeSlices;
        exportText += `${i},${t.toFixed(4)},${p.x.toFixed(4)},${p.y.toFixed(4)}\n`;
      });
    }
    
    // Create a blob and download it
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `path_data.${exportFormat === 'csv' ? 'csv' : exportFormat === 'python' ? 'py' : 'json'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Import points from a file
  const importPoints = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          if (data.originalPoints && Array.isArray(data.originalPoints)) {
            setPoints(data.originalPoints);
          } else {
            throw new Error('Invalid JSON format');
          }
        } else if (file.name.endsWith('.csv')) {
          // Assume CSV format: x,y
          const lines = content.split('\n').filter(line => line.trim() !== '');
          const newPoints = [];
          
          // Skip header if present
          const startLine = lines[0].includes('x') && lines[0].includes('y') ? 1 : 0;
          
          for (let i = startLine; i < lines.length; i++) {
            const parts = lines[i].split(',');
            if (parts.length >= 2) {
              const x = parseFloat(parts[parts.length - 2]);
              const y = parseFloat(parts[parts.length - 1]);
              if (!isNaN(x) && !isNaN(y)) {
                newPoints.push({ x, y });
              }
            }
          }
          
          if (newPoints.length > 0) {
            setPoints(newPoints);
          } else {
            throw new Error('No valid points found in CSV');
          }
        } else {
          throw new Error('Unsupported file format');
        }
      } catch (error) {
        alert(`Error importing points: ${error.message}`);
      }
    };
    
    reader.readAsText(file);
  };
  
  // Reset zoom and pan
  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Path Interpolator with Image Tracing</h2>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <div className="relative">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={resetView}
              >
                Reset View
              </button>
            )}
            
            {backgroundImage && (
              <span className="text-sm text-gray-600">
                Use mouse wheel to zoom, right-click and drag to pan
              </span>
            )}
          </div>
          
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={400} 
            className="border w-full h-96 cursor-crosshair"
          ></canvas>
          
          <div className="mt-4">
            <label className="block mb-2">Progress: {Math.round(currentTime * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={currentTime}
              onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => {
                setPlaying(!playing);
                if (currentTime >= 1) setCurrentTime(0);
              }}
              disabled={points.length < 2}
            >
              {playing ? "Pause" : (currentTime >= 1 ? "Restart" : "Play")}
            </button>
            
            <div className="flex items-center gap-2">
              <span>Interpolation:</span>
              <select 
                className="px-2 py-1 border rounded"
                value={interpolationType} 
                onChange={(e) => setInterpolationType(e.target.value)}
              >
                <option value="linear">Linear</option>
                <option value="cubic">Cubic</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span>Time slices:</span>
              <input
                type="number"
                min="10"
                max="1000"
                value={timeSlices}
                onChange={(e) => setTimeSlices(parseInt(e.target.value))}
                className="w-20 border rounded px-2 py-1"
              />
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span>Export format:</span>
              <select 
                className="px-2 py-1 border rounded"
                value={exportFormat} 
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="json">JSON</option>
                <option value="python">Python</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={exportData}
              disabled={points.length < 2}
            >
              Export Data
            </button>
            
            <div className="relative">
              <button
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Import Points
              </button>
              <input
                type="file"
                accept=".json,.csv"
                onChange={importPoints}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
        
        <div className="col-span-1">
          <div className="border rounded p-4 h-full flex flex-col">
            <h3 className="font-bold mb-2">Points (Click canvas to add)</h3>
            
            <div className="flex gap-2 mb-4">
              <input
                type="number"
                placeholder="X"
                value={newPointX}
                onChange={(e) => setNewPointX(e.target.value)}
                className="border rounded px-2 py-1 w-24"
              />
              <input
                type="number"
                placeholder="Y"
                value={newPointY}
                onChange={(e) => setNewPointY(e.target.value)}
                className="border rounded px-2 py-1 w-24"
              />
              <button
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={addPoint}
              >
                Add
              </button>
            </div>
            
            <div className="overflow-y-auto flex-grow mb-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border px-2 py-1 text-left">Pt</th>
                    <th className="border px-2 py-1 text-left">X</th>
                    <th className="border px-2 py-1 text-left">Y</th>
                    <th className="border px-2 py-1 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((point, index) => (
                    <tr key={index}>
                      <td className="border px-2 py-1">{index + 1}</td>
                      <td className="border px-2 py-1">{point.x.toFixed(1)}</td>
                      <td className="border px-2 py-1">{point.y.toFixed(1)}</td>
                      <td className="border px-2 py-1">
                        <button
                          className="px-2 py-0 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                          onClick={() => removePoint(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {points.length === 0 && (
                    <tr>
                      <td colSpan="4" className="border px-2 py-1 text-center text-gray-500">
                        No points added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mt-auto"
              onClick={clearPoints}
              disabled={points.length === 0}
            >
              Clear All Points
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-2 bg-gray-100 rounded text-sm">
        <p><strong>Instructions:</strong></p>
        <ul className="list-disc pl-5 mt-1">
          <li>Upload an image to trace points over it</li>
          <li>Use mouse wheel to zoom in/out for precision</li>
          <li>Right-click and drag to pan the view</li>
          <li>Click on the canvas to add points or use the form</li>
          <li>Drag existing points to reposition them</li>
          <li>Use the interpolation dropdown to switch between linear and cubic</li>
          <li>Adjust the number of time slices as needed</li>
          <li>Use the export button to save data in JSON, Python or CSV format</li>
          <li>The progress slider and play button let you visualize movement</li>
        </ul>
      </div>
      
      <div className="mt-4 p-2 bg-gray-100 rounded text-sm" style={{ display: points.length > 0 ? 'block' : 'none' }}>
        <p><strong>Current Position:</strong> x: {currentPosition.x?.toFixed(2) || 0}, y: {currentPosition.y?.toFixed(2) || 0}</p>
        <p className="mt-2"><strong>Path Statistics:</strong></p>
        <ul className="list-disc pl-5 mt-1">
          <li>Total points: {points.length}</li>
          {points.length >= 2 && (
            <>
              <li>Total path distance: {totalDistance.toFixed(2)} pixels</li>
              <li>Time slices: {timeSlices}</li>
              <li>Interpolation method: {interpolationType}</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PathInterpolator;
