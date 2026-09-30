import React, { useState } from 'react';
import { ActiveStencilState, StencilDef } from '../../types/coloring';

interface StencilOverlayProps {
  stencilState: ActiveStencilState;
  setStencilState: React.Dispatch<React.SetStateAction<ActiveStencilState | null>>;
  stencilDef: StencilDef;
  canvasWidth: number;
  canvasHeight: number;
  isDraggingAllowed?: boolean;
}

export const StencilOverlay: React.FC<StencilOverlayProps> = ({
  stencilState,
  setStencilState,
  stencilDef,
  canvasWidth,
  canvasHeight,
  isDraggingAllowed = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isDraggingAllowed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvasWidth;
    const y = ((e.clientY - rect.top) / rect.height) * canvasHeight;
    setIsDragging(true);
    setDragOffset({ x: x - stencilState.x, y: y - stencilState.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvasWidth;
    const y = ((e.clientY - rect.top) / rect.height) * canvasHeight;
    setStencilState(prev => prev ? {
      ...prev,
      x: Math.round(x - dragOffset.x),
      y: Math.round(y - dragOffset.y)
    } : null);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const transformStr = `translate(${stencilState.x}px, ${stencilState.y}px) rotate(${stencilState.rotation}deg) scale(${stencilState.scale}) translate(-100px, -100px)`;

  return (
    <div
      className={`absolute inset-0 select-none z-20 ${
        isDraggingAllowed ? 'pointer-events-auto cursor-move' : 'pointer-events-none'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="w-full h-full"
      >
        <g style={{ transform: transformStr, transformOrigin: '0 0' }}>
          <path
            d={stencilDef.svgPath}
            fill={stencilState.isInverted ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.25)'}
            stroke="#c084fc"
            strokeWidth="3"
            strokeDasharray="6 4"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
    </div>
  );
};
