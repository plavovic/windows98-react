import React, { ReactNode } from 'react';
import Draggable from 'react-draggable';
import { X, Minus, Square } from 'lucide-react';

interface WindowProps {
  id: string;
  title: string;
  icon?: ReactNode;
  isOpen: boolean;
  zIndex: number;
  onClose: () => void;
  onFocus: () => void;
  children: ReactNode;
}

export const Window: React.FC<WindowProps> = ({
  title,
  icon,
  isOpen,
  zIndex,
  onClose,
  onFocus,
  children,
}) => {
  if (!isOpen) return null; // Don't render if closed

  return (
    <Draggable handle=".window-header" bounds="parent">
      <div
        onClick={onFocus}
        style={{ zIndex }}
        className="absolute top-12 left-12 w-96 bg-[#c0c0c0] win-border-outset shadow-xl flex flex-col select-none"
      >
        {/* Title Bar (Drag Handle) */}
        <div className="window-header bg-[#000080] text-white px-1.5 py-1 flex items-center justify-between cursor-move">
          <div className="flex items-center gap-1.5 text-xs font-bold truncate">
            {icon}
            <span>{title}</span>
          </div>

          {/* Controls: Minimize, Maximize, Close */}
          <div className="flex items-center gap-1">
            <button className="w-4 h-4 bg-[#c0c0c0] text-black win-border-outset flex items-center justify-center active:win-border-inset">
              <Minus className="w-2.5 h-2.5" />
            </button>
            <button className="w-4 h-4 bg-[#c0c0c0] text-black win-border-outset flex items-center justify-center active:win-border-inset">
              <Square className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={onClose}
              className="w-4 h-4 bg-[#c0c0c0] text-black win-border-outset flex items-center justify-center active:win-border-inset font-bold text-xs"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Window Content Body */}
        <div className="p-2 text-xs flex-1">{children}</div>
      </div>
    </Draggable>
  );
};