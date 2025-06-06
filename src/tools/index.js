// This file exports metadata about all available tools
// When adding a new tool, just create the component file in the tools directory
// and add its metadata here

import PathInterpolator from './PathInterpolator';
import ColorPicker from './ColorPicker';
import ColorRangePicker from './ColorRangePicker';
import PolygonMaskAnalyzer from './PolygonMaskAnalyzer';

// Tool metadata
const toolsMetadata = [
  {
    id: 'path-interpolator',
    name: 'Path Interpolator',
    description: 'Create and visualize interpolated paths between points with linear or cubic interpolation. Useful for geological mapping and terrain analysis.',
    component: PathInterpolator,
    icon: '📈', // Emoji icon for the tool
    tags: ['visualization', 'geology', 'mapping', 'math']
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Pick and convert colors between different formats. Helpful for creating geological maps and visualizations.',
    component: ColorPicker,
    icon: '🎨',
    tags: ['design', 'geology', 'visualization']
  },
  {
    id: 'color-range-picker',
    name: 'Color Range Picker',
    description: 'Select color ranges from images and create masks based on RGB values. Useful for image segmentation and analysis.',
    component: ColorRangePicker,
    icon: '🎭',
    tags: ['design', 'image processing', 'visualization', 'segmentation']
  },
  {
    id: 'polygon-mask-analyzer',
    name: 'Polygon Mask Analyzer',
    description: 'Analyze what percentage of a polygon area is covered by a mask. Upload an image, mask data, and draw a polygon to analyze.',
    component: PolygonMaskAnalyzer,
    icon: '📊',
    tags: ['image processing', 'analysis', 'visualization', 'segmentation']
  },
  // Note: The following tools would need their component files created
  // They are included here as examples of geology-related tools
  {
    id: 'geological-calculator',
    name: 'Geological Calculator',
    description: 'Calculate strike and dip, true thickness, apparent dip, and other geological measurements.',
    component: PathInterpolator, // Temporarily using PathInterpolator as a placeholder
    icon: '🧮',
    tags: ['geology', 'calculation', 'field work'],
    workInProgress: true // Marked as work in progress
  },
  {
    id: 'mineral-identifier',
    name: 'Mineral Identifier',
    description: 'A tool that helps identify minerals based on physical properties like color, streak, hardness, and cleavage.',
    component: ColorPicker, // Temporarily using ColorPicker as a placeholder
    icon: '💎',
    tags: ['geology', 'mineralogy', 'identification'],
    workInProgress: true // Marked as work in progress
  }
];

export default toolsMetadata;
