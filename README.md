# ToolBox - React Tools Collection

A modular React application that allows you to easily add, remove, and organize various tools in a single website. The application automatically discovers and lists all available tools, making it easy to extend with new functionality.

## Features

- **Modular Architecture**: Add new tools by simply creating a new component file and adding its metadata
- **Automatic Tool Discovery**: The application automatically lists all available tools on the home page
- **Responsive Design**: Works on all device sizes
- **Search and Filter**: Easily find tools by name, description, or category
- **Consistent UI**: All tools share the same layout and styling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## How to Add a New Tool

Adding a new tool is simple:

1. Create a new React component file in the `src/tools` directory (e.g., `MyNewTool.js`)
2. Implement your tool as a React component
3. Add the tool's metadata to `src/tools/index.js`

### Example:

1. Create `src/tools/Calculator.js`:

```jsx
import React, { useState } from 'react';

const Calculator = () => {
  const [result, setResult] = useState(0);
  // Implement your calculator logic here
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Calculator</h2>
      {/* Implement your calculator UI here */}
    </div>
  );
};

export default Calculator;
```

2. Add the tool's metadata to `src/tools/index.js`:

```jsx
import Calculator from './Calculator';

// Add to the toolsMetadata array:
{
  id: 'calculator',
  name: 'Calculator',
  description: 'A simple calculator for basic arithmetic operations.',
  component: Calculator,
  icon: '🧮',
  tags: ['math', 'utility']
}
```

That's it! Your new tool will automatically appear on the home page and be accessible via its own route.

## Tool Metadata

Each tool requires the following metadata:

- `id`: A unique identifier for the tool (used in URLs)
- `name`: The display name of the tool
- `description`: A brief description of what the tool does
- `component`: The React component that implements the tool
- `icon`: An emoji or icon to represent the tool
- `tags`: An array of categories/tags for filtering

## Available Tools

- **Path Interpolator**: Create and visualize interpolated paths between points with linear or cubic interpolation
- **Color Picker**: Pick and convert colors between different formats

## License

This project is licensed under the MIT License - see the LICENSE file for details.
#   t p m e c c  
 