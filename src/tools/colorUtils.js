// Color conversion utilities

/**
 * Convert RGB values to hex color string
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color string (e.g. "#ff0000")
 */
export const rgbToHex = (r, g, b) => {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Convert hex color string to RGB object
 * @param {string} hex - Hex color string (e.g. "#ff0000" or "ff0000")
 * @returns {Object} RGB object with r, g, b properties
 */
export const hexToRgb = (hex) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
};

/**
 * Calculate color range from an array of colors
 * @param {Array} colors - Array of RGB objects
 * @returns {Object} Range object with min/max values for r, g, b
 */
export const calculateColorRange = (colors) => {
  if (!colors || colors.length === 0) {
    return {
      r: { min: 0, max: 255 },
      g: { min: 0, max: 255 },
      b: { min: 0, max: 255 }
    };
  }
  
  // Initialize with extreme values
  const range = {
    r: { min: 255, max: 0 },
    g: { min: 255, max: 0 },
    b: { min: 255, max: 0 }
  };
  
  // Find min and max for each channel
  colors.forEach(color => {
    range.r.min = Math.min(range.r.min, color.r);
    range.r.max = Math.max(range.r.max, color.r);
    range.g.min = Math.min(range.g.min, color.g);
    range.g.max = Math.max(range.g.max, color.g);
    range.b.min = Math.min(range.b.min, color.b);
    range.b.max = Math.max(range.b.max, color.b);
  });
  
  return range;
};

/**
 * Create a tight range around a single color
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @param {number} tolerance - Range tolerance (default: 5)
 * @returns {Object} Range object with min/max values for r, g, b
 */
export const createTightRange = (r, g, b, tolerance = 5) => {
  return {
    r: { min: Math.max(0, r - tolerance), max: Math.min(255, r + tolerance) },
    g: { min: Math.max(0, g - tolerance), max: Math.min(255, g + tolerance) },
    b: { min: Math.max(0, b - tolerance), max: Math.min(255, b + tolerance) }
  };
};

/**
 * Check if a pixel is within a color range
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @param {Object} range - Range object with min/max values for r, g, b
 * @returns {boolean} True if pixel is within range
 */
export const isPixelInRange = (r, g, b, range) => {
  return (
    r >= range.r.min && r <= range.r.max &&
    g >= range.g.min && g <= range.g.max &&
    b >= range.b.min && b <= range.b.max
  );
};
