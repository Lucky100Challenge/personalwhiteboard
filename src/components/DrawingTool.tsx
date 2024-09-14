'use client';

import React from 'react';

interface DrawingToolProps {
  currentTool: 'pen' | 'eraser' | 'select';
  setCurrentTool: (tool: 'pen' | 'eraser' | 'select') => void;
  penColor: string;
  setPenColor: (color: string) => void;
}

const DrawingTool: React.FC<DrawingToolProps> = ({
  currentTool,
  setCurrentTool,
  penColor,
  setPenColor,
}) => {
  return (
    <div className="drawing-tool">
      <button
        className={currentTool === 'pen' ? 'active' : ''}
        onClick={() => setCurrentTool('pen')}
      >
        Pen
      </button>
      <button
        className={currentTool === 'eraser' ? 'active' : ''}
        onClick={() => setCurrentTool('eraser')}
      >
        Eraser
      </button>
      <button
        className={currentTool === 'select' ? 'active' : ''}
        onClick={() => setCurrentTool('select')}
      >
        Select
      </button>
      {/* Color Picker Added */}
      {currentTool === 'pen' && (
        <input
          type="color"
          value={penColor}
          onChange={(e) => setPenColor(e.target.value)}
          title="Choose pen color"
        />
      )}
    </div>
  );
};

export default DrawingTool;