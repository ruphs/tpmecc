import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import toolsMetadata from '../tools';

const ToolPage = () => {
  const { toolId } = useParams();
  
  // Find the tool with the matching ID
  const tool = toolsMetadata.find(t => t.id === toolId);
  
  // If no tool is found or if the tool is marked as work in progress, redirect to the home page
  if (!tool || tool.workInProgress) {
    return <Navigate to="/" />;
  }
  
  // Get the tool component
  const ToolComponent = tool.component;
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <span className="text-4xl mr-3">{tool.icon}</span>
          <h1 className="text-3xl font-bold">{tool.name}</h1>
        </div>
        <p className="text-gray-600">{tool.description}</p>
      </div>
      
      <div>
        <ToolComponent />
      </div>
    </div>
  );
};

export default ToolPage;
