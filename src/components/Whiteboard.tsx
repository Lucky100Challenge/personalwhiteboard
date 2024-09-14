'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import DrawingTool from './DrawingTool';
import StickyNote from './StickyNote';
import ImageUpload from './ImageUpload';
import { Rnd } from 'react-rnd';
import { FiPenTool, FiEdit2, FiMousePointer, FiFileText, FiImage, FiTrash2, FiRotateCcw, FiRotateCw, FiZoomIn, FiZoomOut, FiMinus, FiPlus } from 'react-icons/fi';
import './Whiteboard.css';
import SupporterCTA from './SupporterCTA';
import { getRandomColor } from './utils';

interface WhiteboardObject {
  id: string;
  type: 'drawing' | 'stickyNote' | 'image';
  content: any;
  position: { x: number; y: number };
  color?: string;
  size?: number | { width: number; height: number };
}

const Whiteboard: React.FC = () => {
  const [objects, setObjects] = useState<WhiteboardObject[]>([]);
  const [past, setPast] = useState<WhiteboardObject[][]>([]);
  const [future, setFuture] = useState<WhiteboardObject[][]>([]);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'select'>('pen');
  const [penColor, setPenColor] = useState('#000000');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [penSize, setPenSize] = useState(2);

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const drawWhiteboardBackground = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < ctx.canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ctx.canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < ctx.canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
        ctx.stroke();
      }
    }
  }, []);

  const drawObjects = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.save();
      ctx.scale(zoom, zoom);
      ctx.translate(pan.x, pan.y);

      objects.forEach((obj) => {
        if (obj.type === 'drawing') {
          ctx.beginPath();
          ctx.strokeStyle = obj.color || '#000000';
          ctx.lineWidth = typeof obj.size === 'number' ? obj.size : 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          obj.content.forEach((point: { x: number; y: number }, index: number) => {
            if (index === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });
          ctx.stroke();
        } else if (obj.type === 'image') {
          const img = new Image();
          img.src = obj.content;
          img.onload = () => {
            const size = typeof obj.size === 'object' ? obj.size : { width: img.width, height: img.height };
            ctx.drawImage(img, obj.position.x, obj.position.y, size.width, size.height);
          };
        }
      });

      ctx.restore();
    }
  }, [objects, zoom, pan]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = containerSize.width;
      canvas.height = containerSize.height;
      drawWhiteboardBackground();
      drawObjects();
    }
  }, [containerSize, drawWhiteboardBackground, drawObjects]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'pen' || currentTool === 'eraser') {
      setIsDrawing(true);
      const newPoint = getCanvasPoint(e);
      setCurrentPath([newPoint]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      const newPoint = getCanvasPoint(e);
      setCurrentPath((prevPath) => [...prevPath, newPoint]);
      
      // Cancel the previous animation frame if it exists
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      // Request a new animation frame to redraw the canvas
      const newAnimationFrameId = requestAnimationFrame(redrawCanvas);
      setAnimationFrameId(newAnimationFrameId);
    }
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      drawWhiteboardBackground();
      drawObjects();

      // Draw the current path
      if (currentPath.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : penColor;
        ctx.lineWidth = currentTool === 'eraser' ? penSize * 2 : penSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        for (let i = 1; i < currentPath.length; i++) {
          ctx.lineTo(currentPath[i].x, currentPath[i].y);
        }
        ctx.stroke();
      }
    }
  }, [currentPath, currentTool, penColor, penSize, drawWhiteboardBackground, drawObjects]);

  useEffect(() => {
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [animationFrameId]);

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const newDrawing: WhiteboardObject = {
        id: Date.now().toString(),
        type: 'drawing',
        content: currentPath,
        position: { x: 0, y: 0 },
        color: currentTool === 'eraser' ? '#FFFFFF' : penColor,
        size: penSize,
      };
      updateObjects([...objects, newDrawing]);
      setCurrentPath([]);
    }
  };

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom,
      };
    }
    return { x: 0, y: 0 };
  };

  const handleAddStickyNote = () => {
    const newStickyNote: WhiteboardObject = {
      id: Date.now().toString(),
      type: 'stickyNote',
      content: '',
      position: { x: 100, y: 100 },
      color: getRandomColor(),
    };
    updateObjects([...objects, newStickyNote]);
  };

  const handleImageUpload = (image: string) => {
    const newImage: WhiteboardObject = {
      id: Date.now().toString(),
      type: 'image',
      content: image,
      position: { x: 100, y: 100 },
    };
    updateObjects([...objects, newImage]);
  };

  const handleClearAll = () => {
    updateObjects([]);
  };

  const handleUndo = () => {
    if (past.length > 0) {
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      setPast(newPast);
      setFuture([objects, ...future]);
      setObjects(previous);
    }
  };

  const handleRedo = () => {
    if (future.length > 0) {
      const next = future[0];
      const newFuture = future.slice(1);
      setPast([...past, objects]);
      setFuture(newFuture);
      setObjects(next);
    }
  };

  const updateObjects = (newObjects: WhiteboardObject[]) => {
    setPast([...past, objects]);
    setObjects(newObjects);
    setFuture([]);
  };

  const handleUpdateStickyNote = (
    id: string,
    content: string,
    position: { x: number; y: number },
    size?: { width: number; height: number }
  ) => {
    setObjects(
      objects.map((obj) =>
        obj.id === id ? { ...obj, content, position, size } : obj
      )
    );
  };

  const handleDeleteStickyNote = (id: string) => {
    setObjects(objects.filter((obj) => obj.id !== id));
  };

  const handleUpdateImage = (
    id: string,
    content: string,
    position: { x: number; y: number },
    size?: number | { width: number; height: number }
  ) => {
    setObjects(
      objects.map((obj) =>
        obj.id === id ? { ...obj, content, position, size } : obj
      )
    );
  };

  const handleZoom = (delta: number) => {
    setZoom((prevZoom) => {
      const newZoom = Math.max(0.1, Math.min(5, prevZoom + delta));
      const centerX = windowSize.width / 2;
      const centerY = windowSize.height / 2;
      const newPanX = centerX - (centerX - pan.x) * (newZoom / prevZoom);
      const newPanY = centerY - (centerY - pan.y) * (newZoom / prevZoom);
      setPan({ x: newPanX, y: newPanY });
      return newZoom;
    });
  };

  const handlePan = (dx: number, dy: number) => {
    setPan((prevPan) => ({
      x: prevPan.x + dx / zoom,
      y: prevPan.y + dy / zoom,
    }));
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    handleMouseDown({
      ...e,
      clientX: touch.clientX,
      clientY: touch.clientY,
    } as any);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    handleMouseMove({
      ...e,
      clientX: touch.clientX,
      clientY: touch.clientY,
    } as any);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const supporters = [
    { id: '1', name: 'Supporter 1', imageUrl: '/z.jpg' },
    { id: '2', name: 'Supporter 2', imageUrl: '/jans.jpg' },
  ];

  return (
    <div className="whiteboard-wrapper">
      <div className="whiteboard-container" ref={containerRef}>
        <div className="toolbar">
          <div className="toolbar-group">
            <button
              className={`toolbar-button ${currentTool === 'pen' ? 'active' : ''}`}
              onClick={() => setCurrentTool('pen')}
              title="Pen"
            >
              <FiPenTool />
            </button>
            <button
              className={`toolbar-button ${currentTool === 'eraser' ? 'active' : ''}`}
              onClick={() => setCurrentTool('eraser')}
              title="Eraser"
            >
              <FiEdit2 />
            </button>
            <button
              className={`toolbar-button ${currentTool === 'select' ? 'active' : ''}`}
              onClick={() => setCurrentTool('select')}
              title="Select"
            >
              <FiMousePointer />
            </button>
          </div>
          <div className="toolbar-group">
            <button className="toolbar-button" onClick={handleAddStickyNote} title="Add Note">
              <FiFileText />
            </button>
            <ImageUpload onUpload={handleImageUpload}>
              <button className="toolbar-button" title="Upload Image">
                <FiImage />
              </button>
            </ImageUpload>
          </div>
          <div className="toolbar-group">
            <button className="toolbar-button" onClick={handleClearAll} title="Clear All">
              <FiTrash2 />
            </button>
            <button className="toolbar-button" onClick={handleUndo} disabled={past.length === 0} title="Undo">
              <FiRotateCcw />
            </button>
            <button className="toolbar-button" onClick={handleRedo} disabled={future.length === 0} title="Redo">
              <FiRotateCw />
            </button>
          </div>
          <div className="toolbar-group">
            <button className="toolbar-button" onClick={() => handleZoom(0.1)} title="Zoom In">
              <FiZoomIn />
            </button>
            <button className="toolbar-button" onClick={() => handleZoom(-0.1)} title="Zoom Out">
              <FiZoomOut />
            </button>
          </div>
          {currentTool === 'pen' && (
          <div className="toolbar-group">
              <input
                type="color"
                value={penColor}
                onChange={(e) => setPenColor(e.target.value)}
                className="color-picker"
                title="Pen Color"
              />
              <div className="pen-size-control">
                <button className="toolbar-button" onClick={() => setPenSize(Math.max(1, penSize - 1))} title="Decrease pen size">
              <FiMinus />
            </button>
                <span className="pen-size-display">{penSize}</span>
                <button className="toolbar-button" onClick={() => setPenSize(Math.min(20, penSize + 1))} title="Increase pen size">
              <FiPlus />
            </button>
          </div>
            </div>
          )}
        </div>
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'none' }}
          />
          {objects.map((obj) => {
            if (obj.type === 'stickyNote') {
              return (
                <StickyNote
                  key={obj.id}
                  id={obj.id}
                  content={obj.content}
                  position={obj.position}
                  color={obj.color || getRandomColor()}
                  onUpdate={handleUpdateStickyNote}
                  onDelete={handleDeleteStickyNote}
                />
              );
            } else if (obj.type === 'image') {
              return (
                <Rnd
                  key={obj.id}
                  size={{
                    width: typeof obj.size === 'object' ? obj.size.width : 200,
                    height: typeof obj.size === 'object' ? obj.size.height : 200,
                  }}
                  position={{ x: obj.position.x, y: obj.position.y }}
                  onDragStop={(e, d) =>
                    handleUpdateImage(obj.id, obj.content, { x: d.x, y: d.y }, obj.size)
                  }
                  onResizeStop={(e, direction, ref, delta, position) => {
                    handleUpdateImage(
                      obj.id,
                      obj.content,
                      position,
                      {
                      width: parseInt(ref.style.width),
                      height: parseInt(ref.style.height),
                      }
                    );
                  }}
                  bounds="parent"
                >
                  <img
                    src={obj.content}
                    alt="Uploaded"
                    style={{ width: '100%', height: '100%' }}
                  />
                </Rnd>
              );
            }
            return null;
          })}
        </div>
      </div>
      <SupporterCTA supporters={supporters} />
    </div>
  );
};

export default Whiteboard;