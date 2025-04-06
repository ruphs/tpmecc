import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toolsMetadata from '../tools';

const ToolsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  
  // Get all unique tags from tools
  const allTags = [...new Set(toolsMetadata.flatMap(tool => tool.tags))];
  
  // Filter tools based on search term, selected tag, and work in progress status
  const filteredTools = toolsMetadata.filter(tool => {
    // Skip tools marked as work in progress
    if (tool.workInProgress) return false;
    
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === '' || tool.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Programming Tools</h1>
        <p className="text-gray-600">
          A collection of tools I've developed to showcase my programming skills. These tools demonstrate my ability to create practical solutions using web technologies.
        </p>
      </div>
      
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        
        <div>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Categories</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map(tool => (
          <Link 
            key={tool.id} 
            to={`/tool/${tool.id}`}
            className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">{tool.icon}</span>
                <h2 className="text-xl font-bold">{tool.name}</h2>
              </div>
              <p className="text-gray-600 mb-4">{tool.description}</p>
              <div className="flex flex-wrap gap-2">
                {tool.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
        
        {filteredTools.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              No tools found matching your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsPage;
