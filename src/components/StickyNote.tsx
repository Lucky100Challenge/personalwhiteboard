'use client';

import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

interface StickyNoteProps {
  id: string;
  content: string;
  position: { x: number; y: number };
  color: string; // Add this line
  onUpdate: (id: string, content: string, position: { x: number; y: number }, size?: { width: number; height: number }) => void;
  onDelete: (id: string) => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({ id, content, position, color, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState(content);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(id, noteContent, position);
  };

  return (
    <Rnd
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: color,
        boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)',
        borderRadius: '5px',
        padding: '10px',
      }}
      default={{
        x: position.x,
        y: position.y,
        width: 200,
        height: 200,
      }}
      onDragStop={(e, d) => onUpdate(id, noteContent, { x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, position) => {
        onUpdate(id, noteContent, position, {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
      }}
    >
      {isEditing ? (
        <textarea
          value={noteContent}
          onChange={handleContentChange}
          onBlur={handleBlur}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: 'transparent',
            resize: 'none',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
          }}
          autoFocus
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          style={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
          }}
        >
          {noteContent || 'Click to edit'}
        </div>
      )}
      <button
        onClick={() => onDelete(id)}
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        ×
      </button>
    </Rnd>
  );
};

export default StickyNote;